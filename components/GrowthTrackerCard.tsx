import React, { useState, useEffect, FC } from 'react';
import { getGamificationData, getBadges } from '../services/gamificationService';
import { GamificationData, Badge } from '../types';
import { ZapIcon, FireIcon, StarIcon, BookOpenIcon, AppleIcon, YogaIcon, BrainCircuitIcon } from './IconComponents';

const iconMap: Record<Badge['icon'], FC<{ className?: string }>> = {
    FireIcon, StarIcon, BookOpenIcon, AppleIcon, YogaIcon, BrainCircuitIcon
};

const levels = [
    { name: 'Beginner', xpThreshold: 0, maxXP: 100 },
    { name: 'Explorer', xpThreshold: 100, maxXP: 300 },
    { name: 'Mindful Pro', xpThreshold: 300, maxXP: 500 },
];

export const GrowthTrackerCard: FC = () => {
    const [data, setData] = useState<GamificationData | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);

    const updateData = async () => {
        try {
            const [gamificationData, badgesData] = await Promise.all([
                getGamificationData(),
                getBadges(),
            ]);
            setData(gamificationData);
            setBadges(badgesData);
        } catch (error) {
            console.error("Failed to load gamification data:", error);
        }
    };

    useEffect(() => {
        updateData();
        window.addEventListener('xp-gain', updateData);
        return () => window.removeEventListener('xp-gain', updateData);
    }, []);

    if (!data) return null;

    const currentLevel = levels[data.level - 1] || levels[0];
    const nextLevel = levels[data.level] || currentLevel;
    const xpInCurrentLevel = data.xp - currentLevel.xpThreshold;
    const xpForNextLevel = nextLevel.xpThreshold - currentLevel.xpThreshold;
    const progressPercentage = xpForNextLevel > 0 ? Math.min((xpInCurrentLevel / xpForNextLevel) * 100, 100) : 100;

    const unlockedBadges = badges.filter(b => b.unlocked);

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Tabular 1: Streak */}
            <div className="flex flex-col items-center justify-center text-center border-r-0 md:border-r md:border-slate-200 dark:md:border-slate-700 pr-0 md:pr-6">
                <ZapIcon className={`w-12 h-12 mb-2 transition-colors ${data.streak > 0 ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`} />
                <p className={`text-4xl font-bold ${data.streak > 0 ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>{data.streak}</p>
                <p className="font-semibold text-sm text-slate-500 dark:text-slate-400">Day Streak</p>
            </div>

            {/* Tabular 2: Journey/Level */}
            <div className="border-r-0 md:border-r md:border-slate-200 dark:md:border-slate-700 pr-0 md:pr-6">
                 <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-2">Wellness Journey</h4>
                 <div className="relative mb-1">
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                        <div 
                            className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%`}}
                        />
                    </div>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>{currentLevel.name}</span>
                    <span>Lvl {data.level}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span className="font-bold">{data.xp} XP</span> earned. Keep going!
                </p>
            </div>

            {/* Tabular 3: Badges */}
            <div>
                 <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-2">Achievements</h4>
                 {unlockedBadges.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                        {unlockedBadges.slice(0, 5).map(badge => {
                            const Icon = iconMap[badge.icon];
                            return (
                                <div key={badge.id} title={badge.name} className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/40">
                                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                                </div>
                            );
                        })}
                        {unlockedBadges.length > 5 && (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300">
                                +{unlockedBadges.length - 5}
                            </div>
                        )}
                    </div>
                 ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Complete activities to earn your first badge!</p>
                 )}
            </div>
        </div>
    );
};