import React from "react";
import { motion, AnimatePresence } from 'framer-motion';

interface InputModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const InputModal: React.FC<InputModalProps> = ({ open, message, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="bg-slate-100 dark:bg-slate-800 rounded-lg shadow-lg p-6 min-w-[280px] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">{message}</div>
            <button
              className="mt-2 px-6 py-2 rounded bg-slate-600 text-white font-bold hover:bg-slate-700 transition-colors"
              onClick={onClose}
            >
              확인
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InputModal; 