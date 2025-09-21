import React from 'react';
import { Page } from '../types';
import { motion } from 'framer-motion';

interface AdaptiveSuggestionCardProps {
  mood: 'calm' | 'stressed' | 'tired';
  suggestion: {
    title: string;
    description: string;
    cta: string;
    link: Page;
  } | null;
  onNavigate: (page: Page) => void;
}

export const AdaptiveSuggestionCard: React.FC<AdaptiveSuggestionCardProps> = ({ mood, suggestion, onNavigate }) => {
  if (!mood || !suggestion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-8"
    >
      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4">Recommended for how you feel right now</p>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0 w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-4xl">
          {mood === 'calm' && '😊'}
          {mood === 'stressed' && '😟'}
          {mood === 'tired' && '😴'}
        </div>
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{suggestion.title}</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">{suggestion.description}</p>
          <button
            onClick={() => onNavigate(suggestion.link)}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            {suggestion.cta}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
