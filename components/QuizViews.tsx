
import React, { useState, useEffect } from 'react';
import { MCQQuestion, TFQuestion, ShortAnswerQuestion } from '../types';
import { playFeedback, speakQuestion } from '../services/tts';

declare global { interface Window { MathJax: any; } }

const formatMath = (text: string) => {
  if (!text) return "";
  let cleaned = text
    .replace(/context\s*[:\-]/gi, "")
    .replace(/Explanation\s*[:\-]/gi, "")
    .replace(/CorrectAnswer\s*[:\-]/gi, "")
    .replace(/Question\s*[:\-]/gi, "")
    .replace(/Answer\s*[:\-]/gi, "")
    .replace(/Statement\s*[a-d]?\s*[:\-]/gi, "")
    .replace(/(\$)\s*cdot/g, '$1\\cdot') 
    .replace(/(\d)\s*cdot/g, '$1\\cdot')
    .replace(/(\$)\s*frac/g, '$1\\frac')
    .replace(/(\$)\s*sqrt/g, '$1\\sqrt')
    .trim();
  return cleaned;
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

  useEffect(() => {
    speakQuestion(question.question);
  }, [question.id]);

  const handleSelect = (id: string) => {
    if (isLocked) return;
    setSelected(id);
    setIsLocked(true);
    playFeedback(id === question.correctAnswer);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[40px] border-2 border-green-100 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 leading-relaxed">{formatMath(question.question)}</h3>
      </div>
      {!isLocked ? (
        <div className="grid grid-cols-1 gap-4">
          {question.options.map((opt) => (
            <button key={opt.id} onClick={() => handleSelect(opt.id)} className="p-6 text-left border-2 border-gray-100 rounded-2xl transition-all flex items-center gap-4 bg-white hover:border-green-400 hover:shadow-lg">
              <span className="w-12 h-12 flex items-center justify-center rounded-full font-black bg-green-50 text-green-700 border-2 border-green-100">{opt.id}</span>
              <span className="text-xl font-medium">{formatMath(opt.text)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`p-10 rounded-[40px] border-4 shadow-2xl animate-in zoom-in ${selected === question.correctAnswer ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
            <h4 className="text-3xl font-black mb-6 text-center">{selected === question.correctAnswer ? '🏆 Tuyệt vời!' : '💪 Rút kinh nghiệm nè!'}</h4>
            <div className="bg-white p-8 rounded-3xl border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 mb-2">Phân tích lời giải:</p>
              <div className="text-xl italic text-gray-700 leading-relaxed">{formatMath(question.explanation)}</div>
            </div>
          </div>
          <button onClick={() => onNext(selected === question.correctAnswer ? 1 : 0)} className="w-full bg-gray-900 text-white font-black py-8 rounded-[30px] text-2xl shadow-xl hover:bg-black transition-all">CÂU TIẾP THEO ➡️</button>
        </div>
      )}
    </div>
  );
};

export const TFView: React.FC<{ question: TFQuestion; onNext: (correctCount: number) => void }> = ({ question, onNext }) => {
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [isChecked, setIsChecked] = useState(false);
  
  useMathJax([question, isChecked]);

  useEffect(() => {
    speakQuestion(question.context);
  }, [question.id]);

  const subQuestions = (question.subQuestions || []).slice(0, 4);
  const isComplete = subQuestions.every(sq => answers[sq.id] !== undefined && answers[sq.id] !== null);

  const handleSubmit = () => {
    setIsChecked(true);
    const correctCount = subQuestions.filter(sq => answers[sq.id] === sq.correctAnswer).length;
    playFeedback(correctCount === 4);
  };

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 p-10 rounded-[40px] border-2 border-orange-100 shadow-sm">
        <p className="text-2xl text-gray-800 font-bold leading-relaxed">{formatMath(question.context)}</p>
      </div>
      <div className="space-y-4">
        {subQuestions.map((sq, idx) => (
          <div key={sq.id} className={`p-8 bg-white rounded-3xl border-2 transition-all ${isChecked ? (answers[sq.id] === sq.correctAnswer ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <p className="flex-1 text-xl text-gray-700 font-semibold">
                <span className="font-black text-orange-600 mr-2 uppercase">{['a','b','c','d'][idx]})</span>
                {formatMath(sq.statement)}
              </p>
              <div className="flex gap-3">
                {[true, false].map(val => (
                  <button key={val.toString()} disabled={isChecked} onClick={() => setAnswers(prev => ({ ...prev, [sq.id]: val }))}
                    className={`px-10 py-4 rounded-2xl font-black text-xl transition-all ${answers[sq.id] === val ? 'bg-orange-500 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-300'}`}>
                    {val ? 'Đúng' : 'Sai'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!isChecked ? (
        <button disabled={!isComplete} onClick={handleSubmit} className={`w-full py-8 rounded-[30px] font-black text-3xl shadow-xl transition-all ${isComplete ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>XÁC NHẬN 🏁</button>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[40px] border-4 border-orange-200 shadow-xl animate-in slide-in-from-bottom">
             <h4 className="font-black text-orange-800 mb-4 uppercase tracking-widest text-sm">HƯỚNG DẪN TƯ DUY:</h4>
             <div className="text-xl text-gray-700 italic leading-relaxed">{formatMath(question.explanation)}</div>
          </div>
          <button onClick={() => onNext(subQuestions.filter(sq => answers[sq.id] === sq.correctAnswer).length)} className="w-full bg-gray-900 text-white font-black py-8 rounded-[30px] text-2xl shadow-xl hover:bg-black transition-all">CÂU TIẾP THEO ➡️</button>
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

  useEffect(() => {
    speakQuestion(question.question);
  }, [question.id]);

  const handleCheck = () => {
    const userAns = input.trim().toLowerCase().replace(',', '.');
    const correctAns = question.correctAnswer.toString().trim().toLowerCase().replace(',', '.');
    const check = userAns === correctAns || (parseFloat(userAns) === parseFloat(correctAns));
    setIsCorrect(check);
    setShowResult(true);
    playFeedback(check);
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-12 rounded-[50px] border-2 border-blue-100 text-center shadow-sm">
        <h3 className="text-3xl font-black text-gray-800 leading-relaxed">{formatMath(question.question)}</h3>
      </div>
      {!showResult ? (
        <div className="space-y-8">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập đáp án chính xác..." className="w-full p-10 rounded-[35px] border-4 border-gray-100 text-center text-5xl font-black shadow-inner outline-none focus:border-blue-500 transition-all bg-white" />
          <button onClick={handleCheck} disabled={!input.trim()} className="w-full bg-blue-600 text-white font-black py-8 rounded-[35px] text-3xl shadow-2xl hover:bg-blue-700 transition-all transform active:scale-95">NỘP BÀI 🚀</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`p-12 rounded-[60px] border-4 shadow-2xl animate-in zoom-in ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
            <h4 className="text-4xl font-black mb-8 text-center">{isCorrect ? '👑 XUẤT SẮC!' : '💪 CỐ GẮNG LÊN!'}</h4>
            <div className="bg-white p-10 rounded-[40px] shadow-sm">
              <p className="text-xs font-black text-gray-400 mb-4 uppercase">GIẢI CHI TIẾT:</p>
              <div className="text-2xl italic text-gray-700 leading-relaxed">{formatMath(question.explanation)}</div>
            </div>
          </div>
          <button onClick={() => onNext(isCorrect ? 1 : 0)} className="w-full bg-gray-900 text-white font-black py-8 rounded-[30px] text-2xl shadow-xl hover:bg-black transition-all">CÂU TIẾP THEO ➡️</button>
        </div>
      )}
    </div>
  );
};
