import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (mood: 'calm' | 'stressed' | 'tired') => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, onCheckIn }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-6">How are you right now?</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => onCheckIn('calm')}
                className="flex items-center justify-center gap-3 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold py-4 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-lg shadow-md hover:shadow-lg"
              >
                😊 Calm & Balanced
              </button>
              <button
                onClick={() => onCheckIn('stressed')}
                className="flex items-center justify-center gap-3 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 font-semibold py-4 rounded-xl hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-lg shadow-md hover:shadow-lg"
              >
                😟 Stressed/Anxious
              </button>
              <button
                onClick={() => onCheckIn('tired')}
                className="flex items-center justify-center gap-3 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 font-semibold py-4 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-lg shadow-md hover:shadow-lg"
              >
                😴 Tired/Low Energy
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
