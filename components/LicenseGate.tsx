
import React, { useState } from 'react';
import { Subject } from '../types';

interface Props { 
  subject: Subject; 
  onUnlock: (isVip: boolean) => void; 
  onBack: () => void;
}

const ACCESS_CODES: Record<string, string> = {
  'Toán học': 'MATH-MASTER-26',
  'Ngữ văn': 'VAN-CHUYEN-26',
  'Tiếng anh': 'ENG-GLOBAL-26',
  'Vật lý': 'PHYS-PRO-26',
  'Hóa học': 'CHEM-LAB-26',
  'Sinh học': 'BIO-LIFE-26',
  'Lịch sử': 'HIST-KING-26',
  'Địa lý': 'GEO-WORLD-26',
  'Giáo dục kinh tế và pháp luật': 'LAW-ELITE-26',
  'Hoạt động trải nghiệm hướng nghiệp': 'WORK-PRO-26',
  'Tin học': 'TECH-DEV-26',
};

const VIP_CODE = 'TKHA-VIP-2026';

const LicenseGate: React.FC<Props> = ({ subject, onUnlock, onBack }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = () => {
    const inputKey = key.trim().toUpperCase();
    const correctKey = ACCESS_CODES[subject];
    
    if (inputKey === VIP_CODE) {
      onUnlock(true); // Unlock all
    } else if (inputKey === correctKey) {
      onUnlock(false); // Unlock only current
    } else {
      setError(`Mã truy cập không hợp lệ. Vui lòng kiểm tra lại!`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
      <div className="bg-white p-12 rounded-[60px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-lg border-t-[16px] border-emerald-600 text-center animate-in zoom-in duration-500 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <div className="text-9xl rotate-12">🔑</div>
        </div>
        
        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-50 rounded-full mb-8 text-5xl shadow-inner border-2 border-emerald-100">🔒</div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Kích hoạt Bản quyền</h2>
        <p className="text-slate-400 font-bold mb-8 uppercase tracking-[0.2em] text-sm">Đối tượng: <span className="text-emerald-600">{subject}</span></p>
        
        <div className="space-y-8 relative z-10">
          <div className="relative">
            <input 
              type="text" 
              value={key} 
              onChange={(e) => { setKey(e.target.value); setError(''); }} 
              placeholder="Nhập mã kích hoạt của bạn..." 
              className={`w-full px-8 py-6 rounded-[30px] border-4 outline-none font-black text-center text-2xl shadow-inner transition-all uppercase tracking-widest ${error ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-50 bg-slate-50 focus:border-emerald-500 focus:bg-white text-slate-700'}`} 
            />
            {error && (
              <div className="mt-4 text-red-500 font-black flex items-center justify-center gap-2 animate-bounce">
                <span>⚠️</span> {error}
              </div>
            )}
          </div>
          
          <div className="pt-4 space-y-4">
            <button 
              onClick={handleUnlock} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-7 rounded-[30px] shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)] transform active:scale-95 transition-all text-2xl uppercase tracking-tighter"
            >
              Mở khóa ngay 🚀
            </button>
            
            <button 
              onClick={onBack} 
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-5 rounded-[25px] transition-all text-lg uppercase tracking-widest"
            >
              Quay lại danh sách
            </button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-slate-400 text-xs font-bold leading-relaxed">
              * Liên hệ Quản trị viên để nhận mã kích hoạt cho từng môn học hoặc Mã Master VIP để sử dụng toàn bộ tính năng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseGate;
