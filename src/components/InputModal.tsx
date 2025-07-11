import React from "react";

interface InputModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const InputModal: React.FC<InputModalProps> = ({ open, message, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[240px] flex flex-col items-center">
        <div className="text-lg font-semibold mb-4 text-gray-800">{message}</div>
        <button
          className="mt-2 px-4 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default InputModal; 