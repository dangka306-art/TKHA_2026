
import React, { useState } from 'react';
import { Subject } from '../types';

interface Props { 
  subject: Subject; 
  onUnlock: () => void; 
  onBack: () => void;
}

const ACCESS_CODES: Record<string, string> = {
  'Toán học': 'TOAN26',
  'Ngữ văn': 'VAN26',
  'Tiếng anh': 'ANH26',
  'Vật lý': 'LY26',
  'Hóa học': 'HOA26',
  'Sinh học': 'SINH26',
  'Lịch sử': 'SU26',
  'Địa lý': 'DIA26',
  'Giáo dục kinh tế và pháp luật': 'KTPL26',
  'Hoạt động trải nghiệm hướng nghiệp': 'TN26',
  'Tin học': 'TIN26',
};

const LicenseGate: React.FC<Props> = ({ subject, onUnlock, onBack }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = () => {
    const inputKey = key.trim().toUpperCase();
    const correctKey = ACCESS_CODES[subject];
    
    if (inputKey === correctKey || inputKey === 'TKHA-VIP-2026') {
      onUnlock();
    } else {
      setError(`Mã truy cập môn ${subject} không đúng!`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border-t-[12px] border-green-500 text-center animate-in zoom-in duration-300">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase">Truy cập môn học</h2>
        <p className="text-green-600 font-bold mb-8 text-xl italic">{subject}</p>
        
        <div className="space-y-6">
          <input 
            type="password" 
            value={key} 
            onChange={(e) => { setKey(e.target.value); setError(''); }} 
            placeholder="Nhập mã truy cập..." 
            className="w-full px-6 py-5 rounded-2xl border-4 border-gray-50 focus:border-green-500 outline-none font-bold text-center text-xl shadow-inner transition-all" 
          />
          {error && <p className="text-red-500 text-sm font-bold animate-pulse">{error}</p>}
          
          <div className="flex gap-4">
            <button 
              onClick={onBack} 
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black py-5 rounded-2xl transition-all"
            >
              Quay lại
            </button>
            <button 
              onClick={handleUnlock} 
              className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl transform active:scale-95 transition-all text-xl"
            >
              Mở khóa 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LicenseGate;
