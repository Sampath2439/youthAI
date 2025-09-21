
import React, { useState } from 'react';
import { analyzeFoodImage } from '../services/geminiService';
import { FoodAnalysisResult } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, SparklesIcon } from './IconComponents';

interface MealLoggerProps {
    onClose: () => void;
    onSave: (analysis: FoodAnalysisResult, photo: string) => void;
}

const classificationStyles = {
    Healthy: { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10', icon: <CheckCircleIcon className="w-5 h-5" /> },
    Moderate: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
    Unhealthy: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
};

export const MealLogger: React.FC<MealLoggerProps> = ({ onClose, onSave }) => {
    const [image, setImage] = useState<{ preview: string, file: File } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<FoodAnalysisResult | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState<'photo' | 'manual'>('photo');
    const [manualData, setManualData] = useState<FoodAnalysisResult>({
        mealName: '',
        calories: 0,
        classification: 'Moderate',
        score: 5,
        reasoning: 'Manually logged.',
        mentalWellnessInsight: 'Track your meals to see how they affect your mood and energy.'
    });

    const placeholderIcon = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#e2e8f0"/><text x="50" y="55" font-family="sans-serif" font-size="40" text-anchor="middle" dominant-baseline="middle">🍽️</text></svg>')}`;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setError(null);
            setResult(null);
            setImage({
                preview: URL.createObjectURL(file),
                file: file,
            });
        }
    };

    const fileToBaase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const base64Image = await fileToBaase64(image.file);
            const analysisResult = await analyzeFoodImage(base64Image);
            setResult(analysisResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (result && image) {
            onSave(result, image.preview);
        }
    };

    const handleEdit = () => {
        if (result) {
            setManualData(result);
            setResult(null); // Exit result view
            setMode('manual');
        }
    };
    
    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setManualData(prev => {
            const isNumeric = ['calories', 'score'].includes(name);
            const new_value = isNumeric ? Math.max(0, Number(value)) : value;
            const newData: FoodAnalysisResult = { ...prev, [name]: new_value };

            if (name === 'classification') {
                 switch(value) {
                    case 'Healthy': newData.score = 8; break;
                    case 'Moderate': newData.score = 5; break;
                    case 'Unhealthy': newData.score = 2; break;
                }
            }
            return newData;
        });
    };

    const handleManualSave = (e: React.FormEvent) => {
        e.preventDefault();
        const photoToSave = image ? image.preview : placeholderIcon;
        onSave(manualData, photoToSave);
    };

    const renderPhotoUploader = () => (
        <>
            <div 
                className="w-full h-48 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 mb-4 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                {image ? (
                    <img src={image.preview} alt="Meal preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                    <p className="text-slate-500 dark:text-slate-400">Click to upload photo</p>
                )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
            <button
                onClick={handleAnalyze}
                disabled={!image || isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Meal...
                    </>
                ) : (
                    'Analyze with AI'
                )}
            </button>
            <div className="text-center my-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">or</p>
                <button onClick={() => setMode('manual')} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Enter details manually
                </button>
            </div>
        </>
    );

    const renderResultView = () => (
        <>
            <div className="space-y-4">
                <h4 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">{result?.mealName}</h4>
                <div className="flex justify-around text-center">
                    <div>
                        <p className="text-xs text-slate-500">Calories</p>
                        <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{result?.calories}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Score</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result?.score}/10</p>
                    </div>
                </div>
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${classificationStyles[result!.classification].bg} ${classificationStyles[result!.classification].text}`}>
                    {classificationStyles[result!.classification].icon}
                    <span className="font-semibold">{result!.classification}:</span>
                    <span className="flex-1">{result!.reasoning}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-start gap-3">
                    <SparklesIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">Wellness Insight</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{result!.mentalWellnessInsight}</p>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center gap-3 rounded-b-2xl mt-6 -mx-6 -mb-6">
                <button onClick={handleEdit} className="text-sm font-semibold text-slate-600 dark:text-slate-300">Edit Details</button>
                <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700">Save Meal</button>
            </div>
        </>
    );

    const renderManualForm = () => (
        <form onSubmit={handleManualSave}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="mealName" className="block mb-1 font-semibold text-sm text-slate-600 dark:text-slate-400">Meal Name</label>
                    <input type="text" name="mealName" id="mealName" value={manualData.mealName} onChange={handleManualChange} required className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label htmlFor="calories" className="block mb-1 font-semibold text-sm text-slate-600 dark:text-slate-400">Calories (est.)</label>
                    <input type="number" name="calories" id="calories" value={manualData.calories} onChange={handleManualChange} required className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label htmlFor="classification" className="block mb-1 font-semibold text-sm text-slate-600 dark:text-slate-400">Classification</label>
                    <select name="classification" id="classification" value={manualData.classification} onChange={handleManualChange} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Healthy</option>
                        <option>Moderate</option>
                        <option>Unhealthy</option>
                    </select>
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center gap-3 rounded-b-2xl mt-6 -mx-6 -mb-6">
                <button type="button" onClick={() => setMode('photo')} className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Back to Photo Upload
                </button>
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700">Save Meal</button>
            </div>
        </form>
    );

    const renderContent = () => {
        if (result) {
            return renderResultView();
        }
        if (mode === 'manual') {
            return renderManualForm();
        }
        return renderPhotoUploader();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full m-4 border border-slate-200 dark:border-slate-700 animate-fade-in-up">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {result ? 'AI Analysis Result' : mode === 'manual' ? 'Enter Meal Details' : 'Log Your Meal'}
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-2xl font-bold">&times;</button>
                </div>
                
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
