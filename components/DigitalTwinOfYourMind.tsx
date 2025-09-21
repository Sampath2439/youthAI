import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CloudIcon, LockIcon, SettingsIcon, InfoIcon } from './IconComponents';

interface DigitalTwinOfYourMindProps {
  // Add any necessary props here, e.g., data for the chart
}

interface MindProfileData {
  category: string;
  score: number;
  fullMark: number;
}

export const DigitalTwinOfYourMind: React.FC<DigitalTwinOfYourMindProps> = () => {
  const [enableSync, setEnableSync] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [persona, setPersona] = useState<'none' | 'focused' | 'lowEnergy'>('none');

  const initialData: MindProfileData[] = [
    { category: 'Mood', score: 75, fullMark: 100 },
    { category: 'Journaling', score: 60, fullMark: 100 },
    { category: 'Diet & Energy', score: 80, fullMark: 100 },
    { category: 'Music & Meditation', score: 90, fullMark: 100 },
    { category: 'Arcade & Play', score: 50, fullMark: 100 },
  ];

  const focusedPersonaData: MindProfileData[] = [
    { category: 'Mood', score: 85, fullMark: 100 },
    { category: 'Journaling', score: 70, fullMark: 100 },
    { category: 'Diet & Energy', score: 75, fullMark: 100 },
    { category: 'Music & Meditation', score: 95, fullMark: 100 },
    { category: 'Arcade & Play', score: 60, fullMark: 100 },
  ];

  const lowEnergyPersonaData: MindProfileData[] = [
    { category: 'Mood', score: 40, fullMark: 100 },
    { category: 'Journaling', score: 30, fullMark: 100 },
    { category: 'Diet & Energy', score: 20, fullMark: 100 },
    { category: 'Music & Meditation', score: 50, fullMark: 100 },
    { category: 'Arcade & Play', score: 10, fullMark: 100 },
  ];

  const [data, setData] = useState<MindProfileData[]>(initialData);

  useEffect(() => {
    if (demoMode) {
      if (persona === 'focused') {
        setData(focusedPersonaData);
      } else if (persona === 'lowEnergy') {
        setData(lowEnergyPersonaData);
      } else {
        setData(initialData);
      }
    } else {
      setData(initialData);
    }
  }, [demoMode, persona]);

  const insights = [
    {
      title: "Morning Focus Boost",
      description: "Your focus is highest after meditation + morning music sessions.",
      tagline: "Based on your last 7 days of activity.",
    },
    {
      title: "Journaling for Clarity",
      description: "Consistent journaling helps you process emotions effectively.",
      tagline: "Based on your last 7 days of activity.",
    },
    {
      title: "Energy from Balanced Meals",
      description: "You report higher energy levels on days with balanced diet logs.",
      tagline: "Based on your last 7 days of activity.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-12 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Digital Twin of Your Mind</h2>
        {process.env.NODE_ENV === 'development' && (
          <div className="flex items-center space-x-2">
            <span className="text-sm">Demo Mode:</span>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={() => setDemoMode(!demoMode)}
              className="toggle toggle-primary"
            />
            {demoMode && (
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as 'none' | 'focused' | 'lowEnergy')}
                className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 p-2 rounded-lg shadow-md"
              >
                <option value="none">Select Persona</option>
                <option value="focused">Focused Morning</option>
                <option value="lowEnergy">Low Energy Week</option>
              </select>
            )}
          </div>
        )}
      </div>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        A private AI mirror that learns from your moods, journals, diet, music, and play.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mind Profile Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl shadow-inner flex items-center justify-center"
        >
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e2e8f0" dark:stroke="#475569" />
              <PolarAngleAxis dataKey="category" stroke="#64748b" dark:stroke="#94a3b8" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" dark:stroke="#94a3b8" />
              <Radar name="Mind Profile" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Insights Feed */}
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">{insight.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{insight.description}</p>
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span>{insight.tagline}</span>
                <button className="text-blue-600 dark:text-blue-400 hover:underline">See More</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sync & Privacy Controls */}
      <div className="mt-10 border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <CloudIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-lg font-semibold">Enable Sync Across Devices</span>
          <input
            type="checkbox"
            checked={enableSync}
            onChange={() => setEnableSync(!enableSync)}
            className="toggle toggle-primary"
          />
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Your digital twin stays private by default. Sync is optional.</p>
          <button onClick={() => setShowInfoModal(true)} className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center justify-end">
            Learn how your data is stored <InfoIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Privacy Disclaimer */}
      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Your Digital Twin is private. Data stays on your device unless you enable sync.
      </p>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Data Storage Information</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">Your Digital Twin data, including mood patterns, journaling consistency, and activity logs, is stored locally on your device by default. If you enable sync, this data will be securely encrypted and stored in your personal cloud storage (e.g., Google Drive, iCloud) to allow access across your devices. We do not store your personal data on our servers.</p>
            <button
              onClick={() => setShowInfoModal(false)}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-4"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
