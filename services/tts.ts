
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

let globalAudioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let lastSpokenText: string = "";

const getAudioContext = () => {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return globalAudioCtx;
};

const playAudio = async (prompt: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
      
      if (currentSource) {
        try { currentSource.stop(); } catch(e) {}
      }

      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
      currentSource = source;
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
};

export const speakQuestion = async (text: string) => {
  const cleanText = text.replace(/\$/g, "").replace(/\\/g, "").substring(0, 350);
  if (cleanText === lastSpokenText) return;
  
  lastSpokenText = cleanText;
  const prompt = `Bạn là nữ MC Miền Tây. Hãy đọc diễn cảm nội dung sau, giọng truyền cảm: "${cleanText}"`;
  await playAudio(prompt);
};

export const playFeedback = async (isCorrect: boolean) => {
  // MC không đọc phản hồi nhận xét khi đã chọn đáp án
  return; 
};
