import React from 'react';

interface PopupProps {
  message: string;
  onClose: () => void;
}

const Popup: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#FFFAE3] p-6 rounded-lg shadow-lg text-center border border-[#FFD700]">
        <h2 className="text-lg font-bold mb-4 text-[#333]">{message}</h2>
        <button
          onClick={onClose}
          className="bg-[#398b5a] text-white px-4 py-2 rounded-lg transition duration-300 hover:bg-[#276844] font-semibold"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default Popup;
