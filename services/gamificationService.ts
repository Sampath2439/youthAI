import { GamificationData, Badge, BadgeId } from '../types';

const GAMIFICATION_KEY = 'mindfulme-gamification-data';

const getTodayDateString = (): string => new Date().toISOString().split('T')[0];

const ALL_BADGES: Omit<Badge, 'unlocked'>[] = [
    { id: 'streak_3', name: '3-Day Streak', description: 'Used the app for 3 days in a row.', icon: 'FireIcon' },
    { id: 'streak_7', name: '7-Day Streak', description: 'Used the app for 7 days in a row.', icon: 'FireIcon' },
    { id: 'first_meditation', name: 'Mindful Start', description: 'Completed your first breathing exercise.', icon: 'YogaIcon' },
    { id: 'first_journal', name: 'Inner Explorer', description: 'Wrote your first journal entry.', icon: 'BookOpenIcon' },
    { id: 'first_diet', name: 'Food for Thought', description: 'Logged your first meal.', icon: 'AppleIcon' },
    { id: 'mindful_pro', name: 'Mindful Pro', description: 'Reached the highest wellness level.', icon: 'BrainCircuitIcon' },
];

export const getGamificationData = (): GamificationData => {
    try {
        const storedData = localStorage.getItem(GAMIFICATION_KEY);
        if (storedData) {
            const data: GamificationData = JSON.parse(storedData);
            // Check streak
            const today = new Date();
            const lastDate = data.lastActivityDate ? new Date(data.lastActivityDate) : null;
            if (lastDate) {
                const diffTime = today.getTime() - lastDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 1) {
                    data.streak = 0; // Reset streak if more than 1 day has passed
                }
            }
            return data;
        }
    } catch (e) {
        console.error("Failed to parse gamification data", e);
    }
    
    // Default data for new users
    return {
        xp: 0,
        level: 1,
        streak: 0,
        lastActivityDate: null,
        badges: {
            streak_3: false,
            streak_7: false,
            first_meditation: false,
            first_journal: false,
            first_diet: false,
            mindful_pro: false,
        },
    };
};

const saveGamificationData = (data: GamificationData) => {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
};

export const addXP = (amount: number, badgeToCheck?: BadgeId) => {
    const data = getGamificationData();
    
    // Update XP and Level
    data.xp += amount;
    const levelThresholds = [100, 300]; // XP for level 2, level 3
    if (data.level === 1 && data.xp >= levelThresholds[0]) data.level = 2;
    if (data.level === 2 && data.xp >= levelThresholds[1]) {
        data.level = 3;
        data.badges.mindful_pro = true;
    }

    // Update Streak
    const todayStr = getTodayDateString();
    if (data.lastActivityDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (data.lastActivityDate === yesterdayStr) {
            data.streak += 1; // It's a consecutive day
        } else {
            data.streak = 1; // It's a new day, but not consecutive
        }
        data.lastActivityDate = todayStr;
    }

    // Check for specific badge unlock
    if (badgeToCheck && !data.badges[badgeToCheck]) {
        data.badges[badgeToCheck] = true;
    }

    // Check streak badges
    if (data.streak >= 3) data.badges.streak_3 = true;
    if (data.streak >= 7) data.badges.streak_7 = true;

    saveGamificationData(data);
};

export const getBadges = (): Badge[] => {
    const data = getGamificationData();
    return ALL_BADGES.map(badge => ({
        ...badge,
        unlocked: data.badges[badge.id] || false,
    }));
};
