
export enum AppLevel {
  SIEU_DE = 'SIEU_DE',
  THU_SUC = 'THU_SUC',
  VE_DICH = 'VE_DICH'
}

export type Subject = 
  | 'Toán học' | 'Ngữ văn' | 'Vật lý' | 'Hóa học' | 'Sinh học' 
  | 'Tiếng anh' | 'Địa lý' | 'Lịch sử' | 'Giáo dục kinh tế và pháp luật' 
  | 'Hoạt động trải nghiệm hướng nghiệp' | 'Tin học';

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
  explanation: string;
}

export interface ShortAnswerQuestion {
  id: number;
  question: string;
  correctAnswer: string;
  explanation: string;
}

export interface TopicData {
  topic: string;
  subject: Subject;
  sieuDe: MCQQuestion[];
  thuSuc: TFQuestion[];
  veDich: ShortAnswerQuestion[];
}

export interface UserStats {
  score: number;
  totalItems: number;
  completed: boolean;
}
