
import { GoogleGenAI, Type } from "@google/genai";
import { TopicData } from "../types";

export const generateTopicData = async (topic: string): Promise<TopicData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const randomEntropy = Math.random().toString(36).substring(7);
  const timestamp = new Date().toISOString();

  const prompt = `
    Bạn là một chuyên gia toán học và thiết kế đề thi THPT Quốc gia theo chương trình 2018. 
    Hãy soạn bộ câu hỏi cho chủ đề: "${topic}". Phiên bản: ${randomEntropy}.

    QUY TẮC TOÁN HỌC (PROM TOAN):
    1. Sử dụng LaTeX chuẩn cho TẤT CẢ công thức: $\cdot$ (phải có \), $\frac{a}{b}$, $a^{n}$, $\sqrt{x}$.
    2. CÁC LỆNH LATEX PHẢI CÓ DẤU GẠCH CHÉO NGƯỢC (\).

    QUY TẮC "CLEAN TEXT" (CỰC KỲ QUAN TRỌNG):
    1. TUYỆT ĐỐI KHÔNG được chèn đáp án (Đúng/Sai), từ khóa "Đáp án là...", hoặc bất kỳ lời giải thích nào vào các trường: 'question', 'context', 'statement'.
    2. Trường 'statement' (trong phần Đúng/Sai) chỉ được chứa một mệnh đề khẳng định duy nhất để người học đánh giá. Không kèm theo dấu hỏi hay giải thích bên trong.
    3. Mọi lời giải, lập luận và đáp án chi tiết BẮT BUỘC phải nằm riêng trong trường 'explanation'.
    4. KHÔNG sử dụng các định dạng như "(Đúng/Sai?)" hoặc "- Đáp án: ..." trong nội dung câu hỏi.

    CẤU TRÚC ĐỀ THI:
    - 12 câu MCQ (Sơ đẳng).
    - 4 câu Đúng/Sai (Mỗi câu gồm 1 context và 4 sub-statements độc lập).
    - 6 câu Điền số (Vận dụng cao).

    JSON phải đúng cấu trúc schema và KHÔNG được rò rỉ đáp án vào nội dung văn bản câu hỏi.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      temperature: 1.0,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
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
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING }
                    }
                  }
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["id", "question", "options", "correctAnswer", "explanation"]
            }
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
                    properties: {
                      id: { type: Type.NUMBER },
                      statement: { type: Type.STRING },
                      correctAnswer: { type: Type.BOOLEAN }
                    }
                  }
                },
                explanation: { type: Type.STRING }
              },
              required: ["id", "context", "subQuestions", "explanation"]
            }
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
              },
              required: ["id", "question", "correctAnswer", "explanation"]
            }
          }
        },
        required: ["topic", "sieuDe", "thuSuc", "veDich"]
      }
    }
  });

  return JSON.parse(response.text);
};
