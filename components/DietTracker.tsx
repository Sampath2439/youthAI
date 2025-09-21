
import React, { useState, useEffect } from 'react';
import { DietSettings, Meal, FoodAnalysisResult } from '../types';
import { MealLogger } from './MealLogger';
import { addWellnessDataPoint, getWeeklyDietSummary } from '../services/historyService';
import { AppleIcon, InfoIcon, CheckCircleIcon, TrendingUpIcon, TrendingDownIcon } from './IconComponents';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

interface DietTrackerProps {
    settings: DietSettings;
}

interface WeeklySummary {
    currentWeekAverage: number | null;
    change: number | null;
}

const WeeklySummaryCard: React.FC<{ summary: WeeklySummary | null }> = ({ summary }) => {
    if (!summary || summary.currentWeekAverage === null) {
        return (
            <div className="bg-blue-50 dark:bg-blue-900/40 p-4 rounded-lg flex items-start gap-3">
                <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-sm text-blue-800 dark:text-blue-200">Weekly Summary</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        Log some meals this week to see your weekly summary and progress.
                    </p>
                </div>
            </div>
        );
    }
    
    const { currentWeekAverage, change } = summary;
    const isPositive = change === null || change >= 0;

    return (
        <div className="bg-slate-100/50 dark:bg-slate-700/50 p-4 rounded-lg">
            <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-2">Weekly Diet Summary</h4>
            <div className="flex items-baseline justify-between">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">This Week's Avg</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{currentWeekAverage.toFixed(1)} <span className="text-base font-normal text-slate-600 dark:text-slate-400">/ 10</span></p>
                </div>
                {change !== null && (
                    <div className="text-right">
                        <div className={`flex items-center justify-end text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
                            <span className="ml-1">{isPositive ? '+' : ''}{change.toFixed(0)}%</span>
                        </div>
                        <p className="text-xs font-normal text-slate-500 dark:text-slate-400">vs last week</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export const DietTracker: React.FC<DietTrackerProps> = ({ settings }) => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [isLogging, setIsLogging] = useState(false);
    const [dailySummary, setDailySummary] = useState<{ score: number, date: string } | null>(null);
    const [showNextMealReminder, setShowNextMealReminder] = useState(false);
    const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);


    useEffect(() => {
        const loadMealsAndSummary = async () => {
            const { auth, db } = await import('../services/firebaseService');
            const { collection, query, where, getDocs, orderBy, limit } = await import('firebase/firestore');

            const user = auth.currentUser;
            if (!user) {
                setMeals([]);
                setDailySummary(null);
                return;
            }

            const today = getTodayDateString();
            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            // Load today's meals
            const mealsCollection = collection(db, 'meals');
            const mealsQuery = query(
                mealsCollection,
                where("userId", "==", user.uid),
                where("createdAt", ">=", startOfDay),
                where("createdAt", "<=", endOfDay),
                orderBy("createdAt", "asc")
            );

            try {
                const querySnapshot = await getDocs(mealsQuery);
                const fetchedMeals: Meal[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as Meal));
                setMeals(fetchedMeals);
            } catch (error) {
                console.error("Error fetching meals from Firestore: ", error);
            }

            // Load yesterday's daily summary
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const startOfYesterday = new Date(yesterdayStr);
            startOfYesterday.setHours(0, 0, 0, 0);
            const endOfYesterday = new Date(yesterdayStr);
            endOfYesterday.setHours(23, 59, 59, 999);

            const dailySummariesCollection = collection(db, 'dailySummaries');
            const summaryQuery = query(
                dailySummariesCollection,
                where("userId", "==", user.uid),
                where("date", "==", yesterdayStr),
                limit(1)
            );

            try {
                const summarySnapshot = await getDocs(summaryQuery);
                if (!summarySnapshot.empty) {
                    const summaryData = summarySnapshot.docs[0].data();
                    setDailySummary({ score: summaryData.score, date: summaryData.date });
                } else {
                    setDailySummary(null);
                }
            } catch (error) {
                console.error("Error fetching daily summary: ", error);
            }
        };

        loadMealsAndSummary();

    }, []);

    useEffect(() => {
        const fetchWeeklySummary = async () => {
            setWeeklySummary(await getWeeklyDietSummary());
        };
        fetchWeeklySummary();
    }, [meals]);


    const handleSaveMeal = async (analysis: FoodAnalysisResult, photo: string) => {
        const { auth, db } = await import('../services/firebaseService');
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

        const user = auth.currentUser;
        if (!user) {
            console.error("No user logged in to save meal data.");
            return;
        }

        const newMeal: Omit<Meal, 'id'> = {
            ...analysis,
            photo,
            userId: user.uid,
            createdAt: serverTimestamp(),
        };

        try {
            const docRef = await addDoc(collection(db, "meals"), newMeal);
            const mealWithId: Meal = { ...newMeal, id: docRef.id };
            
            const updatedMeals = [...meals, mealWithId];
            setMeals(updatedMeals);

            await addWellnessDataPoint(newMeal.score * 10, 'diet');
            
            setIsLogging(false);
            setShowNextMealReminder(true);
        } catch (error) {
            console.error("Error saving meal to Firestore: ", error);
        }
    };
    
    // Calculate average score
    const averageScore = meals.length > 0 ? meals.reduce((acc, meal) => acc + meal.score, 0) / meals.length : 0;
    
    useEffect(() => {
        const saveDailyScore = async () => {
            if (averageScore > 0 && auth.currentUser) {
                const todayStr = getTodayDateString();
                const dailySummaryRef = doc(db, "dailySummaries", `${auth.currentUser.uid}_${todayStr}`);
                
                try {
                    await setDoc(dailySummaryRef, {
                        userId: auth.currentUser.uid,
                        date: todayStr,
                        score: parseFloat(averageScore.toFixed(1)),
                        updatedAt: serverTimestamp(),
                    }, { merge: true });
                } catch (error) {
                    console.error("Error saving daily summary score: ", error);
                }
            }
        };
        saveDailyScore();
    }, [averageScore, auth.currentUser]);

    return (
        <>
            {isLogging && <MealLogger onClose={() => setIsLogging(false)} onSave={handleSaveMeal} />}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-4 rounded-2xl shadow-md border border-white/30 space-y-4">
                <div className="flex items-center">
                    <AppleIcon className="w-6 h-6 text-blue-500 mr-2" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Diet Tracker</h3>
                </div>

                {dailySummary && (
                     <div className="bg-blue-50 dark:bg-blue-900/40 p-3 rounded-lg flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-sm text-blue-800 dark:text-blue-200">Yesterday's Summary</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                You achieved an average diet score of <strong>{dailySummary.score.toFixed(1)}</strong>. Keep up the mindful eating!
                            </p>
                        </div>
                         <button onClick={() => setDailySummary(null)} className="text-blue-800 dark:text-blue-200 text-xl font-bold ml-auto">&times;</button>
                    </div>
                )}

                <WeeklySummaryCard summary={weeklySummary} />

                <div className="text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Today's Average Score</p>
                    <p className="text-5xl font-bold text-slate-800 dark:text-slate-100">{averageScore.toFixed(1)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{meals.length} of {settings.mealsPerDay} meals logged</p>
                </div>
                
                <div className="min-h-[120px]">
                    {meals.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100/50 dark:bg-slate-700/50 dark:text-slate-300">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 rounded-l-lg">
                                            Meal
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Calories
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Classification
                                        </th>
                                        <th scope="col" className="px-4 py-3 rounded-r-lg text-center">
                                            Score
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meals.map(meal => (
                                        <tr key={meal.id} className="border-b dark:border-slate-700">
                                            <td className="px-4 py-2 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                <img src={meal.photo} alt={meal.mealName} className="w-12 h-12 rounded-md object-cover"/>
                                                <span>{meal.mealName}</span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {meal.calories} kcal
                                            </td>
                                            <td className="px-4 py-2">
                                                {meal.classification}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full w-10 h-10 flex items-center justify-center mx-auto">
                                                    {meal.score}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                             <p className="text-sm text-slate-500 dark:text-slate-400">No meals logged yet today.</p>
                        </div>
                    )}
                </div>
                
                {showNextMealReminder && meals.length < settings.mealsPerDay && (
                     <div className="bg-green-50 dark:bg-green-900/40 p-3 rounded-lg flex items-start gap-3">
                        <InfoIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-sm text-green-800 dark:text-green-200">Great job!</p>
                            <p className="text-xs text-green-700 dark:text-green-300">
                               Remember to log your next meal to stay on track with your goal of {settings.mealsPerDay} meals today.
                            </p>
                        </div>
                         <button onClick={() => setShowNextMealReminder(false)} className="text-green-800 dark:text-green-200 text-xl font-bold ml-auto">&times;</button>
                    </div>
                )}

                <button 
                    onClick={() => setIsLogging(true)}
                    className="w-full bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-800 font-semibold text-sm py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
                    disabled={meals.length >= settings.mealsPerDay}
                >
                    {meals.length >= settings.mealsPerDay ? 'All Meals Logged!' : 'Log a Meal'}
                </button>
            </div>
        </>
    );
};
