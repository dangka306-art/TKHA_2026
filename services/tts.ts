
import { GoogleGenAI, Modality } from "@google/genai";

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const playFeedback = async (isCorrect: boolean) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return;

  const ai = new GoogleGenAI({ apiKey });
  
  // Mien Tay Vietnamese dialect phrases
  const prompt = isCorrect 
    ? "Nói bằng giọng nữ miền tây, chất phác: 'Đúng rồi nè, giỏi quá xá luôn cưng ơi!'" 
    : "Nói bằng giọng nữ miền tây, chất phác: 'Sai mất tiêu rồi nè, không sao đâu, ráng lên chút xíu nữa nghen!'";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Closest available female voice profile
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
      const source = outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS Error:", error);
    // Fallback to browser TTS if Gemini fails
    const utter = new SpeechSynthesisUtterance(isCorrect ? "Đúng rồi, giỏi quá!" : "Tiếc quá, sai rồi!");
    utter.lang = 'vi-VN';
    window.speechSynthesis.speak(utter);
  }
};
