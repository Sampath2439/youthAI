import React, { useState, useEffect, useRef } from 'react';
import { DietSettings } from '../types';

interface DietSetupModalProps {
    onSave: (settings: DietSettings) => void;
    onClose: () => void;
}

export const DietSetupModal: React.FC<DietSetupModalProps> = ({ onSave, onClose }) => {
    const [mealsPerDay, setMealsPerDay] = useState('');
    const [error, setError] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mealsPerDay) {
            setError('Please select number of meals.');
            return;
        }
        setError(null);
        onSave({ mealsPerDay: Number(mealsPerDay) });
    };

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Focus trapping
    useEffect(() => {
        const modalElement = modalRef.current;
        if (modalElement) {
            const focusableElements = modalElement.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            firstElement?.focus();

            const handleTabKey = (event: KeyboardEvent) => {
                if (event.key === 'Tab') {
                    if (document.activeElement === lastElement && !event.shiftKey) {
                        firstElement.focus();
                        event.preventDefault();
                    } else if (document.activeElement === firstElement && event.shiftKey) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                }
            };
            
            modalElement.addEventListener('keydown', handleTabKey);
            return () => modalElement.removeEventListener('keydown', handleTabKey);
        }
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="setup-modal-title"
        >
            <div
                ref={modalRef}
                className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-[420px] m-4 border border-slate-200 dark:border-slate-700 p-8 text-center animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <h2 id="setup-modal-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100">Set your daily meals</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 mb-6">
                    Choose how many meals you plan to log today. You can update this later.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="mealsPerDay" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-left">
                            Meals per day
                        </label>
                        <select
                            id="mealsPerDay"
                            value={mealsPerDay}
                            onChange={(e) => {
                                setMealsPerDay(e.target.value);
                                if (e.target.value) setError(null);
                            }}
                            className="px-4 py-2 w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Select number of meals per day"
                            required
                        >
                            <option value="" disabled>Select meals</option>
                            {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        {error && <p className="text-red-500 text-xs text-left mt-1">{error}</p>}
                    </div>
                    <div className="flex justify-center items-center gap-4 pt-4">
                         <button
                            type="button"
                            onClick={onClose}
                            className="w-full bg-transparent text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 border border-slate-300 dark:border-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-full text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            style={{ backgroundColor: '#5B6EF8' }}
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
