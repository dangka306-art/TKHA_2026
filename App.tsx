
import React, { useState, useEffect, useRef } from 'react';
import LicenseGate from './components/LicenseGate';
import { generateTopicData } from './services/geminiService';
import { AppLevel, TopicData, UserStats } from './types';
import { MCQView, TFView, ShortAnswerView } from './components/QuizViews';

const App: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [data, setData] = useState<TopicData | null>(null);
  const [currentLevel, setCurrentLevel] = useState<AppLevel | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<UserStats>({ score: 0, totalItems: 0, completed: false });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadingMessages = [
    "Đang phân tích cấu trúc 2018...",
    "Đang lồng ghép tình huống thực tế...",
    "Đang kiểm tra tính độc bản của câu hỏi...",
    "Đang tối ưu hóa lời giải chi tiết...",
    "Sắp xong rồi, đợi chút xíu nghen!"
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3');
    audio.loop = true;
    audio.volume = 0.15;
    audioRef.current = audio;
    return () => audio.pause();
  }, []);

  const startMusic = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setLoadingStep(0);
    try {
      const result = await generateTopicData(topic);
      setData(result);
      startMusic();
    } catch (error) {
      alert("Hệ thống đang bận soạn đề, vui lòng nhấn thử lại nha!");
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

  const handleNext = (correctCount: number) => {
    setStats(prev => ({ ...prev, score: prev.score + correctCount }));
    
    const questionsLength = currentLevel === AppLevel.SIEU_DE ? data?.sieuDe.length 
                        : currentLevel === AppLevel.THU_SUC ? data?.thuSuc.length 
                        : data?.veDich.length;

    if (currentIndex + 1 < (questionsLength || 0)) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStats(prev => ({ ...prev, completed: true }));
    }
  };

  if (!isUnlocked) return <LicenseGate onUnlock={() => setIsUnlocked(true)} />;

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f0fdf4] p-6 flex flex-col items-center justify-center font-['Quicksand']">
        <div className="max-w-3xl w-full bg-white p-12 rounded-[40px] shadow-2xl border-b-[12px] border-green-200 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
               <div className="w-24 h-24 border-8 border-green-100 border-t-green-500 rounded-full animate-spin mb-8"></div>
               <p className="text-2xl font-black text-green-700 animate-pulse">{loadingMessages[loadingStep]}</p>
               <p className="text-sm text-gray-400 mt-4 italic">Mỗi bộ đề đều được AI soạn thảo riêng biệt...</p>
            </div>
          )}

          <div className="relative z-10 text-center">
            <h1 className="text-7xl font-black text-green-700 mb-2 tracking-tight">TKHA_2026</h1>
            <p className="text-xl text-gray-500 font-bold mb-10 italic">"Kiến thức của bạn là duy nhất, đề thi cũng vậy" 🚀</p>
            <div className="space-y-8">
              <div className="group text-left">
                <label className="block text-sm font-black text-green-600 mb-2 ml-4 uppercase tracking-widest">Gõ chủ đề bạn muốn rèn luyện:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Sóng ánh sáng, Hình học không gian..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-8 py-6 rounded-3xl border-4 border-gray-100 focus:border-green-500 outline-none text-2xl transition-all shadow-inner bg-gray-50 font-bold"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-7 rounded-3xl font-black text-2xl shadow-2xl transition-all transform active:scale-95 ${loading ? 'bg-gray-300' : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-green-200'}`}
              >
                {loading ? 'Đang sáng tạo đề thi...' : 'Soạn Đề Độc Bản ✨'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-['Quicksand']">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[32px] shadow-xl mb-10 border-b-8 border-green-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">📖</div>
            <div>
              <p className="text-xs font-black text-green-600 uppercase tracking-widest">Đang rèn luyện</p>
              <h1 className="text-2xl font-black text-gray-800">{data.topic}</h1>
            </div>
          </div>
          <button onClick={() => { setData(null); setCurrentLevel(null); }} className="mt-4 md:mt-0 px-8 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition-colors">🏠 Soạn đề mới</button>
        </div>

        {!currentLevel ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10">
            <LevelCard title="SIÊU DỄ" subtitle="12 câu MCQ" desc="Khởi động trí não với các khái niệm cơ bản." icon="🌱" color="green" onClick={() => startLevel(AppLevel.SIEU_DE)} />
            <LevelCard title="THỬ SỨC" subtitle="4 câu Đúng/Sai" desc="Thử thách khả năng phân tích đa chiều." icon="🔥" color="orange" onClick={() => startLevel(AppLevel.THU_SUC)} />
            <LevelCard title="VỀ ĐÍCH" subtitle="6 câu Tự luận" desc="Chinh phục bài tập vận dụng cao thực tế." icon="🏆" color="blue" onClick={() => startLevel(AppLevel.VE_DICH)} />
          </div>
        ) : (
          <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border-l-[12px] border-green-500 min-h-[600px] flex flex-col relative overflow-hidden">
             {!stats.completed ? (
              <>
                <div className="flex justify-between items-center mb-10 pb-6 border-b-2 border-gray-50">
                  <div className="flex flex-col">
                    <h2 className={`text-2xl font-black ${currentLevel === AppLevel.SIEU_DE ? 'text-green-600' : currentLevel === AppLevel.THU_SUC ? 'text-orange-600' : 'text-blue-600'}`}>{currentLevel}</h2>
                    <p className="text-sm font-bold text-gray-400">Câu {currentIndex + 1} / {currentLevel === AppLevel.SIEU_DE ? data.sieuDe.length : currentLevel === AppLevel.THU_SUC ? data.thuSuc.length : data.veDich.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-400 uppercase">Điểm đạt được</p>
                    <div className="text-4xl font-black text-green-600">{stats.score}</div>
                  </div>
                </div>
                <div className="flex-1">
                  {currentLevel === AppLevel.SIEU_DE && <MCQView key={currentIndex} question={data.sieuDe[currentIndex]} onNext={handleNext} />}
                  {currentLevel === AppLevel.THU_SUC && <TFView key={currentIndex} question={data.thuSuc[currentIndex]} onNext={handleNext} />}
                  {currentLevel === AppLevel.VE_DICH && <ShortAnswerView key={currentIndex} question={data.veDich[currentIndex]} onNext={handleNext} />}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in">
                <div className="text-9xl mb-8">🎖️</div>
                <h2 className="text-5xl font-black text-gray-800 mb-4 tracking-tighter">BẢN LĨNH TKHA!</h2>
                <div className="bg-green-50 p-12 rounded-[40px] w-full max-w-md mb-12 border-4 border-white shadow-xl">
                  <div className="text-8xl font-black text-green-700">{stats.score}<span className="text-3xl text-green-400">/{stats.totalItems}</span></div>
                  <div className="text-lg font-black text-green-600 mt-4 uppercase tracking-widest">Đạt tỉ lệ {Math.round((stats.score / stats.totalItems) * 100)}%</div>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setCurrentLevel(null)} className="px-12 py-5 bg-green-600 text-white font-black rounded-3xl shadow-xl hover:bg-green-700 transition-all">Quay Lại Menu 🏠</button>
                   <button onClick={() => { setData(null); setCurrentLevel(null); }} className="px-12 py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl hover:bg-blue-700 transition-all">Soạn Đề Khác ⚡</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const LevelCard: React.FC<{ title: string; subtitle: string; desc: string; icon: string; color: string; onClick: () => void }> = ({ title, subtitle, desc, icon, color, onClick }) => {
  const colors: any = { green: 'border-green-500 text-green-700 bg-green-50', orange: 'border-orange-500 text-orange-700 bg-orange-50', blue: 'border-blue-600 text-blue-800 bg-blue-50' };
  const btnColors: any = { green: 'bg-green-600 hover:bg-green-700', orange: 'bg-orange-600 hover:bg-orange-700', blue: 'bg-blue-600 hover:bg-blue-700' };
  return (
    <div onClick={onClick} className={`bg-white p-10 rounded-[40px] shadow-2xl border-t-[12px] transition-all cursor-pointer group hover:-translate-y-2 flex flex-col items-center text-center ${colors[color]}`}>
      <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-3xl font-black mb-1">{title}</h3>
      <p className="text-sm font-black opacity-40 mb-4 tracking-tighter uppercase">{subtitle}</p>
      <p className="text-gray-500 font-bold mb-8 flex-1">{desc}</p>
      <button className={`w-full text-white py-4 rounded-2xl font-black shadow-lg transition-colors ${btnColors[color]}`}>Bắt Đầu ⚡</button>
    </div>
  );
};

export default App;
