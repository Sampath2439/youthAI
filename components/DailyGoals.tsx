import React, { useState, useEffect } from 'react';
import { DailyGoal } from '../types';
import { FlagIcon } from './IconComponents';

const GOALS_KEY = 'mindfulme-daily-goals';
const GOALS_DATE_KEY = 'mindfulme-goals-date';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const DailyGoals: React.FC = () => {
    const [goals, setGoals] = useState<DailyGoal[]>([]);
    const [newGoalText, setNewGoalText] = useState('');

    // Load goals from localStorage on initial render
    useEffect(() => {
        const today = getTodayDateString();
        const storedDate = localStorage.getItem(GOALS_DATE_KEY);

        if (storedDate === today) {
            const storedGoals = localStorage.getItem(GOALS_KEY);
            if (storedGoals) {
                try {
                    const parsedGoals = JSON.parse(storedGoals);
                    if (Array.isArray(parsedGoals)) {
                         setGoals(parsedGoals);
                    } else {
                        setGoals([]);
                    }
                } catch (e) {
                    setGoals([]);
                }
            }
        } else {
            // It's a new day, reset goals
            localStorage.setItem(GOALS_KEY, JSON.stringify([]));
            localStorage.setItem(GOALS_DATE_KEY, today);
            setGoals([]);
        }
    }, []);

    // Save goals to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
         // Dispatch event so AI context can be updated if necessary elsewhere
        window.dispatchEvent(new CustomEvent('historyUpdated'));
    }, [goals]);
    
    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGoalText.trim() && goals.length < 3) {
            const newGoal: DailyGoal = {
                id: Date.now(),
                text: newGoalText.trim(),
                completed: false,
            };
            setGoals([...goals, newGoal]);
            setNewGoalText('');
        }
    };

    const handleToggleCompletion = (id: number) => {
        setGoals(goals.map(goal =>
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
        ));
    };
    
    const completedGoals = goals.filter(g => g.completed).length;
    const totalGoals = goals.length;
    const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30">
            <div className="flex items-center mb-4">
                <FlagIcon className="w-6 h-6 text-blue-500 mr-2" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Daily Goals</h3>
            </div>
            
            {/* Progress Bar */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Progress</span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{completedGoals} of {totalGoals} completed</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Goals List / Placeholder */}
            <div className="my-6 min-h-[100px] flex flex-col justify-center">
                {goals.length > 0 ? (
                    <div className="space-y-3">
                        {goals.map((goal) => (
                            <div key={goal.id} className="flex items-center gap-3 p-2 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id={`goal-${goal.id}`}
                                    checked={goal.completed}
                                    onChange={() => handleToggleCompletion(goal.id)}
                                    className="h-5 w-5 rounded border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                                    aria-label={`Mark goal as complete`}
                                />
                                <label 
                                    htmlFor={`goal-${goal.id}`}
                                    className={`w-full bg-transparent border-0 focus:ring-0 text-sm text-slate-800 dark:text-slate-200 transition-colors cursor-pointer ${
                                        goal.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''
                                    }`}
                                >
                                    {goal.text}
                                </label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400">Set up to 3 goals for today!</p>
                )}
            </div>

            {/* Add Goal Form */}
            <form onSubmit={handleAddGoal}>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        placeholder="Add a new goal..."
                        className="flex-grow w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                        disabled={goals.length >= 3}
                        aria-label="New goal input"
                    />
                    <button 
                        type="submit" 
                        disabled={goals.length >= 3 || !newGoalText.trim()}
                        className="bg-slate-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-600 disabled:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 dark:disabled:bg-slate-500 transition-colors"
                    >
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
};