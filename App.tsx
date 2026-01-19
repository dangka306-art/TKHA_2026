
import React, { useState } from 'react';
import LicenseGate from './components/LicenseGate';
import { generateTopicData } from './services/geminiService';
import { AppLevel, TopicData, UserStats, Subject } from './types';
import { MCQView, TFView, ShortAnswerView } from './components/QuizViews';

const SUBJECT_LIST: { name: Subject; icon: string; color: string }[] = [
  { name: 'Toán học', icon: '📐', color: 'bg-blue-500' },
  { name: 'Ngữ văn', icon: '✍️', color: 'bg-red-500' },
  { name: 'Tiếng anh', icon: '🇬🇧', color: 'bg-indigo-500' },
  { name: 'Vật lý', icon: '⚡', color: 'bg-yellow-500' },
  { name: 'Hóa học', icon: '🧪', color: 'bg-emerald-500' },
  { name: 'Sinh học', icon: '🧬', color: 'bg-green-500' },
  { name: 'Lịch sử', icon: '📜', color: 'bg-orange-500' },
  { name: 'Địa lý', icon: '🌍', color: 'bg-cyan-500' },
  { name: 'Giáo dục kinh tế và pháp luật', icon: '⚖️', color: 'bg-slate-600' },
  { name: 'Hoạt động trải nghiệm hướng nghiệp', icon: '🎭', color: 'bg-pink-500' },
  { name: 'Tin học', icon: '💻', color: 'bg-gray-700' },
];

const App: React.FC = () => {
  const [unlockedSubjects, setUnlockedSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState<TopicData | null>(null);
  const [currentLevel, setCurrentLevel] = useState<AppLevel | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<UserStats>({ score: 0, totalItems: 0, completed: false });

  const handleSubjectClick = (subject: Subject) => {
    if (unlockedSubjects.includes(subject)) {
      setSelectedSubject(subject);
    } else {
      setSelectedSubject(subject);
      setShowGate(true);
    }
  };

  const handleUnlockSubject = (isVip: boolean) => {
    if (isVip) {
      // Unlock all subjects at once
      setUnlockedSubjects(SUBJECT_LIST.map(s => s.name));
    } else if (selectedSubject && !unlockedSubjects.includes(selectedSubject)) {
      setUnlockedSubjects([...unlockedSubjects, selectedSubject]);
    }
    setShowGate(false);
  };

  const handleGenerate = async () => {
    if (!selectedSubject || !topic.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setData(null);

    try {
      const result = await generateTopicData(selectedSubject, topic);
      if (result && result.sieuDe) {
        setData(result);
      } else {
        throw new Error("Không thể khởi tạo tri thức. Hãy thử lại.");
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const startLevel = (level: AppLevel) => {
    setCurrentLevel(level);
    setCurrentIndex(0);
    let total = 0;
    if (level === AppLevel.SIEU_DE) total = data?.sieuDe.length || 0;
    else if (level === AppLevel.THU_SUC) total = (data?.thuSuc.length || 0) * 4;
    else if (level === AppLevel.VE_DICH) total = data?.veDich.length || 0;
    setStats({ score: 0, totalItems: total, completed: false });
  };

  const handleNext = (correctCount: number = 0) => {
    setStats(prev => ({ ...prev, score: prev.score + correctCount }));
    const len = currentLevel === AppLevel.SIEU_DE ? data?.sieuDe.length 
              : currentLevel === AppLevel.THU_SUC ? data?.thuSuc.length 
              : data?.veDich.length;

    if (currentIndex + 1 < (len || 0)) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStats(prev => ({ ...prev, completed: true }));
    }
  };

  const isExcellent = stats.score === stats.totalItems && stats.totalItems > 0;

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f0fdf4] p-6 flex flex-col items-center justify-center">
        {showGate && selectedSubject && (
          <LicenseGate 
            subject={selectedSubject} 
            onUnlock={handleUnlockSubject} 
            onBack={() => { setShowGate(false); setSelectedSubject(null); }} 
          />
        )}
        
        <div className="max-w-4xl w-full bg-white p-12 rounded-[60px] shadow-2xl relative border-b-[20px] border-emerald-100">
          {loading && (
            <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center rounded-[60px] backdrop-blur-md">
               <div className="w-24 h-24 border-8 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-8 shadow-inner"></div>
               <p className="text-3xl font-black text-emerald-700 animate-pulse text-center px-6 uppercase tracking-tighter">
                  Đang khởi tạo tri thức độc bản...
                  <span className="text-sm font-bold text-slate-400 tracking-widest mt-4 block">Hệ thống đang nạp dữ liệu chuyên sâu</span>
               </p>
            </div>
          )}
          
          <div className="text-center">
            <h1 className="text-8xl font-black text-emerald-700 mb-2 tracking-tighter">TKHA_2026</h1>
            <p className="text-xl text-slate-400 font-bold mb-12 italic tracking-widest uppercase">Hệ thống luyện thi ĐGNL 2018 - Premium</p>
            
            <div className="mb-12 text-left">
              <label className="text-sm font-black text-emerald-600 ml-4 uppercase tracking-[0.3em] mb-6 block">I. CHỌN MÔN HỌC:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-2 border-slate-50 rounded-[40px] bg-slate-50/30 shadow-inner">
                {SUBJECT_LIST.map(s => {
                  const isUnlocked = unlockedSubjects.includes(s.name);
                  return (
                    <button key={s.name} onClick={() => handleSubjectClick(s.name)}
                      className={`p-6 rounded-3xl flex flex-col items-center gap-4 transition-all transform hover:scale-105 relative ${selectedSubject === s.name ? 'bg-emerald-600 text-white shadow-2xl scale-105' : 'bg-white text-slate-600 hover:bg-emerald-50 shadow-sm'} ${!isUnlocked && selectedSubject !== s.name ? 'opacity-80' : ''}`}>
                      <span className="text-5xl">{s.icon}</span>
                      <span className="text-[11px] font-black uppercase text-center leading-tight">{s.name}</span>
                      {!isUnlocked && <span className="absolute top-2 right-2 text-xs bg-slate-100 p-1 rounded-full border border-slate-200 shadow-sm">🔒</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-left space-y-8">
              <label className="text-sm font-black text-emerald-600 ml-4 uppercase tracking-[0.3em]">II. NHẬP CHỦ ĐỀ CẦN LUYỆN:</label>
              <input type="text" placeholder="Ví dụ: Đạo hàm, Chí Phèo, Pháp luật lao động..." value={topic} onChange={(e) => { setTopic(e.target.value); setErrorMsg(''); }} 
                className={`w-full p-10 rounded-[40px] border-4 focus:border-emerald-500 outline-none text-3xl font-bold bg-slate-50 shadow-inner transition-all ${errorMsg ? 'border-red-500 animate-shake' : 'border-slate-50'}`} />
              
              {errorMsg && (
                <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-200 text-red-600 font-black text-center animate-bounce">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button onClick={handleGenerate} disabled={!selectedSubject || !unlockedSubjects.includes(selectedSubject) || !topic.trim() || loading}
                className="w-full py-10 bg-emerald-600 text-white font-black text-4xl rounded-[40px] shadow-2xl hover:bg-emerald-700 transition-all transform active:scale-95 disabled:bg-slate-200 disabled:cursor-not-allowed border-b-[10px] border-emerald-800 uppercase tracking-tighter"
              >
                {loading ? 'ĐANG PHÂN TÍCH...' : 'BẮT ĐẦU LUYỆN TẬP 🚀'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-medium">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-10 rounded-[50px] shadow-xl mb-12 flex flex-col md:flex-row justify-between items-center border-b-8 border-emerald-50 transition-all gap-6">
          <div className="text-center md:text-left">
            <span className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em]">{data.subject}</span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mt-3 uppercase">📖 CHỦ ĐỀ: {data.topic}</h1>
          </div>
          <button onClick={() => { setData(null); setCurrentLevel(null); }} className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black hover:bg-black transition-all active:scale-95 shadow-xl whitespace-nowrap">ĐỔI CHỦ ĐỀ</button>
        </div>

        {!currentLevel ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <LevelCard title="SIÊU DỄ" icon="🌱" color="green" desc="12 câu trắc nghiệm MCQ chuyên sâu" onClick={() => startLevel(AppLevel.SIEU_DE)} />
            <LevelCard title="THỬ SỨC" icon="🔥" color="orange" desc="4 câu Đúng/Sai tư duy logic" onClick={() => startLevel(AppLevel.THU_SUC)} />
            <LevelCard title="VỀ ĐÍCH" icon="🏆" color="blue" desc="6 câu trả lời ngắn vận dụng cao" onClick={() => startLevel(AppLevel.VE_DICH)} />
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[60px] shadow-2xl border-l-[30px] border-emerald-600 relative overflow-hidden transition-all">
             {!stats.completed ? (
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 pb-8 border-b-2 border-slate-50 gap-4">
                  <h2 className="text-4xl md:text-5xl font-black text-emerald-700 uppercase tracking-tighter text-center md:text-left">{currentLevel.replace('_', ' ')}</h2>
                  <div className="text-right bg-emerald-50 px-10 py-6 rounded-[35px] border-2 border-emerald-100 shadow-sm">
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Điểm Tích Lũy</p>
                    <div className="text-5xl md:text-6xl font-black text-emerald-700">{stats.score}</div>
                  </div>
                </div>
                {currentLevel === AppLevel.SIEU_DE && data.sieuDe[currentIndex] && <MCQView key={currentIndex} question={data.sieuDe[currentIndex]} onNext={handleNext} />}
                {currentLevel === AppLevel.THU_SUC && data.thuSuc[currentIndex] && <TFView key={currentIndex} question={data.thuSuc[currentIndex]} onNext={handleNext} />}
                {currentLevel === AppLevel.VE_DICH && data.veDich[currentIndex] && <ShortAnswerView key={currentIndex} question={data.veDich[currentIndex]} onNext={handleNext} />}
              </div>
            ) : (
              <div className="flex flex-col items-center py-24 text-center animate-in zoom-in duration-700">
                <div className="text-[120px] md:text-[150px] mb-12 animate-bounce">{isExcellent ? '👑' : '📚'}</div>
                <h2 className="text-5xl md:text-8xl font-black text-slate-800 mb-8 tracking-tighter">
                  {isExcellent ? 'XUẤT SẮC TUYỆT ĐỐI!' : 'KẾT QUẢ LUYỆN TẬP!'}
                </h2>
                <div className={`p-12 md:p-20 rounded-[80px] border-[12px] border-white shadow-2xl mb-20 relative ${isExcellent ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                  <div className={`text-[120px] md:text-[180px] leading-none font-black ${isExcellent ? 'text-emerald-700' : 'text-orange-700'}`}>{stats.score}<span className="text-3xl md:text-5xl text-slate-400 font-bold ml-4">/{stats.totalItems}</span></div>
                  <p className={`text-xl md:text-3xl font-black uppercase tracking-[0.3em] mt-10 ${isExcellent ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {isExcellent ? 'CHÚC MỪNG BẠN ĐÃ CHINH PHỤC TOÀN BỘ!' : 'HÃY CỐ GẮNG HƠN ĐỂ ĐẠT ĐIỂM TUYỆT ĐỐI.'}
                  </p>
                </div>
                <button onClick={() => setCurrentLevel(null)} className="px-16 md:px-24 py-8 md:py-10 bg-slate-900 text-white font-black rounded-[40px] shadow-2xl hover:bg-black text-2xl md:text-4xl transform active:scale-95 transition-all">TRỞ VỀ MENU 🏠</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const LevelCard: React.FC<{ title: string; icon: string; color: string; desc: string; onClick: () => void }> = ({ title, icon, color, desc, onClick }) => {
  const colorMap: any = { green: 'border-emerald-500 text-emerald-700', orange: 'border-orange-500 text-orange-700', blue: 'border-blue-600 text-blue-800' };
  return (
    <div onClick={onClick} className={`bg-white p-12 rounded-[60px] shadow-2xl border-t-[15px] transition-all cursor-pointer transform hover:-translate-y-6 flex flex-col items-center text-center group ${colorMap[color]}`}>
      <div className="text-8xl md:text-9xl mb-8 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">{title.replace('_', ' ')}</h3>
      <p className="text-slate-400 font-bold mb-10 italic text-lg leading-snug h-20">{desc}</p>
      <button className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg uppercase tracking-[0.2em] shadow-lg group-hover:bg-black">VÀO HỌC</button>
    </div>
  );
};

export default App;
