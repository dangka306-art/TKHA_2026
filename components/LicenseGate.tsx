
import React, { useState } from 'react';

interface Props {
  onUnlock: () => void;
}

const LicenseGate: React.FC<Props> = ({ onUnlock }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = () => {
    // Basic license control
    if (key.trim().toUpperCase() === 'TKHA-2026-VIP') {
      onUnlock();
    } else {
      setError('Mã bản quyền không đúng! Vui lòng liên hệ quản trị viên.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-green-500">
        <h1 className="text-3xl font-bold text-center mb-2 text-green-700">TKHA_2026</h1>
        <p className="text-center text-gray-500 mb-8">Ứng dụng rèn luyện tư duy 2018</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nhập mã bản quyền</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Ví dụ: TKHA-2026-VIP"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            onClick={handleUnlock}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition"
          >
            Mở Khóa Hệ Thống 🔐
          </button>
        </div>
        
        <div className="mt-8 text-xs text-center text-gray-400">
          © 2026 TKHA Educational Systems
        </div>
      </div>
    </div>
  );
};

export default LicenseGate;
