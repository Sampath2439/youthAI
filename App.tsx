import React, { useState, useCallback, useEffect } from 'react';
import { FormData, PredictionResultData, Page, Theme } from './types';
import { getWellBeingPrediction, getRefinedWellBeingPrediction } from './services/geminiService';
import FormInput from './components/FormInput';
import FormSelect from './components/FormSelect';
import FormRadioGroup from './components/FormRadioGroup';
import PredictionResult from './components/PredictionResult';
import { DashboardPage } from './components/DashboardPage';
import { CoachPage } from './components/CoachPage';
import { MeditationPage } from './components/MeditationPage';
import { MusicPage } from './components/MusicPage';
import { SettingsPage } from './components/SettingsPage';
import { DietPage } from './components/DietPage';
import { ImageStudioPage } from './components/ImageStudioPage';
import { JournalPage } from './components/JournalPage';
import { HelpPage } from './components/HelpPage';
import { CalmArcadePage } from './components/CalmArcadePage';
import { XPToast } from './components/XPToast';
import Sidebar from './components/Sidebar';
import AppHeader from './components/AppHeader';
import { LandingPage } from './components/LandingPage';

// Predictor Page Component (The original form)
const PredictorPage: React.FC<{ onNavigate: (page: Page, payload?: { initialPrompt?: string }) => void }> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<FormData>({
    gender: 'Female', age: '21', city: 'New York', profession: 'Student',
    cgpa: '3.5-4.0', degree: 'Bachelors', academicSatisfaction: '4',
    sleepDuration: '7', dietaryHabits: 'Healthy', suicidalThoughts: 'No',
    workStudyBalance: '3', financialStatus: 'Stable', familyHistory: 'No',
    screenTime: '5', physicalActivity: '3', selfTime: '2', socialLife: '4',
  });
  const [prediction, setPrediction] = useState<PredictionResultData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefinement, setIsRefinement] = useState<boolean>(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      let result;
      if (isRefinement && prediction) {
        result = await getRefinedWellBeingPrediction(formData, prediction);
      } else {
        setPrediction(null); // Clear old prediction on new submission
        result = await getWellBeingPrediction(formData);
      }
      setPrediction(result);
      setIsRefinement(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartRefinement = () => {
    setIsRefinement(true);
  };

  const satisfactionOptions = [
    { value: '1', label: '1 (Low)' }, { value: '2', label: '2' },
    { value: '3', label: '3 (Mid)' }, { value: '4', label: '4' }, { value: '5', label: '5 (High)' }
  ];
  
  const isFormDisabled = !isLoading && !!prediction && !isRefinement;

  const handleNavigateToImageStudio = (prompt: string) => {
    onNavigate('imageStudio', { initialPrompt: prompt });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-4">Wellness Predictor</h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
          Fill in the details below to get an AI-powered analysis of your well-being. This tool provides insights based on the patterns in the data you provide.
        </p>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <h3 className="col-span-full text-xl font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-2 mb-2">Demographics</h3>
            <FormSelect name="gender" label="Gender" value={formData.gender} onChange={handleChange} options={['Female', 'Male', 'Other']} disabled={isFormDisabled} />
            <FormInput name="age" label="Age" type="number" value={formData.age} onChange={handleChange} placeholder="e.g., 21" disabled={isFormDisabled} />
            <FormInput name="city" label="City" value={formData.city} onChange={handleChange} placeholder="e.g., San Francisco" disabled={isFormDisabled} />
            
            <h3 className="col-span-full text-xl font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-2 mt-6 mb-2">Academics & Profession</h3>
            <FormInput name="profession" label="Profession" value={formData.profession} onChange={handleChange} placeholder="e.g., Software Engineer" disabled={isFormDisabled} />
            <FormInput name="degree" label="Highest Degree" value={formData.degree} onChange={handleChange} placeholder="e.g., Masters" disabled={isFormDisabled} />
            <FormSelect name="cgpa" label="CGPA" value={formData.cgpa} onChange={handleChange} options={['< 2.5', '2.5-3.0', '3.0-3.5', '3.5-4.0']} disabled={isFormDisabled} />
            
            <div className="col-span-full"><FormRadioGroup name="academicSatisfaction" label="Academic Satisfaction" value={formData.academicSatisfaction} onChange={handleChange} options={satisfactionOptions} disabled={isFormDisabled} /></div>

            <h3 className="col-span-full text-xl font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-2 mt-6 mb-2">Lifestyle & Habits</h3>
            <FormInput name="sleepDuration" label="Sleep Duration (hours/night)" type="number" value={formData.sleepDuration} onChange={handleChange} placeholder="e.g., 8" disabled={isFormDisabled} />
            <FormInput name="screenTime" label="Screen Time (hours/day)" type="number" value={formData.screenTime} onChange={handleChange} placeholder="e.g., 6" disabled={isFormDisabled} />
            <FormInput name="physicalActivity" label="Physical Activity (hours/week)" type="number" value={formData.physicalActivity} onChange={handleChange} placeholder="e.g., 3" disabled={isFormDisabled} />
            <FormSelect name="dietaryHabits" label="Dietary Habits" value={formData.dietaryHabits} onChange={handleChange} options={['Healthy', 'Mixed', 'Unhealthy']} disabled={isFormDisabled} />

            <h3 className="col-span-full text-xl font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-2 mt-6 mb-2">Well-being & Social Factors</h3>
            <div className="col-span-full"><FormRadioGroup name="workStudyBalance" label="Work/Study Balance" value={formData.workStudyBalance} onChange={handleChange} options={satisfactionOptions} disabled={isFormDisabled} /></div>
            <div className="col-span-full"><FormRadioGroup name="socialLife" label="Social Life Satisfaction" value={formData.socialLife} onChange={handleChange} options={satisfactionOptions} disabled={isFormDisabled} /></div>
            <FormInput name="selfTime" label="Self-care Time (hours/week)" type="number" value={formData.selfTime} onChange={handleChange} placeholder="e.g., 5" disabled={isFormDisabled} />
            <FormSelect name="financialStatus" label="Financial Status" value={formData.financialStatus} onChange={handleChange} options={['Stressed', 'Stable', 'Comfortable']} disabled={isFormDisabled} />
            <FormRadioGroup name="familyHistory" label="Family History of Mental Illness" value={formData.familyHistory} onChange={handleChange} options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} disabled={isFormDisabled} />
            <FormRadioGroup name="suicidalThoughts" label="Suicidal Thoughts (Recently)" value={formData.suicidalThoughts} onChange={handleChange} options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', 'label': 'No' }]} disabled={isFormDisabled} />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-600 flex justify-center">
            <button type="submit" disabled={isLoading} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-300">
              {isLoading ? 'Analyzing...' : (isRefinement ? 'Refine Prediction' : 'Get Prediction')}
            </button>
          </div>
        </form>
        <PredictionResult isLoading={isLoading} prediction={prediction} error={error} onNavigateToImageStudio={handleNavigateToImageStudio} />
        
        {prediction && !isRefinement && !isLoading && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleStartRefinement}
              className="bg-transparent text-blue-600 dark:text-blue-400 font-bold py-3 px-8 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-2 border-blue-600 dark:border-blue-400 transition-colors duration-300"
            >
              Edit & Refine Prediction
            </button>
          </div>
        )}

      </div>
    </main>
  );
};

import { ExplorePage } from './components/ExplorePage';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isGameMode, setIsGameMode] = useState(false); // Define isGameMode
  const [theme, setTheme] = useState<Theme>('light'); // Placeholder for theme
  const [gameSubtitle, setGameSubtitle] = useState<string>(''); // Placeholder for gameSubtitle

  const handleNavigate = (page: Page, payload?: { initialPrompt?: string }) => {
    setCurrentPage(page);
    // Logic to set isGameMode based on page, if needed
    // For example: setIsGameMode(page === 'calmArcade' || page === 'someOtherGamePage');
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => !prev);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }; // Placeholder for toggleTheme

  const gameBackAction = () => {
    // Placeholder for game back action
    setIsGameMode(false);
    setGameSubtitle('');
  }; // Placeholder for gameBackAction

  const handleLogin = () => {
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onLogin={handleLogin} />;
      case 'dashboard':
        return <DashboardPage />;
      case 'predictor':
        return <PredictorPage />;
      case 'aiTherapist':
        return <CoachPage />;
      case 'meditation':
        return <MeditationPage />;
      case 'music':
        return <MusicPage />;
      case 'settings':
        return <SettingsPage />;
      case 'diet':
        return <DietPage />;
      case 'imageStudio':
        return <ImageStudioPage />;
      case 'journal':
        return <JournalPage />;
      case 'help':
        return <HelpPage />;
      case 'calmArcade':
        return <CalmArcadePage />;
      case 'explore':
        return <ExplorePage onNavigate={setCurrentPage} />;
      default:
        return <DashboardPage />;
    }
  };

  if (currentPage === 'landing') {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex font-sans">
      <XPToast />
      {!isGameMode && (
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={handleNavigate} 
          isExpanded={isSidebarExpanded}
          onToggle={toggleSidebar}
        />
      )}
      <div className="flex-grow flex flex-col h-screen">
        <main className={`flex-grow overflow-y-auto flex flex-col ${isGameMode ? 'p-0' : 'p-6'}`}>
          <AppHeader 
            currentPage={currentPage} 
            theme={theme} 
            toggleTheme={toggleTheme} 
            onNavigate={handleNavigate}
            isGameMode={isGameMode}
            subtitle={gameSubtitle}
            onGameBack={gameBackAction}
          />
          <div className="flex-grow">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;