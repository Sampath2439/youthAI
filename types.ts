
export type Page = 'landing' | 'dashboard' | 'predictor' | 'aiTherapist' | 'meditation' | 'music' | 'settings' | 'diet' | 'imageStudio' | 'journal' | 'help' | 'calmArcade';

export type Theme = 'light' | 'dark';

export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface FormData {
  gender: string;
  age: string;
  city: string;
  profession: string;
  cgpa: string;
  degree: string;
  academicSatisfaction: string;
  sleepDuration: string;
  dietaryHabits: string;
  suicidalThoughts: string;
  workStudyBalance: string;
  financialStatus: string;
  familyHistory: string;
  screenTime: string;
  physicalActivity: string;
  selfTime: string;
  socialLife: string;
}

export interface PredictionResultData {
    status: string;
    reasoning: string;
    wellnessScore: number;
    yogaSuggestion: {
      name: string;
      description: string;
    };
    musicSuggestion: {
      genre: string;
      description: string;
    };
}

export interface ChatMessage {
  id?: string; // Firestore document ID
  role: 'user' | 'model';
  text: string;
  userId: string;
  createdAt: any; // Firestore server timestamp
}

export interface BreathingExercise {
  name:string;
  description: string;
  pattern: {
    inhale: number;
    hold: number;
    exhale: number;
  };
}

export interface MusicGenerationResult {
  title: string;
  description: string;
  category: 'Calm Piano' | 'Ambient Space' | 'Nature Sounds' | 'Lofi Beats';
}

export interface DailyGoal {
  id?: string; // Firestore document ID
  text: string;
  completed: boolean;
  userId: string;
  createdAt: any; // Firestore server timestamp
}

export interface Notification {
  id: number;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
}

// New types for Diet & Food Tracking feature
export interface DietSettings {
  mealsPerDay: number;
}

export interface FoodAnalysisResult {
    mealName: string;
    calories: number;
    classification: 'Healthy' | 'Moderate' | 'Unhealthy';
    score: number;
    reasoning: string;
    mentalWellnessInsight: string;
}

export interface Meal extends FoodAnalysisResult {
    id?: string;
    photo: string; // base64 string
    userId: string;
    createdAt: any; // Firestore server timestamp
}

// New types for Emotional State History
export type TimePeriod = 'week' | 'month' | 'year';
export type WellnessMetricType = 'emotion' | 'diet' | 'meditation' | 'coach';

export interface WellnessDataPoint {
    value: number;
    type: WellnessMetricType;
}

export interface EmotionalSnapshot {
    id?: string; // Firestore document ID
    date: string; // YYYY-MM-DD
    dataPoints: WellnessDataPoint[];
    userId: string;
}

// New type for Daily Summary
export interface DailySummary {
    totalScore: number;
    change: number | null; // Percentage change from yesterday
    emotionScore: number | null;
    dietScore: number | null;
}

// New type for Journal feature
export interface JournalEntry {
  id?: string; // Firestore document ID
  date: string; // ISO string
  prompt: string;
  content: string;
  reflection?: string;
  userId: string;
  createdAt: any; // Firestore server timestamp
}

export interface MeditationSession {
    id?: string; // Firestore document ID
    userId: string;
    exerciseName: string;
    rating: number; // 1-5
    createdAt: any; // Firestore server timestamp
}

// New types for Gamification
export type BadgeId = 'streak_3' | 'streak_7' | 'first_meditation' | 'first_journal' | 'first_diet' | 'mindful_pro';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: 'FireIcon' | 'StarIcon' | 'YogaIcon' | 'BookOpenIcon' | 'AppleIcon' | 'BrainCircuitIcon';
  unlocked: boolean;
}

export interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  lastActivityDate: string | null; // YYYY-MM-DD
  badges: Record<BadgeId, boolean>;
  userId: string;
}

// New types for Game Settings
export type BubbleSound = 'pop' | 'water' | 'click';
export type BubbleTheme = 'classic' | 'balloons' | 'lanterns';
export type ColorPalette = 'pastel' | 'oceanic' | 'sunset';
export type AnimationSpeed = 'slow' | 'medium' | 'fast';

export interface GameSettings {
  bubbleSound: BubbleSound;
  bubbleTheme: BubbleTheme;
  colorPalette: ColorPalette;
  animationSpeed: AnimationSpeed;
}