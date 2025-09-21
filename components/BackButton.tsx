import React from 'react';
import { ChevronLeftIcon } from './IconComponents';

interface BackButtonProps {
  onBack: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onBack }) => {
  return (
    <button
      onClick={onBack}
      className="flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      <ChevronLeftIcon className="h-5 w-5 mr-1" />
      Back to Dashboard
    </button>
  );
};
