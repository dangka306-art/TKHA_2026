
export enum AppLevel {
  SIEU_DE = 'SIEU_DE',
  THU_SUC = 'THU_SUC',
  VE_DICH = 'VE_DICH'
}

export interface Option {
  id: string;
  text: string;
}

export interface MCQQuestion {
  id: number;
  question: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
}

export interface TFSubQuestion {
  id: number;
  statement: string;
  correctAnswer: boolean;
}

export interface TFQuestion {
  id: number;
  context: string;
  subQuestions: TFSubQuestion[];
  explanation: string; // Giải thích chung cho cả 4 ý hoặc từng ý
}

export interface ShortAnswerQuestion {
  id: number;
  question: string;
  correctAnswer: string;
  explanation: string;
}

export interface TopicData {
  topic: string;
  sieuDe: MCQQuestion[];
  thuSuc: TFQuestion[];
  veDich: ShortAnswerQuestion[];
}

export interface UserStats {
  score: number;
  totalItems: number; // Tổng số mục (câu trắc nghiệm hoặc số ý đúng/sai)
  completed: boolean;
}
