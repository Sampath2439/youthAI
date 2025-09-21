import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon } from './IconComponents';
import { CheckInModal } from './CheckInModal'; // Import the new modal component
import { AdaptiveSuggestionCard } from './AdaptiveSuggestionCard'; // Import the new suggestion card component
import { DigitalTwinOfYourMind } from './DigitalTwinOfYourMind'; // Import the new Digital Twin component
import { GuidedSelfTherapyStorylines } from './GuidedSelfTherapyStorylines'; // Import the new Guided Self-Therapy Storylines component

interface ExplorePageProps {
  onNavigate: (page: Page) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate }) => {
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [mood, setMood] = useState<'calm' | 'stressed' | 'tired' | null>(null);
  const [demoPersona, setDemoPersona] = useState<'none' | 'stressed' | 'calm' | 'tired'>('none');

  const handleCheckIn = (selectedMood: 'calm' | 'stressed' | 'tired') => {
    setMood(selectedMood);
    setIsCheckInModalOpen(false);
    // In a real app, this would trigger fetching adaptive suggestions
  };

  useEffect(() => {
    if (demoPersona !== 'none') {
      handleCheckIn(demoPersona === 'calm' ? 'calm' : demoPersona === 'stressed' ? 'stressed' : 'tired');
    }
  }, [demoPersona]);

  const getSuggestion = () => {
    if (!mood) return null;

    switch (mood) {
      case 'stressed':
        return {
          title: "Try a 3-Minute Grounding Exercise",
          description: "Reconnect with the present moment and calm your mind.",
          cta: "Start Now",
          link: 'meditation',
        };
      case 'tired':
        return {
          title: "Listen to a Soothing Music Scape",
          description: "Recharge your energy with calming sounds.",
          cta: "Listen Now",
          link: 'music',
        };
      case 'calm':
        return {
          title: "Reflect with a Journaling Prompt",
          description: "Deepen your self-awareness and capture your thoughts.",
          cta: "Write Now",
          link: 'journal',
        };
      default:
        return null;
    }
  };

  const suggestion = getSuggestion();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 text-slate-800 dark:text-slate-100 relative">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-4">Explore Your Wellness Journey</h1>
        <p className="text-base sm:text-lg text-center text-blue-100 mb-8">
          Personalized pathways based on your current mood and activities.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-4 right-4 z-10">
            <select
              value={demoPersona}
              onChange={(e) => setDemoPersona(e.target.value as 'none' | 'stressed' | 'calm' | 'tired')}
              className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 p-2 rounded-lg shadow-md"
            >
              <option value="none">Select Demo Persona</option>
              <option value="stressed">Stressed Persona</option>
              <option value="calm">Calm Persona</option>
              <option value="tired">Tired Persona</option>
            </select>
          </div>
        )}

        <div className="text-center mb-8">
          <button
            onClick={() => setIsCheckInModalOpen(true)}
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Start Check-In
          </button>
        </div>

        <AdaptiveSuggestionCard mood={mood} suggestion={suggestion} onNavigate={onNavigate} />

        {/* Placeholder for other cards/journeys */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Mindfulness Basics</h3>
            <p className="text-slate-600 dark:text-slate-300">Learn the foundations of mindfulness meditation.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Stress Reduction</h3>
            <p className="text-slate-600 dark:text-slate-300">Techniques to manage and reduce daily stress.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Sleep Improvement</h3>
            <p className="text-slate-600 dark:text-slate-300">Guided practices for a more restful night.</p>
          </div>
        </div>

        {/* New sections */}
        <DigitalTwinOfYourMind />
        <GuidedSelfTherapyStorylines />

      </div>

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onCheckIn={handleCheckIn}
      />
    </div>
  );
};

export default ExplorePage;