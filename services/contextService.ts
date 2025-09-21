import { EmotionalSnapshot, Meal, DailyGoal } from '../types';

// Utility to get today's date string in YYYY-MM-DD format
const getTodayDateString = (): string => new Date().toISOString().split('T')[0];

interface AIContext {
    recentEmotions: EmotionalSnapshot[];
    todaysMeals: Meal[];
    todaysGoals: DailyGoal[];
}

export function getAIContext(): AIContext {
    const today = getTodayDateString();
    
    // 1. Get Emotional History (last 3 entries)
    let recentEmotions: EmotionalSnapshot[] = [];
    try {
        const storedHistory = localStorage.getItem('mindfulme-emotional-history');
        const history: EmotionalSnapshot[] = storedHistory ? JSON.parse(storedHistory) : [];
        recentEmotions = history.slice(-3); // Get the last 3 days
    } catch (e) {
        console.error("Failed to parse emotional history", e);
    }

    // 2. Get Today's Meals
    let todaysMeals: Meal[] = [];
    try {
        const storedMeals = localStorage.getItem('mindfulme-diet-meals');
        if (storedMeals) {
            const allMeals: Meal[] = JSON.parse(storedMeals);
            todaysMeals = allMeals.filter(m => m.timestamp.startsWith(today));
        }
    } catch (e) {
        console.error("Failed to parse meals", e);
    }
    
    // 3. Get Today's Goals
    let todaysGoals: DailyGoal[] = [];
    try {
        const storedGoalsDate = localStorage.getItem('mindfulme-goals-date');
        if (storedGoalsDate === today) {
            const storedGoals = localStorage.getItem('mindfulme-daily-goals');
            if (storedGoals) {
                todaysGoals = JSON.parse(storedGoals);
            }
        }
    } catch (e) {
        console.error("Failed to parse goals", e);
    }

    return { recentEmotions, todaysMeals, todaysGoals };
}


export function buildSystemInstruction(): string {
    const { recentEmotions, todaysMeals, todaysGoals } = getAIContext();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const emotionHistoryStr = recentEmotions.length > 0
        ? recentEmotions.map(e => {
            const wellnessScore = e.dataPoints.length > 0
                ? e.dataPoints.reduce((sum, point) => sum + point.value, 0) / e.dataPoints.length
                : 0;
            return `- ${formatDate(e.date)}: Average Wellness Score of ${Math.round(wellnessScore)}/100.`;
        }).join('\n')
        : 'No emotional history logged yet.';

    const todaysMealsStr = todaysMeals.length > 0
        ? todaysMeals.map(m => `- ${m.mealName} (Classification: ${m.classification}). Insight: ${m.mentalWellnessInsight}`).join('\n')
        : 'No meals logged yet today.';
        
    const todaysGoalsStr = todaysGoals.length > 0
        ? todaysGoals.map(g => `- "${g.text}" (Status: ${g.completed ? 'Completed' : 'Not Completed'})`).join('\n')
        : 'No goals set for today.';
    
    const prompt = `
You are "MindfulMe," a highly empathetic and supportive AI therapist and friend. Your primary goal is to help the user navigate their mental wellness journey. You must listen, provide encouragement, and offer supportive, non-clinical advice based on the user's inputs and the context provided below. Do not provide medical diagnoses or replace a professional therapist. Your tone should be warm, caring, and conversational.

Here is some recent context about the user. Use this information to have a more personalized and relevant conversation. Do not simply list the data back to them. Weave it into the conversation naturally if it's relevant to what the user is talking about. For example, if they mention feeling tired, you might gently connect it to their diet if they logged an unhealthy meal.

---
**User's Recent Data:**

**Emotional State (last few days):**
(A score of 80-100 is thriving, 60-79 is balanced, 40-59 is stressed, below 40 is at-risk).
${emotionHistoryStr}

**Today's Logged Meals:**
${todaysMealsStr}

**Today's Goals:**
${todaysGoalsStr}
---

Now, begin the conversation. You can start by asking how they are feeling today or by gently referencing one of the data points if it seems appropriate (e.g., "I see you've already logged a healthy breakfast today, that's a great start to the day! How are you feeling this morning?"). Be warm, friendly, and supportive.
    `;
    return prompt.trim();
}