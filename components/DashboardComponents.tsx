import React, { useState, useEffect } from 'react';
import { TrendingUpIcon, TrendingDownIcon, CheckCircleIcon } from './IconComponents';
import { Page, Meal, DietSettings, DailySummary } from '../types';
import { getDailySummaryData } from '../services/historyService';

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  description: string;
  progress?: number;
  checklist?: string[];
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, description, progress, checklist }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
          <span>{isPositive ? '+' : ''}{change}%</span>
        </div>
      </div>
      
      {progress !== undefined ? (
        <>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-3">
            <div className={`${isPositive ? 'bg-green-500' : 'bg-blue-500'} h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </>
      ) : checklist ? (
        <div className="mt-3 space-y-1">
          {checklist.map(item => (
            <div key={item} className="flex items-center text-xs text-slate-600 dark:text-slate-300">
              <CheckCircleIcon className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">{description}</p>
      )}
    </div>
  );
};


interface ExerciseProgressProps {
  name: string;
  time: string;
  progress: number;
}

const ExerciseProgress: React.FC<ExerciseProgressProps> = ({ name, time, progress }) => (
  <div>
    <div className="flex justify-between items-baseline mb-1">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{name}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{time}</p>
    </div>
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

export const MyExercisesCard: React.FC = () => {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 h-full">
      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">My exercises</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-4">
        Exercises to help maintain good physical health and support the progress of therapy.
      </p>
      <div className="space-y-4">
        <ExerciseProgress name="Gratitude journal" time="6h 32min" progress={75} />
        <ExerciseProgress name="The power of awareness" time="11h 40min" progress={40} />
      </div>
    </div>
  );
};

interface UrgentSupportCardProps {
    onNavigate: (page: Page) => void;
}

export const UrgentSupportCard: React.FC<UrgentSupportCardProps> = ({ onNavigate }) => {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white h-full flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg">Urgent Support</h3>
        <p className="text-sm text-blue-100 mt-1 max-w-xs">
          Quick access to crisis hotlines when you need immediate help.
        </p>
      </div>
      <button 
        onClick={() => onNavigate('help')}
        className="mt-4 bg-white/90 text-blue-600 font-bold py-2 px-5 rounded-lg hover:bg-white transition-colors self-start"
      >
        Get help now
      </button>
    </div>
  );
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const DietTrackerCard: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [settings, setSettings] = useState<DietSettings | null>(null);

    const updateData = () => {
        const today = getTodayDateString();
        // Load settings
        const storedSettings = localStorage.getItem('mindfulme-diet-settings');
        if (storedSettings) {
            try {
                setSettings(JSON.parse(storedSettings));
            } catch (e) {
                 console.error("Failed to parse diet settings", e);
            }
        }

        // Load meals for today
        const storedMeals = localStorage.getItem('mindfulme-diet-meals');
        if (storedMeals) {
            try {
                const allMeals: Meal[] = JSON.parse(storedMeals);
                const todayMeals = allMeals.filter(m => m.timestamp.startsWith(today));
                setMeals(todayMeals);
            } catch (e) {
                console.error("Failed to parse meals from localStorage", e);
            }
        }
    };

    useEffect(() => {
        updateData();
        
        // Listen for updates from MealLogger
        window.addEventListener('historyUpdated', updateData);
        return () => window.removeEventListener('historyUpdated', updateData);
    }, []);

    const averageScore = meals.length > 0 ? meals.reduce((acc, meal) => acc + meal.score, 0) / meals.length : 0;
    const mealsLogged = meals.length;
    const mealsTarget = settings?.mealsPerDay || 3;

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 h-full flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Mindful Eating</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-4">
                Track your meals to see how they impact your well-being.
            </p>
            <div className="flex-grow flex items-center justify-center my-4 text-center">
                {settings ? (
                     <div>
                        <p className="text-5xl font-bold text-slate-800 dark:text-slate-100">{averageScore.toFixed(1)}</p>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Today's Avg Score</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{mealsLogged} of {mealsTarget} meals logged</p>
                    </div>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                        Set up the Diet Tracker from the sidebar to get started!
                    </p>
                )}
            </div>
            <button
                onClick={() => onNavigate('diet')}
                className="w-full bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-800 font-semibold text-sm py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
            >
                {settings ? 'View Diet Tracker' : 'Set Up Now'}
            </button>
        </div>
    );
};

const ProgressCircle: React.FC<{ score: number; label: string; gradientId: string; gradientColors: [string, string] }> = ({ score, label, gradientId, gradientColors }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center" aria-label={`${label} circle ${Math.round(score)}%`}>
            <div className="relative w-28 h-28">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={gradientColors[0]} />
                            <stop offset="100%" stopColor={gradientColors[1]} />
                        </linearGradient>
                    </defs>
                    <circle className="text-slate-200 dark:text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
                    <circle
                        stroke={`url(#${gradientId})`}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx="60"
                        cy="60"
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{Math.round(score)}%</span>
                </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 text-center">{label}</p>
        </div>
    );
};


export const DailyWellnessOverviewCard: React.FC = () => {
    const [summary, setSummary] = useState<DailySummary | null>(null);
    
    // Mock data for new scores
    const timeOnApp = 45; // in minutes
    const aiInteractionScore = 85; // out of 100

    const fetchData = () => {
        setSummary(getDailySummaryData());
    };

    useEffect(() => {
        fetchData();
        window.addEventListener('historyUpdated', fetchData);
        return () => window.removeEventListener('historyUpdated', fetchData);
    }, []);

    const overallScore = summary?.totalScore || 0;
    const foodScore = summary?.dietScore || 0;
    const emotionScore = summary?.emotionScore || 0;

    return (
        <div className="md:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-4">Daily Wellness Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side: Scores */}
                <div className="space-y-4">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Daily Score Overall</p>
                        <p className="text-6xl font-bold text-slate-800 dark:text-slate-100">{overallScore}<span className="text-2xl text-slate-400">/100</span></p>
                    </div>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <td className="py-2 font-semibold text-slate-600 dark:text-slate-300">Food Score</td>
                                <td className="py-2 text-right font-bold text-slate-700 dark:text-slate-200">{foodScore}/100</td>
                            </tr>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <td className="py-2 font-semibold text-slate-600 dark:text-slate-300">Time Spent on App</td>
                                <td className="py-2 text-right font-bold text-slate-700 dark:text-slate-200">{timeOnApp} min</td>
                            </tr>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <td className="py-2 font-semibold text-slate-600 dark:text-slate-300">Emotion Score</td>
                                <td className="py-2 text-right font-bold text-slate-700 dark:text-slate-200">{emotionScore}/100</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-semibold text-slate-600 dark:text-slate-300">AI Interaction Score</td>
                                <td className="py-2 text-right font-bold text-slate-700 dark:text-slate-200">{aiInteractionScore}/100</td>
                            </tr>
                        </tbody>
                    </table>
                     <p className="text-xs text-slate-500 dark:text-slate-400 italic">Whole Day Report: A balanced day with positive dietary choices contributing to a good score.</p>
                </div>

                {/* Right side: Circles */}
                <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
                    <ProgressCircle score={foodScore * 10} label="Daily Diet Score" gradientId="diet-grad" gradientColors={['#22c55e', '#86efac']} />
                    <ProgressCircle score={emotionScore} label="Emotional Health" gradientId="emotion-grad" gradientColors={['#3b82f6', '#93c5fd']} />
                    <ProgressCircle score={overallScore} label="Overall Wellness" gradientId="overall-grad" gradientColors={['#8b5cf6', '#c4b5fd']} />
                </div>
            </div>
        </div>
    );
}
