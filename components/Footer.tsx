import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-slate-500 dark:text-slate-400">
        <p className="text-xs max-w-2xl mx-auto">
            <strong>Disclaimer:</strong> This is an AI-powered application for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </p>
        <p className="text-sm mt-4">
          &copy; {new Date().getFullYear()} Mental Wellness AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};