import React, { useState, useEffect, useMemo, FC } from 'react';
import { getGamificationData, getBadges } from '../services/gamificationService';
import { GamificationData, Badge } from '../types';
import { TrendingUpIcon, FireIcon, StarIcon, BookOpenIcon, AppleIcon, YogaIcon, BrainCircuitIcon } from './IconComponents';

const iconMap: Record<Badge['icon'], FC<{ className?: string }>> = {
    FireIcon,
    StarIcon,
    BookOpenIcon,
    AppleIcon,
    YogaIcon,
    BrainCircuitIcon
};

const JourneyProgressBar: FC<{ xp: number; level: number }> = ({ xp, level }) => {
    const levels = [
        { name: 'Beginner', xpThreshold: 0, maxXP: 100 },
        { name: 'Explorer', xpThreshold: 100, maxXP: 300 },
        { name: 'Mindful Pro', xpThreshold: 300, maxXP: 500 }, // Assuming a max for visual representation
    ];
    
    const currentLevel = levels[level - 1] || levels[0];
    const nextLevel = levels[level] || currentLevel;
    
    const xpInCurrentLevel = xp - currentLevel.xpThreshold;
    const xpForNextLevel = nextLevel.xpThreshold - currentLevel.xpThreshold;
    
    const progressPercentage = xpForNextLevel > 0 ? Math.min((xpInCurrentLevel / xpForNextLevel) * 100, 100) : 100;

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Your Wellness Journey</h3>
            <div className="relative mt-6 mb-2">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                     <div 
                        className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%`}}
                    />
                </div>
                <div 
                    className="absolute top-1/2 -mt-4 transition-all duration-500"
                    style={{ left: `calc(${progressPercentage}% - 16px)` }}
                >
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-500 flex items-center justify-center text-lg shadow-md">
                        🧘
                    </div>
                </div>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>{currentLevel.name}</span>
                 <span>XP: {xp} / {nextLevel.xpThreshold}</span>
                <span>{nextLevel.name}</span>
            </div>
        </div>
    );
};

const StreakCard: FC<{ streak: number }> = ({ streak }) => {
    const isActive = streak > 0;
    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 flex flex-col items-center justify-center text-center">
            <FireIcon className={`w-16 h-16 mb-2 transition-colors ${isActive ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'}`} />
            <p className={`text-5xl font-bold ${isActive ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>{streak}</p>
            <p className="font-semibold text-slate-500 dark:text-slate-400">Day Streak</p>
        </div>
    );
};

const BadgeCard: FC<{ badge: Badge }> = ({ badge }) => {
    const Icon = iconMap[badge.icon];
    const isUnlocked = badge.unlocked;

    return (
        <div className={`p-4 rounded-xl flex items-center gap-4 border-2 transition-all ${isUnlocked ? 'bg-white dark:bg-slate-700/80 border-transparent shadow-lg' : 'bg-slate-100/50 dark:bg-slate-800/30 border-dashed border-slate-300 dark:border-slate-600'}`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isUnlocked ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <Icon className={`w-7 h-7 ${isUnlocked ? 'text-blue-600 dark:text-blue-300' : 'text-slate-400 dark:text-slate-500'}`} />
            </div>
            <div className="flex-grow">
                <h4 className={`font-bold transition-colors ${isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>{badge.name}</h4>
                <p className={`text-xs transition-colors ${isUnlocked ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>{badge.description}</p>
            </div>
        </div>
    );
};

export const MyGrowthPage: React.FC = () => {
    const [data, setData] = useState<GamificationData | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);

    const updateData = () => {
        setData(getGamificationData());
        setBadges(getBadges());
    };

    useEffect(() => {
        updateData();
        // Listen for XP gain to update the page in real-time
        window.addEventListener('xp-gain', updateData);
        return () => window.removeEventListener('xp-gain', updateData);
    }, []);

    if (!data) {
        return <div className="text-center p-8">Loading your growth journey...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <JourneyProgressBar xp={data.xp} level={data.level} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <StreakCard streak={data.streak} />
                </div>
                <div className="md:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-4">Achievements</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {badges.map(badge => (
                            <BadgeCard key={badge.id} badge={badge} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
