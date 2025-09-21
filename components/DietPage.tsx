import React, { useState, useEffect, useRef } from 'react';
import { DietSettings, Meal, FoodAnalysisResult, Page } from '../types';
import { DietSetupModal } from './DietSetupModal';
import { analyzeFoodImage } from '../services/geminiService';
import { addWellnessDataPoint } from '../services/historyService';
import { addXP } from '../services/gamificationService';
import { AppleIcon, CheckCircleIcon, SparklesIcon, ExclamationTriangleIcon } from './IconComponents';
import { auth, db } from '../services/firebaseService';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const classificationStyles: Record<FoodAnalysisResult['classification'], { text: string; bg: string; border: string; icon: JSX.Element }> = {
    Healthy: { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/50', border: 'border-green-300 dark:border-green-700', icon: <CheckCircleIcon className="w-5 h-5" /> },
    Moderate: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/50', border: 'border-amber-300 dark:border-amber-700', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
    Unhealthy: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/50', border: 'border-red-300 dark:border-red-700', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
};

const ScoreProgressBar: React.FC<{ score: number; classification: FoodAnalysisResult['classification'] }> = ({ score, classification }) => {
    const style = classificationStyles[classification];
    const bgColor = style.bg.replace('bg-', '').split(' ')[0]; // A bit hacky, but works for tailwind
    const colorClass = `bg-${bgColor}`;

    return (
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
            <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${score * 10}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
    );
};

interface DietPageProps {
    onNavigate: (page: Page) => void;
}

export const DietPage: React.FC<DietPageProps> = ({ onNavigate }) => {
    // This is a comment to force recompilation
    const [settings, setSettings] = useState<DietSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [isLogging, setIsLogging] = useState(false);

    // Photo state
    const [image, setImage] = useState<{ preview: string, file: File } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Manual state
    const [manualMealName, setManualMealName] = useState('');
    const [manualCalories, setManualCalories] = useState('');
    const [manualClassification, setManualClassification] = useState<'Healthy' | 'Moderate' | 'Unhealthy'>('Moderate');
    
    // Analysis editing state
    const [isEditingAnalysis, setIsEditingAnalysis] = useState(false);
    const [editableAnalysisResult, setEditableAnalysisResult] = useState<FoodAnalysisResult | null>(null);


    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            // Load settings from localStorage
            const storedSettings = localStorage.getItem('mindfulme-diet-settings');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }

            // Load today's meals from Firestore
            if (auth.currentUser) {
                const today = new Date();
                const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                const mealsCollection = collection(db, 'meals');
                const q = query(
                    mealsCollection,
                    where("userId", "==", auth.currentUser.uid),
                    where("createdAt", ">=", startOfToday)
                );

                try {
                    const querySnapshot = await getDocs(q);
                    const fetchedMeals: Meal[] = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    } as Meal));
                    setMeals(fetchedMeals);
                    if(fetchedMeals.length > 0) setIsLogging(true);
                } catch (error) {
                    console.error("Error fetching meals: ", error);
                }
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleSaveSettings = (newSettings: DietSettings) => {
        localStorage.setItem('mindfulme-diet-settings', JSON.stringify(newSettings));
        setSettings(newSettings);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPhotoError(null);
            setAnalysisResult(null);
            setIsEditingAnalysis(false);
            setEditableAnalysisResult(null);
            setImage({
                preview: URL.createObjectURL(file),
                file: file,
            });
        }
    };
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setIsAnalyzing(true);
        setPhotoError(null);
        setAnalysisResult(null);
        try {
            const base64Image = await fileToBase64(image.file);
            const result = await analyzeFoodImage(base64Image);
            setAnalysisResult(result);
            setEditableAnalysisResult(result);
        } catch (err) {
            setPhotoError(err instanceof Error ? err.message : "Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleSavePhotoMeal = async () => {
        if (!analysisResult || !image || !auth.currentUser) return;

        const newMeal: Omit<Meal, 'id'> = {
            ...analysisResult,
            photo: image.preview,
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp(),
        };
        
        try {
            const docRef = await addDoc(collection(db, "meals"), newMeal);
            setMeals(prev => [...prev, { ...newMeal, id: docRef.id, createdAt: new Date() }]);
            addWellnessDataPoint(newMeal.score * 10, 'diet');
            
            const xpGained = 5;
            await addXP(xpGained, 'first_diet');
            window.dispatchEvent(new CustomEvent('xp-gain', { detail: { amount: xpGained } }));

            setImage(null);
            setAnalysisResult(null);
            setEditableAnalysisResult(null);
            setIsEditingAnalysis(false);
        } catch (error) {
            console.error("Error saving photo meal: ", error);
        }
    };

    const handleSaveManualMeal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        const calories = parseInt(manualCalories, 10);
        if (isNaN(calories) || !manualMealName.trim()) return;

        const scoreMap = { 'Healthy': 8, 'Moderate': 5, 'Unhealthy': 2 };

        const manualResult: FoodAnalysisResult = {
            mealName: manualMealName,
            calories: calories,
            classification: manualClassification,
            score: scoreMap[manualClassification],
            reasoning: 'Manually logged entry.',
            mentalWellnessInsight: 'Consistent tracking helps reveal patterns between your diet and mood.'
        };
        
        const placeholderIcon = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#e2e8f0"/><text x="50" y="55" font-family="sans-serif" font-size="40" text-anchor="middle" dominant-baseline="middle">🍽️</text></svg>')}`;

        const newMeal: Omit<Meal, 'id'> = {
            ...manualResult,
            photo: placeholderIcon,
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp(),
        };

        try {
            const docRef = await addDoc(collection(db, "meals"), newMeal);
            setMeals(prev => [...prev, { ...newMeal, id: docRef.id, createdAt: new Date() }]);
            addWellnessDataPoint(newMeal.score * 10, 'diet');
            
            const xpGained = 5;
            await addXP(xpGained, 'first_diet');
            window.dispatchEvent(new CustomEvent('xp-gain', { detail: { amount: xpGained } }));
            
            setManualMealName('');
            setManualCalories('');
            setManualClassification('Moderate');
        } catch (error) {
            console.error("Error saving manual meal: ", error);
        }
    };
    
    const handleEditableResultChange = (field: keyof FoodAnalysisResult, value: string | number) => {
        if (!editableAnalysisResult) return;
        
        const updatedResult = { ...editableAnalysisResult, [field]: value };

        if (field === 'classification') {
            const scoreMap = { 'Healthy': 8, 'Moderate': 5, 'Unhealthy': 2 };
            updatedResult.score = scoreMap[value as 'Healthy' | 'Moderate' | 'Unhealthy'];
        }
        
        setEditableAnalysisResult(updatedResult);
    };

    const handleSaveChanges = () => {
        setAnalysisResult(editableAnalysisResult);
        setIsEditingAnalysis(false);
    };

    const averageScore = meals.length > 0 ? meals.reduce((acc, meal) => acc + meal.score, 0) / meals.length : 0;
    const mealsPerDay = settings?.mealsPerDay || 3;

    if (isLoading) return <div className="text-center p-8">Loading...</div>;

    if (!settings) {
        return <DietSetupModal onSave={handleSaveSettings} onClose={() => onNavigate('dashboard')} />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Mindful Eating</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Log your meals to see how your diet impacts your well-being. Use our AI to get instant insights from a photo.
                </p>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Today's Summary</h3>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{meals.length} of {mealsPerDay} meals logged</span>
                </div>
                <div className="text-center my-4">
                    <p className="text-5xl font-bold text-slate-800 dark:text-slate-100">{averageScore.toFixed(1)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Average Score</p>
                </div>
                 <button 
                    onClick={() => setIsLogging(prev => !prev)}
                    className="w-full bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-800 font-semibold text-sm py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
                >
                    {isLogging ? (meals.length > 0 ? 'Hide Logger' : 'Close Logger') : 'Log a Meal'}
                </button>
            </div>
            
            {isLogging && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {/* Photo Uploader */}
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 space-y-4">
                         <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Log with a Photo</h3>
                        <div 
                            className="w-full h-40 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {image ? <img src={image.preview} alt="Meal preview" className="w-full h-full object-cover rounded-lg" /> : <p className="text-slate-500 dark:text-slate-400 text-sm p-4 text-center">Click to upload a photo</p>}
                        </div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                        {photoError && <p className="text-xs text-red-500 text-center">{photoError}</p>}
                        
                        <button onClick={handleAnalyze} disabled={!image || isAnalyzing} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center">
                            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                        </button>

                        {analysisResult && editableAnalysisResult && (
                            <div className="mt-4 p-4 bg-white dark:bg-slate-700/50 rounded-lg shadow-inner space-y-4 animate-fade-in">
                                <h4 className="font-bold text-md text-slate-800 dark:text-slate-100">AI Meal Analysis Result</h4>
                                {isEditingAnalysis ? (
                                    <>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Meal Name</label>
                                                <input type="text" value={editableAnalysisResult.mealName} onChange={e => handleEditableResultChange('mealName', e.target.value)} className="w-full text-sm px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Calories (kcal)</label>
                                                <input type="number" value={editableAnalysisResult.calories} onChange={e => handleEditableResultChange('calories', Number(e.target.value))} className="w-full text-sm px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Classification</label>
                                                <select value={editableAnalysisResult.classification} onChange={e => handleEditableResultChange('classification', e.target.value)} className="w-full text-sm px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg">
                                                    <option>Healthy</option>
                                                    <option>Moderate</option>
                                                    <option>Unhealthy</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end mt-4">
                                            <button onClick={() => {setIsEditingAnalysis(false); setEditableAnalysisResult(analysisResult);}} className="text-sm font-semibold text-slate-600 dark:text-slate-300 py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                                            <button onClick={handleSaveChanges} className="bg-blue-600 text-white font-semibold text-sm py-2 px-4 rounded-lg hover:bg-blue-700">Save Changes</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Meal Name</p>
                                                <p className="text-slate-800 dark:text-slate-100 font-semibold">{analysisResult.mealName}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Calories (estimated)</p>
                                                    <p className="text-slate-800 dark:text-slate-100 font-semibold">{analysisResult.calories} kcal</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Classification</p>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classificationStyles[analysisResult.classification].bg} ${classificationStyles[analysisResult.classification].text}`}>
                                                        {analysisResult.classification}
                                                    </span>
                                                </div>
                                            </div>
                                             <div>
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Score: <span className="font-bold text-slate-700 dark:text-slate-200">{analysisResult.score}/10</span></p>
                                                <ScoreProgressBar score={analysisResult.score} classification={analysisResult.classification} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Reasoning</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{analysisResult.reasoning}"</p>
                                            </div>
                                            <div className={`${classificationStyles[analysisResult.classification].bg} p-3 rounded-lg`}>
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mental Wellness Insight</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-200">{analysisResult.mentalWellnessInsight}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end mt-4 border-t border-slate-200 dark:border-slate-600 pt-3">
                                            <button onClick={() => setIsEditingAnalysis(true)} className="text-sm font-semibold text-slate-600 dark:text-slate-300 py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Edit Details</button>
                                            <button onClick={handleSavePhotoMeal} className="bg-emerald-600 text-white font-semibold text-sm py-2 px-4 rounded-lg hover:bg-emerald-700">Save Meal</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Manual Entry */}
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 space-y-4">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Log Manually</h3>
                         <form onSubmit={handleSaveManualMeal} className="space-y-3">
                            <div>
                                <label htmlFor="manualMealName" className="block mb-1 font-semibold text-xs text-slate-600 dark:text-slate-400">Meal Name</label>
                                <input type="text" id="manualMealName" value={manualMealName} onChange={e => setManualMealName(e.target.value)} required className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"/>
                            </div>
                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="manualCalories" className="block mb-1 font-semibold text-xs text-slate-600 dark:text-slate-400">Calories</label>
                                    <input type="number" id="manualCalories" value={manualCalories} onChange={e => setManualCalories(e.target.value)} required className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"/>
                                </div>
                                <div>
                                    <label htmlFor="manualClassification" className="block mb-1 font-semibold text-xs text-slate-600 dark:text-slate-400">Classification</label>
                                    <select id="manualClassification" value={manualClassification} onChange={e => setManualClassification(e.target.value as any)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                        <option>Healthy</option>
                                        <option>Moderate</option>
                                        <option>Unhealthy</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700">Save Manual Meal</button>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Meals List */}
            {meals.length > 0 && (
                 <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-4 rounded-2xl shadow-md border border-white/30">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4 px-2">Today's Logged Meals</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100/50 dark:bg-slate-700/50 dark:text-slate-300">
                                <tr>
                                    <th scope="col" className="px-4 py-3 rounded-l-lg">Meal</th>
                                    <th scope="col" className="px-4 py-3">Calories</th>
                                    <th scope="col" className="px-4 py-3">Classification</th>
                                    <th scope="col" className="px-4 py-3 rounded-r-lg text-center">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meals.map(meal => (
                                    <tr key={meal.id} className="border-b dark:border-slate-700">
                                        <td className="px-4 py-2 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                            <img src={meal.photo} alt={meal.mealName} className="w-10 h-10 rounded-md object-cover"/>
                                            <span>{meal.mealName}</span>
                                        </td>
                                        <td className="px-4 py-2">{meal.calories} kcal</td>
                                        <td className="px-4 py-2">
                                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classificationStyles[meal.classification].bg} ${classificationStyles[meal.classification].text}`}>
                                                {meal.classification}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="text-base font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                                                {meal.score}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            )}
        </div>
    );
};