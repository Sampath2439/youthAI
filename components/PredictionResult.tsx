
import React, { useEffect, useState } from 'react';
import { PredictionResultData } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, SparklesIcon, MusicNoteIcon, YogaIcon } from './IconComponents';
import { addWellnessDataPoint } from '../services/historyService';
import { getImagePromptSuggestion } from '../services/geminiService';

interface PredictionResultProps {
  isLoading: boolean;
  prediction: PredictionResultData | null;
  error: string | null;
  onNavigateToImageStudio: (prompt: string) => void;
}

const statusStyles: { [key: string]: { icon: React.ReactNode; bg: string; text: string; ring: string, darkBg: string, darkText: string } } = {
  'Thriving': { icon: <CheckCircleIcon className="h-8 w-8 text-emerald-500" />, bg: 'bg-emerald-50', text: 'text-emerald-800', ring: 'ring-emerald-500', darkBg: 'dark:bg-emerald-500/10', darkText: 'dark:text-emerald-300' },
  'Balanced': { icon: <CheckCircleIcon className="h-8 w-8 text-sky-500" />, bg: 'bg-sky-50', text: 'text-sky-800', ring: 'ring-sky-500', darkBg: 'dark:bg-sky-500/10', darkText: 'dark:text-sky-300' },
  'Stressed': { icon: <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />, bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-500', darkBg: 'dark:bg-amber-500/10', darkText: 'dark:text-amber-300' },
  'At Risk': { icon: <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />, bg: 'bg-red-50', text: 'text-red-800', ring: 'ring-red-500', darkBg: 'dark:bg-red-500/10', darkText: 'dark:text-red-300' },
  'Default': { icon: <SparklesIcon className="h-8 w-8 text-slate-500" />, bg: 'bg-slate-100', text: 'text-slate-800', ring: 'ring-slate-500', darkBg: 'dark:bg-slate-800', darkText: 'dark:text-slate-300' }
};

const ScoreRing: React.FC<{ score: number, ringColor: string }> = ({ score, ringColor }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    return (
        <div className="relative w-28 h-28">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-slate-200 dark:text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className={ringColor}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-slate-700 dark:text-slate-200">{score}</span>
            </div>
        </div>
    );
};

const PredictionResult: React.FC<PredictionResultProps> = ({ isLoading, prediction, error, onNavigateToImageStudio }) => {
  const [imagePromptSuggestion, setImagePromptSuggestion] = useState<string | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  useEffect(() => {
    if (prediction && !imagePromptSuggestion && !isLoadingSuggestion) {
      const fetchSuggestion = async () => {
        setIsLoadingSuggestion(true);
        try {
          const prompt = await getImagePromptSuggestion(prediction);
          setImagePromptSuggestion(prompt);
        } catch (err) {
          // Fail silently, it's a non-critical enhancement
          console.error(err);
        } finally {
          setIsLoadingSuggestion(false);
        }
      };
      fetchSuggestion();
    }
    // Reset suggestion if prediction is cleared
    if (!prediction) {
      setImagePromptSuggestion(null);
    }
  }, [prediction, imagePromptSuggestion, isLoadingSuggestion]);


  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <div className="flex justify-center items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-slate-600 dark:text-slate-400">AI is analyzing your inputs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-800 dark:text-red-300">
        <h3 className="font-bold">An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }
  
  const style = statusStyles[prediction.status] || statusStyles['Default'];

  return (
    <div className={`mt-10 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 ${style.bg} ${style.darkBg}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center justify-center text-center">
                <ScoreRing score={prediction.wellnessScore} ringColor={`${style.text} ${style.darkText}`} />
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">Wellness Score</h3>
            </div>
            <div className="md:col-span-2">
                <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4 mt-1">{style.icon}</div>
                    <div>
                        <h2 className={`text-xl font-bold ${style.text} ${style.darkText}`}>Predicted Status: {prediction.status}</h2>
                        <p className={`mt-2 text-slate-700 dark:text-slate-300`}>{prediction.reasoning}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/70 dark:bg-slate-900/50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                    <YogaIcon className="h-6 w-6 text-blue-500 mr-2"/>
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">Yoga Suggestion</h4>
                </div>
                <h5 className="font-semibold text-blue-800 dark:text-blue-300">{prediction.yogaSuggestion.name}</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{prediction.yogaSuggestion.description}</p>
            </div>
            <div className="bg-white/70 dark:bg-slate-900/50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                    <MusicNoteIcon className="h-6 w-6 text-blue-500 mr-2"/>
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">Music Suggestion</h4>
                </div>
                <h5 className="font-semibold text-blue-800 dark:text-blue-300">{prediction.musicSuggestion.genre}</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{prediction.musicSuggestion.description}</p>
            </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center mb-2">
                <SparklesIcon className="h-6 w-6 text-blue-500 mr-2"/>
                <h4 className="font-bold text-slate-700 dark:text-slate-200">Visualize Your Wellness</h4>
            </div>
            <div className="bg-white/70 dark:bg-slate-900/50 p-4 rounded-lg">
                {isLoadingSuggestion ? (
                    <div className="h-12 flex items-center justify-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">AI is crafting a visual prompt for you...</p>
                    </div>
                ) : imagePromptSuggestion ? (
                    <>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{imagePromptSuggestion}"</p>
                        <div className="flex justify-end mt-3">
                            <button 
                                onClick={() => onNavigateToImageStudio(imagePromptSuggestion)}
                                className="bg-blue-600 text-white font-semibold text-sm py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Generate in Image Studio
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Could not generate a prompt suggestion at this time.</p>
                )}
            </div>
        </div>

        <p className="mt-6 text-xs text-slate-500 dark:text-slate-400 italic text-center">
            Disclaimer: This is an AI-generated prediction and not a medical diagnosis. Please consult a professional for health advice.
        </p>
    </div>
  );
};

export default PredictionResult;
