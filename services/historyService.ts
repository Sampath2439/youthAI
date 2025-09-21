import { EmotionalSnapshot, TimePeriod, WellnessMetricType, DailySummary, DailyGoal, Meal } from '../types';

const HISTORY_KEY = 'mindfulme-emotional-history';

// Utility to get today's date string in YYYY-MM-DD format
const getTodayDateString = (): string => new Date().toISOString().split('T')[0];

/**
 * Retrieves the entire emotional history from localStorage.
 */
export const getHistory = (): EmotionalSnapshot[] => {
    try {
        const storedHistory = localStorage.getItem(HISTORY_KEY);
        return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (e) {
        console.error("Failed to parse emotional history from localStorage", e);
        return [];
    }
};

/**
 * Saves the entire emotional history to localStorage.
 */
const saveHistory = (history: EmotionalSnapshot[]): void => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    // Dispatch a custom event to allow components to react to history updates in real-time.
    window.dispatchEvent(new CustomEvent('historyUpdated'));
};

/**
 * Adds a new wellness data point for the current day.
 * It calculates a new running average for the day's wellness score.
 * @param value A number from 0-100 representing a wellness-related score.
 * @param type The category of the wellness metric.
 */
export const addWellnessDataPoint = (value: number, type: WellnessMetricType): void => {
    const history = getHistory();
    const todayStr = getTodayDateString();
    const todayEntryIndex = history.findIndex(entry => entry.date === todayStr);

    if (todayEntryIndex > -1) {
        // Update existing entry for today
        history[todayEntryIndex].dataPoints.push({ value, type });
    } else {
        // Add a new entry for today
        history.push({
            date: todayStr,
            dataPoints: [{ value, type }],
        });
    }

    saveHistory(history);
};

/**
 * Retrieves a summary of today's wellness score and its change from yesterday.
 */
export const getDailySummaryData = (): DailySummary => {
    const history = getHistory();
    const todayStr = getTodayDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayEntry = history.find(entry => entry.date === todayStr);
    const yesterdayEntry = history.find(entry => entry.date === yesterdayStr);

    let totalScore = 0;
    let emotionScore: number | null = null;
    let dietScore: number | null = null;
    
    if (todayEntry && todayEntry.dataPoints.length > 0) {
        const dataPoints = todayEntry.dataPoints;

        const emotionPoints = dataPoints.filter(p => p.type === 'emotion');
        if (emotionPoints.length > 0) {
            emotionScore = Math.round(emotionPoints.reduce((sum, p) => sum + p.value, 0) / emotionPoints.length);
        }

        const dietPoints = dataPoints.filter(p => p.type === 'diet');
        if (dietPoints.length > 0) {
            dietScore = Math.round(dietPoints.reduce((sum, p) => sum + p.value, 0) / dietPoints.length);
        }

        // Calculate base score from all points
        const baseScore = dataPoints.reduce((sum, p) => sum + p.value, 0) / dataPoints.length;
        
        // --- Calculate Bonuses ---
        let bonus = 0;

        // 1. Daily Goals Bonus (+1)
        try {
            const storedGoalsDate = localStorage.getItem('mindfulme-goals-date');
            if (storedGoalsDate === todayStr) {
                const storedGoals = localStorage.getItem('mindfulme-daily-goals');
                if (storedGoals) {
                    const goals: DailyGoal[] = JSON.parse(storedGoals);
                    if (goals.length > 0 && goals.every(g => g.completed)) {
                        bonus += 1;
                    }
                }
            }
        } catch (e) { console.error('Error checking goals bonus', e); }

        // 2. Meditation Bonus (+5)
        try {
            const meditationDate = localStorage.getItem('mindfulme-meditation-completed-date');
            if (meditationDate === todayStr) {
                bonus += 5;
            }
        } catch (e) { console.error('Error checking meditation bonus', e); }

        totalScore = Math.min(100, Math.round(baseScore + bonus));
    }

    // --- Calculate change from yesterday ---
    let change: number | null = null;
    if (yesterdayEntry && yesterdayEntry.dataPoints.length > 0) {
        const yesterdayBaseScore = yesterdayEntry.dataPoints.reduce((sum, p) => sum + p.value, 0) / yesterdayEntry.dataPoints.length;
        // For simplicity, we compare today's total score with yesterday's base score.
        if (yesterdayBaseScore > 0 && totalScore > 0) {
            change = ((totalScore - yesterdayBaseScore) / yesterdayBaseScore) * 100;
        }
    } else if (totalScore > 0) {
        change = 100;
    }

    return {
        totalScore,
        change,
        emotionScore,
        dietScore
    };
};


/**
 * Processes and returns data formatted for the EmotionalStateChart.
 * @param period The time frame to get data for ('week', 'month', 'year').
 */
export const getChartData = (period: TimePeriod): { day: string; lightBlue: number; darkBlue: number; tooltipPositive: number; }[] => {
    const history = getHistory();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dataMap = new Map<string, number>();
    history.forEach(item => {
        if (item.dataPoints && item.dataPoints.length > 0) {
            const avgScore = item.dataPoints.reduce((sum, p) => sum + p.value, 0) / item.dataPoints.length;
            dataMap.set(item.date, avgScore);
        } else {
            dataMap.set(item.date, 0);
        }
    });

    const formattedData = [];

    const mapDataPoint = (label: string, wellnessScore: number) => {
        const score = wellnessScore || 0;
        const totalHeight = score;
        const darkBlue = score > 0 ? (100 - score) / 4 + 5 : 0; 
        const lightBlue = Math.max(0, totalHeight - darkBlue);
        
        return {
            day: label,
            lightBlue: lightBlue,
            darkBlue: darkBlue,
            tooltipPositive: Math.round(score),
        };
    };

    if (period === 'week') {
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const wellnessScore = dataMap.get(dateStr) || 0;
            const label = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            formattedData.push(mapDataPoint(label, wellnessScore));
        }
    } else if (period === 'month') {
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const wellnessScore = dataMap.get(dateStr) || 0;
            const label = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            formattedData.push(mapDataPoint(label, wellnessScore));
        }
    } else if (period === 'year') {
        const monthlyAverages: { [month: string]: { total: number; count: number } } = {};
        const monthLabels = [];
        
        for(let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthLabels.push({key: monthKey, label: date.toLocaleDateString('en-US', { month: 'short' })});
            monthlyAverages[monthKey] = { total: 0, count: 0 };
        }

        const twelveMonthsAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).getTime();
        history.forEach(item => {
            const itemDate = new Date(item.date);
            if(itemDate.getTime() >= twelveMonthsAgo){
                 const monthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
                if (monthlyAverages[monthKey] && item.dataPoints?.length > 0) {
                    const avgScore = item.dataPoints.reduce((sum, p) => sum + p.value, 0) / item.dataPoints.length;
                    monthlyAverages[monthKey].total += avgScore;
                    monthlyAverages[monthKey].count += 1;
                }
            }
        });

        for(const month of monthLabels) {
            const avgData = monthlyAverages[month.key];
            const wellnessScore = avgData.count > 0 ? avgData.total / avgData.count : 0;
            formattedData.push(mapDataPoint(month.label, wellnessScore));
        }
    }

    return formattedData;
};

// Helper to get start of week (Sunday)
const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
};


export const getWeeklyDietSummary = (): { currentWeekAverage: number | null; change: number | null } => {
    try {
        const storedMeals = localStorage.getItem('mindfulme-diet-meals');
        const allMeals: Meal[] = storedMeals ? JSON.parse(storedMeals) : [];
        if (!allMeals || allMeals.length === 0) {
            return { currentWeekAverage: null, change: null };
        }

        const today = new Date();
        const startOfCurrentWeek = getStartOfWeek(today);
        const startOfPreviousWeek = new Date(startOfCurrentWeek);
        startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

        const currentWeekMeals = allMeals.filter(m => new Date(m.timestamp) >= startOfCurrentWeek);
        const previousWeekMeals = allMeals.filter(m => {
            const mealDate = new Date(m.timestamp);
            return mealDate >= startOfPreviousWeek && mealDate < startOfCurrentWeek;
        });
        
        const calculateAverage = (meals: Meal[]) => {
            if (meals.length === 0) return null;
            return meals.reduce((sum, meal) => sum + meal.score, 0) / meals.length;
        };

        const currentWeekAverage = calculateAverage(currentWeekMeals);
        const previousWeekAverage = calculateAverage(previousWeekMeals);
        
        let change: number | null = null;
        if (currentWeekAverage !== null && previousWeekAverage !== null && previousWeekAverage > 0) {
            change = ((currentWeekAverage - previousWeekAverage) / previousWeekAverage) * 100;
        } else if (currentWeekAverage !== null && (previousWeekAverage === null || previousWeekAverage === 0)) {
            change = 100; // Full improvement if there was no score before.
        }

        return { currentWeekAverage, change };

    } catch (e) {
        console.error("Failed to get weekly diet summary:", e);
        return { currentWeekAverage: null, change: null };
    }
};
