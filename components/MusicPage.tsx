

import React, { useState, useRef } from 'react';
import { getMusicRecommendation } from '../services/geminiService';
import { MusicGenerationResult } from '../types';
import { MusicNoteIcon, SparklesIcon } from './IconComponents';

const AUDIO_SOURCES: Record<MusicGenerationResult['category'], string> = {
  'Calm Piano': 'https://cdn.pixabay.com/audio/2022/10/24/audio_9650398235.mp3',
  'Ambient Space': 'https://cdn.pixabay.com/audio/2023/06/18/audio_18898b1e42.mp3',
  'Nature Sounds': 'https://cdn.pixabay.com/audio/2022/11/17/audio_82a392d572.mp3',
  'Lofi Beats': 'https://cdn.pixabay.com/audio/2022/05/27/audio_15dfb7fb4c.mp3',
};


export const MusicPage: React.FC = () => {
    const [mood, setMood] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<MusicGenerationResult | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mood.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResult(null);
        if (audioRef.current) {
            audioRef.current.pause();
        }

        try {
            const data = await getMusicRecommendation(mood);
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate music.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
                <MusicNoteIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">AI Music Scapes</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2 mb-8">
                    Describe your current mood or what you need to focus on, and let our AI create a personalized soundscape for you.
                </p>

                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <input
                            type="text"
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                            placeholder="e.g., 'stressed about work' or 'need to focus'"
                            className="flex-grow bg-transparent p-2 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !mood.trim()} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Generating...' : 'Create'}
                        </button>
                    </div>
                </form>

                {isLoading && (
                    <div className="flex justify-center items-center p-6">
                         <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-lg text-slate-600 dark:text-slate-400">AI is composing your soundscape...</p>
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-800 dark:text-red-300">
                        <p>{error}</p>
                    </div>
                )}
                {result && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center text-blue-600 dark:text-blue-400 mb-3">
                            <SparklesIcon className="h-6 w-6" />
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 ml-2 text-xl">{result.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{result.description}</p>
                        <audio ref={audioRef} src={AUDIO_SOURCES[result.category]} controls autoPlay className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Music Category: {result.category}</p>
                    </div>
                )}
            </div>
        </main>
    );
};