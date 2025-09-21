import React from 'react';
import { EmotionDetector } from './EmotionDetector';
import { SpeechEmotionDetector } from './SpeechEmotionDetector';
import { StatsCard, MyExercisesCard, UrgentSupportCard, DietTrackerCard, DailyWellnessOverviewCard } from './DashboardComponents';
import { EmotionalStateChart } from './EmotionalStateChart';
import { DailyGoals } from './DailyGoals';
import { DailySummaryScore } from './DailySummaryScore';
import { Page } from '../types';
import { GrowthTrackerCard } from './GrowthTrackerCard';

interface DashboardPageProps {
    onNavigate: (page: Page) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">Hey there! How are you doing? 👋</h2>
            
            <GrowthTrackerCard />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Progress Tracking"
                    value="14"
                    change={15}
                    description="Therapy goals achieved"
                    progress={66}
                />
                <StatsCard
                    title="Educational Sources"
                    value="22"
                    change={-30}
                    description="" // No description needed for checklist type
                    checklist={['Breathing and meditation', 'Identifying sources of stress']}
                />
                <StatsCard
                    title="Therapeutic Sessions"
                    value="6"
                    change={5}
                    description="Sessions were held this month"
                    progress={50}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 min-h-[350px]">
                    <EmotionDetector />
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 min-h-[350px]">
                    <SpeechEmotionDetector />
                </div>
                
                <div className="md:col-span-2">
                    <EmotionalStateChart />
                </div>

                <DailyWellnessOverviewCard />

                <UrgentSupportCard onNavigate={onNavigate} />
                <DietTrackerCard onNavigate={onNavigate} />

                <div className="md:col-span-1">
                    <DailyGoals />
                </div>
                <div className="md:col-span-1">
                    <DailySummaryScore />
                </div>
                
                <div className="md:col-span-2">
                    <MyExercisesCard />
                </div>
            </div>
        </div>
    );
};