"use client";

import React, { useEffect } from "react";
import { useTransition, animated } from '@react-spring/web';

interface InputModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const InputModal = ({ open, message, onClose }: InputModalProps) => {
  // 엔터 키와 ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    // 모달이 열려 있을 때만 이벤트 리스너 등록 (캡처링 단계에서)
    if (open) {
      document.addEventListener('keydown', handleKeyDown, true);
    }

    // 클린업 함수로 이벤트 리스너 제거
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open, onClose]);

  const transitions = useTransition(open, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { tension: 300, friction: 30 },
  });

  const modalTransitions = useTransition(open, {
    from: { y: -30, opacity: 0 },
    enter: { y: 0, opacity: 1 },
    leave: { y: 30, opacity: 0 },
    config: { tension: 300, friction: 30 },
  });

  return (
    <>
      {transitions((styles, item) =>
        item ? (
          <animated.div
            style={styles}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
          >
            {modalTransitions((modalStyles, modalItem) =>
              modalItem ? (
                <animated.div
                  style={modalStyles}
                  className="bg-slate-100 dark:bg-slate-800 rounded-lg shadow-lg p-6 min-w-[280px] flex flex-col items-center"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">{message}</div>
                  <button
                    className="mt-2 px-6 py-2 rounded bg-slate-600 text-white font-bold hover:bg-slate-700 transition-colors"
                    onClick={onClose}
                  >
                    확인
                  </button>
                </animated.div>
              ) : null
            )}
          </animated.div>
        ) : null
      )}
    </>
  );
};

export { InputModal };