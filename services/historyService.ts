import { EmotionalSnapshot, TimePeriod, WellnessMetricType, DailySummary, DailyGoal, Meal } from '../types';
import { auth, db } from './firebaseService';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

const getTodayDateString = (): string => new Date().toISOString().split('T')[0];

export const getHistory = async (): Promise<EmotionalSnapshot[]> => {
    if (!auth.currentUser) return [];

    const snapshotsCollection = collection(db, 'wellnessSnapshots');
    const q = query(snapshotsCollection, where("userId", "==", auth.currentUser.uid));

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmotionalSnapshot));
    } catch (e) {
        console.error("Failed to get history from Firestore", e);
        return [];
    }
};

export const addWellnessDataPoint = async (value: number, type: WellnessMetricType): Promise<void> => {
    if (!auth.currentUser) return;

    const todayStr = getTodayDateString();
    const snapshotId = `${auth.currentUser.uid}_${todayStr}`;
    const snapshotRef = doc(db, "wellnessSnapshots", snapshotId);

    try {
        const docSnap = await getDoc(snapshotRef);

        if (docSnap.exists()) {
            await updateDoc(snapshotRef, {
                dataPoints: arrayUnion({ value, type })
            });
        } else {
            await setDoc(snapshotRef, {
                date: todayStr,
                userId: auth.currentUser.uid,
                dataPoints: [{ value, type }],
            });
        }
        window.dispatchEvent(new CustomEvent('historyUpdated'));
    } catch (error) {
        console.error("Error adding wellness data point: ", error);
    }
};

export const getDailySummaryData = async (): Promise<DailySummary> => {
    if (!auth.currentUser) return { totalScore: 0, change: null, emotionScore: null, dietScore: null };

    const history = await getHistory();
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

        const baseScore = dataPoints.reduce((sum, p) => sum + p.value, 0) / dataPoints.length;
        
        let bonus = 0;

        try {
            const startOfToday = new Date(todayStr);
            const goalsQuery = query(collection(db, 'dailyGoals'), where("userId", "==", auth.currentUser.uid), where("createdAt", ">=", startOfToday));
            const goalsSnapshot = await getDocs(goalsQuery);
            const goals: DailyGoal[] = goalsSnapshot.docs.map(d => d.data() as DailyGoal);
            if (goals.length > 0 && goals.every(g => g.completed)) {
                bonus += 1;
            }
        } catch (e) { console.error('Error checking goals bonus', e); }

        try {
            const startOfToday = new Date(todayStr);
            const meditationQuery = query(collection(db, 'meditationSessions'), where("userId", "==", auth.currentUser.uid), where("createdAt", ">=", startOfToday));
            const meditationSnapshot = await getDocs(meditationQuery);
            if (!meditationSnapshot.empty) {
                bonus += 5;
            }
        } catch (e) { console.error('Error checking meditation bonus', e); }

        totalScore = Math.min(100, Math.round(baseScore + bonus));
    }

    let change: number | null = null;
    if (yesterdayEntry && yesterdayEntry.dataPoints.length > 0) {
        const yesterdayBaseScore = yesterdayEntry.dataPoints.reduce((sum, p) => sum + p.value, 0) / yesterdayEntry.dataPoints.length;
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

export const getChartData = async (period: TimePeriod): Promise<{ day: string; lightBlue: number; darkBlue: number; tooltipPositive: number; }[]> => {
    const history = await getHistory();
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

const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
};

export const getWeeklyDietSummary = async (): Promise<{ currentWeekAverage: number | null; change: number | null }> => {
    if (!auth.currentUser) return { currentWeekAverage: null, change: null };

    const today = new Date();
    const startOfCurrentWeek = getStartOfWeek(today);
    const startOfPreviousWeek = new Date(startOfCurrentWeek);
    startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

    const mealsCollection = collection(db, 'meals');
    const currentWeekQuery = query(mealsCollection, where("userId", "==", auth.currentUser.uid), where("createdAt", ">=", startOfCurrentWeek));
    const previousWeekQuery = query(mealsCollection, where("userId", "==", auth.currentUser.uid), where("createdAt", ">=", startOfPreviousWeek), where("createdAt", "<", startOfCurrentWeek));

    try {
        const [currentWeekSnapshot, previousWeekSnapshot] = await Promise.all([getDocs(currentWeekQuery), getDocs(previousWeekQuery)]);
        
        const currentWeekMeals: Meal[] = currentWeekSnapshot.docs.map(d => d.data() as Meal);
        const previousWeekMeals: Meal[] = previousWeekSnapshot.docs.map(d => d.data() as Meal);

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
            change = 100;
        }

        return { currentWeekAverage, change };

    } catch (e) {
        console.error("Failed to get weekly diet summary:", e);
        return { currentWeekAverage: null, change: null };
    }
};
