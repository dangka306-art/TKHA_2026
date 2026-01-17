
import React, { useState, useEffect } from 'react';
import { MCQQuestion, TFQuestion, ShortAnswerQuestion } from '../types';
import { playFeedback } from '../services/tts';

declare global {
  interface Window {
    MathJax: any;
  }
}

/**
 * Hàm tiền xử lý để sửa lỗi LaTeX phổ biến của AI
 */
const formatMath = (text: string) => {
  if (!text) return "";
  // Xử lý các trường hợp AI quên dấu gạch chéo ngược
  return text
    .replace(/(\$)\s*cdot/g, '$1\\cdot') 
    .replace(/(\d)\s*cdot/g, '$1\\cdot')
    .replace(/(\$)\s*times/g, '$1\\times')
    .replace(/(\d)\s*times/g, '$1\\times')
    .replace(/(\$)\s*frac/g, '$1\\frac')
    .replace(/(\$)\s*sqrt/g, '$1\\sqrt')
    // Loại bỏ các đoạn text AI thường tự chèn vào nội dung câu hỏi
    .replace(/\(Đúng\/Sai\?\)/gi, "")
    .replace(/- Đáp án là.*/gi, "")
    .replace(/-\s*Đáp án:.*/gi, "");
};

const useMathJax = (deps: any[]) => {
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      setTimeout(() => {
        window.MathJax.typesetPromise().catch((err: any) => console.log('MathJax error:', err));
      }, 100);
    }
  }, deps);
};

export const MCQView: React.FC<{ question: MCQQuestion; onNext: (correctCount: number) => void }> = ({ question, onNext }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useMathJax([question, isLocked]);

  const handleSelect = (id: string) => {
    if (isLocked) return;
    setSelected(id);
    setIsLocked(true);
    
    const isCorrect = id === question.correctAnswer;
    playFeedback(isCorrect);
    
    setTimeout(() => {
      onNext(isCorrect ? 1 : 0);
    }, 7000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-3xl border-2 border-green-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 leading-relaxed">{formatMath(question.question)}</h3>
      </div>
      
      {!isLocked ? (
        <div className="grid grid-cols-1 gap-4">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className="p-5 text-left border-2 border-gray-100 rounded-2xl transition-all flex items-center gap-4 bg-white hover:border-green-400 hover:bg-green-50 active:scale-95"
            >
              <span className="w-10 h-10 flex items-center justify-center rounded-full font-black bg-green-100 text-green-700">
                {opt.id}
              </span>
              <span className="text-lg font-medium">{formatMath(opt.text)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className={`p-8 rounded-3xl border-4 shadow-xl animate-in zoom-in ${selected === question.correctAnswer ? 'bg-green-50 border-green-500 text-green-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{selected === question.correctAnswer ? '🌟' : '😅'}</span>
            <h4 className="text-2xl font-black">{selected === question.correctAnswer ? 'Bạn giỏi quá!' : 'Cố gắng câu sau nha!'}</h4>
          </div>
          <div className="space-y-4">
             <p className="text-lg"><strong>Đáp án đúng:</strong> <span className="bg-green-200 px-2 py-1 rounded font-black">{question.correctAnswer}</span></p>
             <div className="bg-white/80 p-6 rounded-2xl border border-white shadow-inner">
                <p className="text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Lời giải chi tiết:</p>
                <div className="text-lg italic leading-relaxed text-gray-700 math-content">
                  {formatMath(question.explanation)}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TFView: React.FC<{ question: TFQuestion; onNext: (correctCount: number) => void }> = ({ question, onNext }) => {
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [isChecked, setIsChecked] = useState(false);
  
  useMathJax([question, isChecked]);

  const isComplete = question.subQuestions.every(sq => answers[sq.id] !== undefined && answers[sq.id] !== null);

  const handleSubmit = () => {
    setIsChecked(true);
    const correctItems = question.subQuestions.filter(sq => answers[sq.id] === sq.correctAnswer).length;
    playFeedback(correctItems === 4);
    
    setTimeout(() => {
      onNext(correctItems);
    }, 9000);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-100 shadow-sm">
        <p className="text-lg text-gray-800 leading-relaxed font-semibold">{formatMath(question.context)}</p>
      </div>
      
      <div className="space-y-4">
        {question.subQuestions.map((sq, idx) => {
          const labels = ['a', 'b', 'c', 'd'];
          const isUserCorrect = answers[sq.id] === sq.correctAnswer;
          
          return (
            <div key={sq.id} className={`flex flex-col p-5 bg-white rounded-2xl border-2 transition-all ${isChecked ? (isUserCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-100 shadow-sm'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="flex-1 text-gray-700 font-medium">
                  <span className="font-black text-orange-600 mr-2 text-xl">{labels[idx]})</span>
                  {formatMath(sq.statement)}
                </p>
                <div className="flex gap-2">
                  {[true, false].map(val => (
                    <button
                      key={val.toString()}
                      disabled={isChecked}
                      onClick={() => setAnswers(prev => ({ ...prev, [sq.id]: val }))}
                      className={`px-8 py-3 rounded-xl font-bold transition-all text-lg ${
                        answers[sq.id] === val 
                          ? (isChecked ? (val === sq.correctAnswer ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-orange-500 text-white shadow-lg scale-105')
                          : (isChecked && val === sq.correctAnswer ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-50 text-gray-300')
                      }`}
                    >
                      {val ? 'Đúng' : 'Sai'}
                    </button>
                  ))}
                </div>
              </div>
              {isChecked && (
                <div className={`mt-3 pt-3 border-t text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${isUserCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isUserCorrect ? '✅ Đúng rồi!' : `❌ Đáp án chuẩn là: ${sq.correctAnswer ? 'Đúng' : 'Sai'}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isChecked ? (
        <button
          disabled={!isComplete}
          onClick={handleSubmit}
          className={`w-full py-6 rounded-3xl font-black text-2xl shadow-xl transition-all transform active:scale-95 ${isComplete ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          Xác nhận bài làm 🏁
        </button>
      ) : (
        <div className="bg-white p-8 rounded-3xl border-4 border-orange-200 shadow-2xl animate-in zoom-in duration-500">
           <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📝</span>
              <h4 className="font-black text-orange-800 uppercase tracking-widest text-lg">Phân tích Toán học:</h4>
           </div>
           <div className="text-gray-700 leading-relaxed text-xl italic math-explanation">
              {formatMath(question.explanation)}
           </div>
        </div>
      )}
    </div>
  );
};

export const ShortAnswerView: React.FC<{ question: ShortAnswerQuestion; onNext: (correctCount: number) => void }> = ({ question, onNext }) => {
  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  useMathJax([question, showResult]);

  const handleCheck = () => {
    const userAns = input.trim().replace(',', '.');
    const correctAns = question.correctAnswer.trim().replace(',', '.');
    
    const check = userAns === correctAns || 
                  (parseFloat(userAns) === parseFloat(correctAns)) ||
                  (correctAns.toLowerCase().includes(userAns.toLowerCase()) && userAns.length > 0 && userAns.length > correctAns.length / 2);
    
    setIsCorrect(check);
    setShowResult(true);
    playFeedback(check);

    setTimeout(() => {
      onNext(check ? 1 : 0);
    }, 8000);
  };

  return (
    <div className="space-y-6 animate-in zoom-in duration-500">
      <div className="bg-blue-50 p-8 rounded-3xl border-2 border-blue-100 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 leading-relaxed">{formatMath(question.question)}</h3>
      </div>
      
      {!showResult ? (
        <div className="space-y-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Gõ đáp án số hoặc biểu thức..."
            className="w-full p-8 rounded-3xl border-4 border-gray-100 focus:border-blue-500 outline-none text-2xl font-bold shadow-inner bg-white text-center"
          />
          <button
            onClick={handleCheck}
            disabled={!input.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-black py-6 rounded-3xl shadow-2xl transition-all transform active:scale-95 text-2xl shadow-blue-200"
          >
            Nộp bài Về Đích 🚀
          </button>
        </div>
      ) : (
        <div className={`p-10 rounded-[40px] border-4 shadow-2xl ${isCorrect ? 'bg-green-50 border-green-500 text-green-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
          <div className="flex items-center gap-6 mb-6">
            <span className="text-6xl">{isCorrect ? '🏆' : '💪'}</span>
            <h4 className="text-4xl font-black">{isCorrect ? 'Tuyệt đỉnh!' : 'Cố gắng nhé!'}</h4>
          </div>
          <div className="space-y-6">
             <div className="bg-white/60 p-6 rounded-2xl">
                <p className="text-sm font-black uppercase opacity-50 mb-1">Kết quả chuẩn xác:</p>
                <p className="text-4xl font-black text-blue-700">{formatMath(question.correctAnswer)}</p>
             </div>
             <div className="bg-white p-8 rounded-3xl shadow-sm">
                <p className="text-xs font-black uppercase text-gray-400 mb-3 tracking-widest">Lời giải chi tiết:</p>
                <div className="text-xl leading-relaxed text-gray-800 italic">
                  {formatMath(question.explanation)}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
