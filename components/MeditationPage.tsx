import React, { useState, useEffect, useMemo } from 'react';
import { getBreathingExercises } from '../services/geminiService';
import { addWellnessDataPoint } from '../services/historyService';
import { addXP } from '../services/gamificationService';
import { BreathingExercise } from '../types';
import { StarIcon, BookOpenIcon } from './IconComponents';
import { FeedbackFlow } from './FeedbackFlow';

type SessionState = 'idle' | 'pre' | 'active' | 'post' | 'summary' | 'feedback';
const RATING_LABELS = ['Very Stressed', 'Stressed', 'Neutral', 'Calm', 'Very Calm'];
const getTodayDateString = () => new Date().toISOString().split('T')[0];

const StarRating: React.FC<{ rating: number, setRating: (rating: number) => void }> = ({ rating, setRating }) => (
  <div className="flex justify-center space-x-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} onClick={() => setRating(star)} className="focus:outline-none transform transition-transform hover:scale-110">
        <StarIcon 
          filled={rating >= star}
          className={`w-10 h-10 transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
        />
      </button>
    ))}
  </div>
);


export const MeditationPage: React.FC = () => {
    const [exercises, setExercises] = useState<BreathingExercise[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [postRating, setPostRating] = useState(0);
    
    const [timer, setTimer] = useState(0);
    const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [cycleCount, setCycleCount] = useState(0);
    const totalCycles = 5;

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                setIsLoading(true);
                const data = await getBreathingExercises();
                setExercises(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load exercises.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchExercises();
    }, []);

    useEffect(() => {
        if (sessionState !== 'active' || !selectedExercise) return;

        const { inhale, hold, exhale } = selectedExercise.pattern;
        
        const interval = setInterval(() => {
            setTimer(prev => {
                const newTime = prev - 1;

                if (newTime > 0) return newTime;

                if (currentPhase === 'inhale') {
                    setCurrentPhase('hold');
                    if (hold > 0) {
                        return hold;
                    } else {
                         setCurrentPhase('exhale');
                         return exhale;
                    }
                } else if (currentPhase === 'hold') {
                    setCurrentPhase('exhale');
                    return exhale;
                } else { // exhale
                    const newCycleCount = cycleCount + 1;
                    if (newCycleCount >= totalCycles) {
                        setSessionState('post');
                        return 0;
                    }
                    setCycleCount(newCycleCount);
                    setCurrentPhase('inhale');
                    return inhale;
                }
            });
        }, 1000);

        return () => clearInterval(interval);

    }, [sessionState, selectedExercise, currentPhase, cycleCount]);
    
    const handleSelectExercise = (exercise: BreathingExercise) => {
        setSelectedExercise(exercise);
        setSessionState('pre');
    };

    const handleStartSession = () => {
        if (!selectedExercise) return;
        setCycleCount(0);
        setCurrentPhase('inhale');
        setTimer(selectedExercise.pattern.inhale);
        setSessionState('active');
    };
    
    const handleFinishSession = () => {
        if (postRating === 0) return;
        // Calculate score based on post-session feeling (1-5 rating to 20-100 score).
        const score = postRating * 20;
        addWellnessDataPoint(score, 'meditation');
        localStorage.setItem('mindfulme-meditation-completed-date', getTodayDateString());
        
        // Add XP for completing a session
        const xpGained = 15;
        addXP(xpGained, 'first_meditation');
        window.dispatchEvent(new CustomEvent('xp-gain', { detail: { amount: xpGained } }));

        setSessionState('summary');
    };

    const handleReset = () => {
        setSelectedExercise(null);
        setSessionState('idle');
        setPostRating(0);
        setTimer(0);
    };

    const handleFinishAndShowFeedback = () => {
        setSessionState('feedback');
    };
    
    const animationStyle = useMemo(() => {
        if (sessionState !== 'active' || !selectedExercise) return {};
        // Ensure phase duration is at least 1 second for a smooth transition
        const phaseDuration = (selectedExercise.pattern[currentPhase] || 1) * 1000;
        
        switch (currentPhase) {
            case 'inhale':
                return { 
                    transform: 'scale(1.5)', 
                    backgroundColor: '#60a5fa', // blue-400
                    transition: `all ${phaseDuration}ms ease-out`
                };
            case 'hold':
                 return { 
                    transform: 'scale(1.5)', 
                    backgroundColor: '#a78bfa', // violet-400
                    transition: `all 500ms ease-in-out`
                };
            case 'exhale':
                 return { 
                    transform: 'scale(1)', 
                    backgroundColor: '#9ca3af', // slate-400
                    transition: `all ${phaseDuration}ms ease-in`
                };
            default:
                return {};
        }
    }, [sessionState, currentPhase, selectedExercise]);


    const renderContent = () => {
        if (isLoading) {
            return <p>Loading breathing exercises...</p>;
        }
        if (error) {
            return <p className="text-red-500">{error}</p>;
        }

        switch (sessionState) {
            case 'idle':
                return (
                    <div className="w-full">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Choose an Exercise</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">Select a technique to begin your session.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {exercises.map(ex => (
                                <button 
                                    key={ex.name} 
                                    onClick={() => handleSelectExercise(ex)} 
                                    className="bg-white dark:bg-slate-700/80 p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all text-left border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                                >
                                    <h4 className="font-semibold text-blue-600 dark:text-blue-400">{ex.name}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{ex.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'pre':
                return (
                     <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{selectedExercise?.name}</h3>
                         <p className="text-slate-600 dark:text-slate-400 mb-6">When you're ready, find a comfortable position and begin.</p>
                        <div className="flex flex-col items-center gap-4 mt-8">
                            <button 
                                onClick={handleStartSession} 
                                className="w-full max-w-xs bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Start Session
                            </button>
                            <button 
                                onClick={handleReset}
                                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:underline"
                            >
                                Back to Exercises
                            </button>
                        </div>
                    </div>
                );

            case 'post':
                return (
                     <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">How do you feel now?</h3>
                         <p className="text-slate-600 dark:text-slate-400 mb-6">Take a moment to notice any changes.</p>
                        <StarRating rating={postRating} setRating={setPostRating} />
                        {postRating > 0 && <p className="mt-4 font-semibold text-blue-700 dark:text-blue-300">{RATING_LABELS[postRating - 1]}</p>}
                        <button 
                            onClick={handleFinishSession} 
                            disabled={postRating === 0}
                            className="mt-8 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
                        >
                            Finish & View Summary
                        </button>
                    </div>
                );

            case 'active':
                return (
                    <div className="text-center flex flex-col items-center">
                        <div className="w-64 h-64 flex items-center justify-center">
                            <div 
                                className="w-32 h-32 rounded-full bg-slate-400 flex items-center justify-center"
                                style={animationStyle}
                            />
                        </div>
                        <p className="text-3xl font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200 mt-8">{currentPhase}</p>
                        <p className="text-6xl font-thin text-slate-500 dark:text-slate-400 mt-2">{timer}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">Cycle {cycleCount + 1} of {totalCycles}</p>
                        <button 
                            onClick={handleReset}
                            className="mt-6 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:underline"
                        >
                            Stop & Go Back
                        </button>
                    </div>
                );
            
            case 'summary':
                const summaryText = "You've completed the session. We hope you're feeling more centered.";
                return (
                     <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Session Complete!</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">{summaryText}</p>
                        <div className="flex justify-center gap-8 items-center bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                             <div>
                                <p className="text-sm text-slate-500">How you feel now</p>
                                <p className="font-bold text-2xl text-blue-700 dark:text-blue-300">{RATING_LABELS[postRating-1]}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleFinishAndShowFeedback} 
                            className="mt-8 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                           Finish & Close
                        </button>
                    </div>
                );
        }
    };

    return (
        <>
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto text-center">
                    <BookOpenIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Guided Breathing</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 mb-8">
                        Follow these simple exercises to reduce stress and find your center.
                    </p>
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 min-h-[400px]">
                        {renderContent()}
                    </div>
                </div>
            </main>
            {sessionState === 'feedback' && <FeedbackFlow onClose={handleReset} />}
        </>
    );
};