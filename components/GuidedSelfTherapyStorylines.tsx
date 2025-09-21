import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenIcon, SunIcon, LeafIcon, ShieldIcon, ChevronRightIcon } from './IconComponents';

interface StorylineCardProps {
  icon: React.ElementType;
  title: string;
  tagline: string;
  progress: number;
  onStartContinue: () => void;
  isRecommended?: boolean;
}

const StorylineCard: React.FC<StorylineCardProps> = ({ icon: Icon, title, tagline, progress, onStartContinue, isRecommended }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300"
  >
    {isRecommended && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md"
      >
        Recommended for You!
      </motion.div>
    )}
    <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
      <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
    </div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow">{tagline}</p>
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-4">
      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
    <button
      onClick={onStartContinue}
      className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
    >
      {progress > 0 ? 'Continue' : 'Start'} <ChevronRightIcon className="w-5 h-5" />
    </button>
  </motion.div>
);

interface StorylineFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyline: any; // Replace 'any' with a proper type for storyline content
  currentDay: number;
  onNextStep: () => void;
}

const StorylineFlowModal: React.FC<StorylineFlowModalProps> = ({ isOpen, onClose, storyline, currentDay, onNextStep }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{storyline.title} - Day {currentDay}</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">{storyline.days[currentDay - 1].narrative}</p>
            <div className="mb-6">
              {/* Render activity based on storyline.days[currentDay - 1].activityType */}
              <p className="font-semibold">Activity: {storyline.days[currentDay - 1].activity}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Day {currentDay} of {storyline.days.length}</span>
              <button
                onClick={onNextStep}
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                {storyline.days[currentDay - 1].nextStepText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const GuidedSelfTherapyStorylines: React.FC = () => {
  const [wellnessScore, setWellnessScore] = useState<number | null>(null);
  const [recommendedStorylineId, setRecommendedStorylineId] = useState<string | null>(null);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [currentStoryline, setCurrentStoryline] = useState<any>(null); // Type this properly
  const [currentDay, setCurrentDay] = useState(1);
  const [demoMode, setDemoMode] = useState(false);
  const [demoWellnessScore, setDemoWellnessScore] = useState<'none' | 'low' | 'medium' | 'high'>('none');

  const storylines = [
    {
      id: 'resilienceBoost',
      icon: ShieldIcon,
      title: "Resilience Boost",
      tagline: "A 7-day branching journey to build inner strength and cope with challenges.",
      progress: 0,
      days: [
        { narrative: "Welcome to your Resilience Boost journey. Today, we'll focus on acknowledging your feelings.", activity: "Journal: Write about a recent challenge and how it made you feel.", nextStepText: "Reflect" },
        { narrative: "Day 2: Understanding your triggers. What situations or thoughts tend to make you feel overwhelmed?", activity: "Mini-Meditation: 5-minute guided breathwork for stress.", nextStepText: "Breathe" },
        { narrative: "Day 3: Practicing self-compassion. Treat yourself with the same kindness you'd offer a friend.", activity: "Micro-Game: 'Positive Affirmation' word scramble.", nextStepText: "Play" },
        { narrative: "Day 4: Identifying your support system. Who can you reach out to when you need help?", activity: "Journal: List 3 people you trust and why.", nextStepText: "Reflect" },
        { narrative: "Day 5: Setting healthy boundaries. Protecting your energy is crucial for resilience.", activity: "Mini-Meditation: 3-minute body scan for awareness.", nextStepText: "Breathe" },
        { narrative: "Day 6: Celebrating small victories. Acknowledge your progress, no matter how small.", activity: "Micro-Game: 'Gratitude' matching game.", nextStepText: "Play" },
        { narrative: "Day 7: Looking forward. You've built a stronger foundation for resilience.", activity: "Journal: Write about one new coping mechanism you've learned.", nextStepText: "Complete" },
      ]
    },
    {
      id: 'balanceSelfCare',
      icon: LeafIcon,
      title: "Balance & Self-Care",
      tagline: "Discover daily rituals to maintain harmony and nurture your well-being.",
      progress: 0,
      days: [
        { narrative: "Welcome to Balance & Self-Care. Today, let's assess your current self-care routine.", activity: "Journal: What does self-care mean to you?", nextStepText: "Reflect" },
        { narrative: "Day 2: Incorporating mindful moments. Find small pockets of peace in your day.", activity: "Mini-Meditation: 2-minute mindful eating exercise.", nextStepText: "Breathe" },
        { narrative: "Day 3: Prioritizing rest. Quality sleep is fundamental to balance.", activity: "Micro-Game: 'Relaxation' puzzle.", nextStepText: "Play" },
        { narrative: "Day 4: Nourishing your body. Fueling yourself with healthy food supports your mind.", activity: "Journal: Plan one healthy meal for tomorrow.", nextStepText: "Reflect" },
        { narrative: "Day 5: Digital detox. Disconnect to reconnect with yourself.", activity: "Mini-Meditation: 5-minute digital detox meditation.", nextStepText: "Breathe" },
        { narrative: "Day 6: Creative expression. Engage in an activity that brings you joy.", activity: "Micro-Game: 'Creative Spark' drawing prompt.", nextStepText: "Play" },
        { narrative: "Day 7: Sustaining your balance. How will you continue these practices?", activity: "Journal: Create a weekly self-care plan.", nextStepText: "Complete" },
      ]
    },
    {
      id: 'growthExploration',
      icon: SunIcon,
      title: "Growth & Exploration",
      tagline: "Expand your horizons and cultivate a mindset for continuous personal development.",
      progress: 0,
      days: [
        { narrative: "Welcome to Growth & Exploration. Today, let's identify an area you wish to grow in.", activity: "Journal: What new skill or knowledge do you want to acquire?", nextStepText: "Reflect" },
        { narrative: "Day 2: Stepping out of your comfort zone. Small steps lead to big changes.", activity: "Mini-Meditation: 3-minute visualization of success.", nextStepText: "Breathe" },
        { narrative: "Day 3: Learning from challenges. Every obstacle is an opportunity.", activity: "Micro-Game: 'Problem Solver' logic puzzle.", nextStepText: "Play" },
        { narrative: "Day 4: Cultivating curiosity. Ask 'why' and explore new ideas.", activity: "Journal: Research a topic you're curious about.", nextStepText: "Reflect" },
        { narrative: "Day 5: Embracing change. Adaptability is a superpower.", activity: "Mini-Meditation: 4-minute acceptance meditation.", nextStepText: "Breathe" },
        { narrative: "Day 6: Inspiring others. Share your journey and uplift those around you.", activity: "Micro-Game: 'Kindness Challenge' generator.", nextStepText: "Play" },
        { narrative: "Day 7: Your evolving self. Reflect on how far you've come and where you're headed.", activity: "Journal: Write a letter to your future self.", nextStepText: "Complete" },
      ]
    },
  ];

  // Mock daily wellness score (0-100)
  useEffect(() => {
    if (demoMode) {
      if (demoWellnessScore === 'low') setWellnessScore(20);
      else if (demoWellnessScore === 'medium') setWellnessScore(60);
      else if (demoWellnessScore === 'high') setWellnessScore(90);
      else setWellnessScore(null);
    } else {
      // Simulate fetching a real wellness score
      setWellnessScore(Math.floor(Math.random() * 100)); 
    }
  }, [demoMode, demoWellnessScore]);

  useEffect(() => {
    if (wellnessScore !== null) {
      if (wellnessScore < 40) {
        setRecommendedStorylineId('resilienceBoost');
      } else if (wellnessScore >= 40 && wellnessScore < 75) {
        setRecommendedStorylineId('balanceSelfCare');
      } else {
        setRecommendedStorylineId('growthExploration');
      }
    } else {
      setRecommendedStorylineId(null);
    }
  }, [wellnessScore]);

  const handleStartContinueStoryline = (storylineId: string) => {
    const selectedStory = storylines.find(s => s.id === storylineId);
    if (selectedStory) {
      setCurrentStoryline(selectedStory);
      setCurrentDay(1); // Always start from day 1 for now
      setIsFlowModalOpen(true);
    }
  };

  const handleNextStep = () => {
    if (currentStoryline && currentDay < currentStoryline.days.length) {
      setCurrentDay(prev => prev + 1);
    } else {
      setIsFlowModalOpen(false);
      setCurrentStoryline(null);
      setCurrentDay(1);
      // In a real app, update storyline progress here
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-12 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Guided Self-Therapy Storylines</h2>
        {process.env.NODE_ENV === 'development' && (
          <div className="flex items-center space-x-2">
            <span className="text-sm">Demo Wellness:</span>
            <select
              value={demoWellnessScore}
              onChange={(e) => setDemoWellnessScore(e.target.value as 'none' | 'low' | 'medium' | 'high')}
              className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 p-2 rounded-lg shadow-md"
            >
              <option value="none">Auto (Random)</option>
              <option value="low">Low Score (0-39)</option>
              <option value="medium">Medium Score (40-74)</option>
              <option value="high">High Score (75-100)</option>
            </select>
          </div>
        )}
      </div>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        Transform your therapy into an immersive journey. Explore narrative-driven paths that evolve with your wellness.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storylines.map((story) => (
          <StorylineCard
            key={story.id}
            icon={story.icon}
            title={story.title}
            tagline={story.tagline}
            progress={story.progress}
            onStartContinue={() => handleStartContinueStoryline(story.id)}
            isRecommended={story.id === recommendedStorylineId}
          />
        ))}
      </div>

      {currentStoryline && (
        <StorylineFlowModal
          isOpen={isFlowModalOpen}
          onClose={() => setIsFlowModalOpen(false)}
          storyline={currentStoryline}
          currentDay={currentDay}
          onNextStep={handleNextStep}
        />
      )}
    </motion.div>
  );
};
