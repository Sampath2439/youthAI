import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartPulseIcon } from './IconComponents';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  useEffect(() => {
    onLogin(); // Automatically log in for now
  }, [onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <HeartPulseIcon className="w-24 h-24 mx-auto mb-6 text-white" />
        <h1 className="text-5xl font-bold mb-4">MindfulMe</h1>
        <p className="text-xl mb-8">Your AI-powered companion for mental wellness.</p>
      </motion.div>
    </div>
  );
};