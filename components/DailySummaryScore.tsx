import React, { useState, useEffect } from 'react';
import { getDailySummaryData } from '../services/historyService';
import { DailySummary } from '../types';

const ScoreRing: React.FC<{ score: number, ringColor: string }> = ({ score, ringColor }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-slate-200 dark:text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className={ringColor}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{score}</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ 100</span>
            </div>
        </div>
    );
};

const ChangeIndicator: React.FC<{ change: number | null }> = ({ change }) => {
    if (change === null) {
        return <div className="h-5"></div>; // Placeholder for alignment
    }
    
    const isPositive = change > 0;
    const color = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const icon = isPositive ? '▲' : '▼';
    const text = `${Math.abs(change).toFixed(0)}% vs yesterday`;
    
    return (
        <div className={`mt-2 flex items-center text-sm font-semibold ${color}`}>
            <span>{icon}</span>
            <span className="ml-1">{text}</span>
        </div>
    );
};

const ScoreBreakdownRow: React.FC<{ label: string; score: number | null }> = ({ label, score }) => {
    if (score === null) return null;
    const progress = score || 0;
    return (
        <div className="text-left">
            <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-600 dark:text-slate-300">{label}</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{score}/100</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};


export const DailySummaryScore: React.FC = () => {
    const [summary, setSummary] = useState<DailySummary | null>(null);

    const fetchData = () => {
        const data = getDailySummaryData();
        setSummary(data);
    };

    useEffect(() => {
        fetchData();
        window.addEventListener('historyUpdated', fetchData);
        return () => {
            window.removeEventListener('historyUpdated', fetchData);
        };
    }, []);

    if (!summary) return null;

    const { totalScore, change, emotionScore, dietScore } = summary;
    const ringColor = totalScore >= 70 ? 'text-emerald-500' : totalScore >= 40 ? 'text-amber-500' : 'text-red-500';

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 flex flex-col items-center text-center h-full">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Today's Wellness Score</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">A summary of your daily check-ins</p>
            <ScoreRing score={totalScore} ringColor={ringColor} />
            <ChangeIndicator change={change} />
            <div className="w-full border-t border-slate-200 dark:border-slate-700 my-4"></div>
            <div className="space-y-3 w-full">
                <ScoreBreakdownRow label="Emotion Score" score={emotionScore} />
                <ScoreBreakdownRow label="Diet Score" score={dietScore} />
            </div>
        </div>
    );
};