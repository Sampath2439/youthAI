import React, { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types';
import { getJournalPrompt, getJournalReflection } from '../services/geminiService';
import { addXP } from '../services/gamificationService';
import { PenSquareIcon, SparklesIcon, ChevronDownIcon } from './IconComponents';

const JOURNAL_KEY = 'mindfulme-journal-entries';

const getFormattedDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const JournalPage: React.FC = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [todaysEntry, setTodaysEntry] = useState<JournalEntry | null>(null);
    const [prompt, setPrompt] = useState<string | null>(null);
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
    const [isLoadingReflection, setIsLoadingReflection] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeEntryId, setActiveEntryId] = useState<number | null>(null);

    // Load entries and today's prompt
    useEffect(() => {
        try {
            const storedEntries = localStorage.getItem(JOURNAL_KEY);
            const allEntries: JournalEntry[] = storedEntries ? JSON.parse(storedEntries) : [];
            allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const todayStr = new Date().toISOString().split('T')[0];
            const existingToday = allEntries.find(e => e.date.startsWith(todayStr));
            
            setEntries(allEntries.filter(e => !e.date.startsWith(todayStr)));
            
            if (existingToday) {
                setTodaysEntry(existingToday);
                setPrompt(existingToday.prompt);
                setIsLoadingPrompt(false);
            } else {
                const fetchPrompt = async () => {
                    try {
                        setError(null);
                        const newPrompt = await getJournalPrompt();
                        setPrompt(newPrompt);
                    } catch (err) {
                        setError(err instanceof Error ? err.message : 'Could not load prompt.');
                        setPrompt("What is on your mind today?"); // Fallback prompt
                    } finally {
                        setIsLoadingPrompt(false);
                    }
                };
                fetchPrompt();
            }
        } catch (e) {
            console.error("Failed to load journal entries.", e);
            setError("Could not load your journal entries.");
            setIsLoadingPrompt(false);
        }
    }, []);
    
    const handleContentChange = (content: string) => {
        if (todaysEntry) {
            setTodaysEntry({ ...todaysEntry, content });
        } else if (prompt) {
            const todayStr = new Date().toISOString();
            setTodaysEntry({
                id: Date.now(),
                date: todayStr,
                prompt: prompt,
                content: content,
            });
        }
    };

    const handleSaveAndReflect = async () => {
        if (!todaysEntry || !todaysEntry.content.trim()) return;

        setIsLoadingReflection(true);
        setError(null);
        
        try {
            const reflection = await getJournalReflection(todaysEntry.content);
            const finalEntry = { ...todaysEntry, reflection };
            setTodaysEntry(finalEntry);

            // Save to local storage
            const updatedEntries = [finalEntry, ...entries];
            setEntries(updatedEntries.filter(e => !e.date.startsWith(finalEntry.date.split('T')[0])));
            localStorage.setItem(JOURNAL_KEY, JSON.stringify(updatedEntries));

            // Add XP for journaling
            const xpGained = 10;
            addXP(xpGained, 'first_journal');
            window.dispatchEvent(new CustomEvent('xp-gain', { detail: { amount: xpGained } }));

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get AI reflection.");
        } finally {
            setIsLoadingReflection(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <PenSquareIcon className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Guided Journal</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    A calm space to explore your thoughts. Your AI companion will provide a gentle prompt to get you started.
                </p>
            </div>

            {/* Today's Entry */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Today's Entry</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{getFormattedDate(new Date().toISOString())}</p>

                <div className="bg-blue-50 dark:bg-blue-900/40 p-4 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">Today's Prompt:</p>
                    {isLoadingPrompt ? (
                        <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded-md animate-pulse w-3/4"></div>
                    ) : (
                        <p className="text-blue-900 dark:text-blue-100 font-medium italic">"{prompt}"</p>
                    )}
                </div>

                <textarea
                    value={todaysEntry?.content || ''}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Start writing here..."
                    className="w-full h-48 p-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    readOnly={!!todaysEntry?.reflection}
                    aria-label="Journal entry input"
                />

                {error && <p className="text-sm text-red-600 dark:text-red-400 text-center my-2">{error}</p>}

                {todaysEntry?.reflection ? (
                    <div className="mt-4 p-4 border-l-4 border-blue-400 bg-slate-50 dark:bg-slate-700/50 rounded-r-lg">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 mb-2">
                             <SparklesIcon className="w-5 h-5" />
                             <h4 className="font-bold">AI Reflection</h4>
                        </div>
                        <blockquote className="text-sm text-slate-700 dark:text-slate-300 italic">
                            {todaysEntry.reflection}
                        </blockquote>
                    </div>
                ) : (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleSaveAndReflect}
                            disabled={isLoadingReflection || !todaysEntry?.content.trim()}
                            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center transition-colors"
                        >
                            {isLoadingReflection ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Reflecting...
                                </>
                            ) : (
                               'Save & Reflect'
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Past Entries */}
            {entries.length > 0 && (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30">
                     <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Past Entries</h3>
                     <div className="space-y-2">
                        {entries.map(entry => (
                            <div key={entry.id} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                                <button
                                    onClick={() => setActiveEntryId(activeEntryId === entry.id ? null : entry.id)}
                                    className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-700 dark:text-slate-200">{getFormattedDate(entry.date)}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate max-w-xs sm:max-w-md">"{entry.prompt}"</p>
                                    </div>
                                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 transform transition-transform ${activeEntryId === entry.id ? 'rotate-180' : ''}`} />
                                </button>
                                {activeEntryId === entry.id && (
                                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{entry.content}</p>
                                        {entry.reflection && (
                                            <div className="p-3 border-l-4 border-blue-400 bg-slate-50 dark:bg-slate-700/50 rounded-r-lg">
                                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 mb-1">
                                                    <SparklesIcon className="w-4 h-4" />
                                                    <h4 className="font-bold text-sm">AI Reflection</h4>
                                                </div>
                                                <blockquote className="text-xs text-slate-700 dark:text-slate-300 italic">
                                                    {entry.reflection}
                                                </blockquote>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
    );
};