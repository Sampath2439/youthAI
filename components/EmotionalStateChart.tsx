import React, { useState, useMemo, useEffect } from 'react';
import { getHistory } from '../services/historyService';
import { EmotionalSnapshot, TimePeriod } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

type ChartDataPoint = {
    label: string;
    score: number;
};

export const EmotionalStateChart: React.FC = () => {
    const [period, setPeriod] = useState<TimePeriod>('week');
    const [history, setHistory] = useState<EmotionalSnapshot[]>([]);
    const [hoveredData, setHoveredData] = useState<{ label: string; score: number } | null>(null);
    const [monthPage, setMonthPage] = useState(0);
    const [yearBase, setYearBase] = useState(new Date().getFullYear() - 1);

    useEffect(() => {
        const fetchHistory = async () => {
            const fetchedHistory = await getHistory();
            setHistory(fetchedHistory);
        };
        fetchHistory();

        // Listen for history updates from other components
        const handleHistoryUpdate = () => fetchHistory(); // Re-fetch on update
        window.addEventListener('historyUpdated', handleHistoryUpdate);
        return () => window.removeEventListener('historyUpdated', handleHistoryUpdate);
    }, []);

    const dataMap = useMemo(() => {
        const map = new Map<string, number>();
        if (Array.isArray(history)) { // Defensive check
            history.forEach(item => {
                if (item.dataPoints && item.dataPoints.length > 0) {
                    const avgScore = item.dataPoints.reduce((sum, p) => sum + p.value, 0) / item.dataPoints.length;
                    map.set(item.date, avgScore);
                } else {
                    map.set(item.date, 0);
                }
            });
        }
        return map;
    }, [history]);
    
    const daysInMonth = useMemo(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    }, []);

    const displayData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const data: ChartDataPoint[] = [];

        if (period === 'week') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                data.push({
                    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    score: dataMap.get(dateStr) || 0,
                });
            }
            return data;
        }

        if (period === 'month') {
            const monthData: ChartDataPoint[] = [];
            const month = today.getMonth();
            const year = today.getFullYear();
            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(year, month, i);
                const dateStr = date.toISOString().split('T')[0];
                monthData.push({
                    label: `${i}${date.toLocaleDateString('en-US', { month: 'short' })}`,
                    score: dataMap.get(dateStr) || 0,
                });
            }
            const startIndex = monthPage * 15;
            return monthData.slice(startIndex, startIndex + 15);
        }

        if (period === 'year') {
            const yearData: ChartDataPoint[] = [];
            const yearlyAverages: Map<number, { total: number; count: number }> = new Map();
            
            history.forEach(item => {
                const year = new Date(item.date).getFullYear();
                const current = yearlyAverages.get(year) || { total: 0, count: 0 };
                current.total += item.dataPoints.reduce((sum, dp) => sum + dp.value, 0);
                current.count += item.dataPoints.length;
                yearlyAverages.set(year, current);
            });

            for (let i = 0; i < 3; i++) {
                const year = yearBase + i;
                const yearAvg = yearlyAverages.get(year);
                yearData.push({
                    label: String(year),
                    score: yearAvg && yearAvg.count > 0 ? yearAvg.total / yearAvg.count : 0,
                });
            }
            return yearData;
        }

        return [];
    }, [period, dataMap, monthPage, yearBase, daysInMonth, history]);

    const handleSetPeriod = (newPeriod: TimePeriod) => {
        setPeriod(newPeriod);
        setMonthPage(0);
        setYearBase(new Date().getFullYear() - 1);
        setHoveredData(null);
    };

    const renderChart = () => (
        <div className="relative flex-grow flex items-end justify-around gap-1 px-2 pt-8">
             {hoveredData && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none">
                    Score: {hoveredData.score}
                </div>
            )}
            {displayData.map((data, index) => (
                <div 
                    key={data.label}
                    className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                    onMouseEnter={() => data.score > 0 && setHoveredData({ label: data.label, score: Math.round(data.score) })}
                    onMouseLeave={() => setHoveredData(null)}
                >
                    <div className="relative w-full h-full flex items-end justify-center">
                        <div 
                            className="w-full bg-blue-200 dark:bg-blue-800/50 rounded-t-md group-hover:bg-blue-300 dark:group-hover:bg-blue-700 transition-all"
                            style={{ height: `${Math.max(data.score, 0)}%` }}
                        />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">{data.label}</span>
                </div>
            ))}
        </div>
    );
    
    const maxMonthPage = Math.ceil(daysInMonth / 15) - 1;

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 min-h-[350px] flex flex-col">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Emotional State</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Based on self-tests and feedback</p>
                </div>
                <div className="flex items-center bg-slate-200/70 dark:bg-slate-700/50 p-1 rounded-lg">
                    {(['week', 'month', 'year'] as TimePeriod[]).map(p => (
                        <button
                            key={p}
                            onClick={() => handleSetPeriod(p)}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors capitalize ${period === p ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex-grow flex flex-col">
                <div className="flex-grow">
                    {renderChart()}
                </div>
                {(period === 'month' || period === 'year') && (
                    <div className="flex justify-center items-center mt-2">
                         <button 
                            onClick={() => period === 'month' ? setMonthPage(p => p - 1) : setYearBase(y => y - 3)}
                            disabled={(period === 'month' && monthPage === 0)}
                            className="p-1 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
                            aria-label="Previous period"
                        >
                           <ChevronLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-300"/>
                        </button>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-24 text-center">
                            {period === 'month' && `Days ${monthPage * 15 + 1}-${Math.min((monthPage + 1) * 15, daysInMonth)}`}
                            {period === 'year' && `${yearBase} - ${yearBase+2}`}
                        </span>
                         <button 
                            onClick={() => period === 'month' ? setMonthPage(p => p + 1) : setYearBase(y => y + 3)}
                            disabled={(period === 'month' && monthPage >= maxMonthPage)}
                            className="p-1 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
                            aria-label="Next period"
                        >
                           <ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-300"/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};