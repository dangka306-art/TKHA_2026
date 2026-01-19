
import { GoogleGenAI, Type } from "@google/genai";
import { TopicData, Subject } from "../types";

export const generateTopicData = async (subject: Subject, topic: string): Promise<TopicData> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Tăng cường chỉ thị về tính đa dạng và số lượng chính xác
  const prompt = `
    Bạn là một chuyên gia khảo thí hàng đầu. Hãy tạo một bộ đề luyện tập ĐỘC BẢN cho chủ đề: "${topic}" môn ${subject}.
    
    YÊU CẦU SỐ LƯỢNG CHÍNH XÁC:
    1. sieuDe: 12 câu hỏi trắc nghiệm 4 lựa chọn (MCQ) - Mức độ Nhận biết/Thông hiểu.
    2. thuSuc: 4 câu hỏi Đúng/Sai (mỗi câu gồm ngữ liệu context và 4 ý statement a, b, c, d) - Mức độ Thông hiểu/Vận dụng.
    3. veDich: 6 câu hỏi trả lời ngắn (điền đáp án ngắn gọn) - Mức độ Vận dụng cao.
    
    NGUYÊN TẮC "ĐỘC BẢN & ĐA DẠNG":
    - Tuyệt đối không lặp lại các câu hỏi phổ thông có sẵn trên mạng.
    - Mỗi câu hỏi phải khai thác một khía cạnh khác nhau của chủ đề.
    - Đảm bảo tính khoa học, chính xác 100%.
    - Sử dụng LaTeX $...$ cho mọi biểu thức toán học, công thức hóa học hoặc ký hiệu vật lý.
    - Lời giải (explanation) cần súc tích, tập trung vào phương pháp tư duy.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        temperature: 0.8, // Tăng temperature để tạo sự đa dạng, sáng tạo trong câu hỏi
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            subject: { type: Type.STRING },
            sieuDe: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { id: { type: Type.STRING }, text: { type: Type.STRING } } 
                    } 
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              },
              minItems: 12,
              maxItems: 12
            },
            thuSuc: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  context: { type: Type.STRING },
                  subQuestions: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { id: { type: Type.NUMBER }, statement: { type: Type.STRING }, correctAnswer: { type: Type.BOOLEAN } } 
                    },
                    minItems: 4,
                    maxItems: 4
                  },
                  explanation: { type: Type.STRING }
                }
              },
              minItems: 4,
              maxItems: 4
            },
            veDich: {
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  id: { type: Type.NUMBER }, 
                  question: { type: Type.STRING }, 
                  correctAnswer: { type: Type.STRING }, 
                  explanation: { type: Type.STRING } 
                } 
              },
              minItems: 6,
              maxItems: 6
            }
          },
          required: ["topic", "sieuDe", "thuSuc", "veDich"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (err) {
    console.error("Gemini Error:", err);
    throw new Error("Không thể khởi tạo bộ đề đa dạng ngay lúc này. Hãy thử lại sau vài giây.");
  }
};
