import { GamificationData, Badge, BadgeId } from '../types';
import { auth, db } from './firebaseService';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const getTodayDateString = (): string => new Date().toISOString().split('T')[0];

const ALL_BADGES: Omit<Badge, 'unlocked'>[] = [
    { id: 'streak_3', name: '3-Day Streak', description: 'Used the app for 3 days in a row.', icon: 'FireIcon' },
    { id: 'streak_7', name: '7-Day Streak', description: 'Used the app for 7 days in a row.', icon: 'FireIcon' },
    { id: 'first_meditation', name: 'Mindful Start', description: 'Completed your first breathing exercise.', icon: 'YogaIcon' },
    { id: 'first_journal', name: 'Inner Explorer', description: 'Wrote your first journal entry.', icon: 'BookOpenIcon' },
    { id: 'first_diet', name: 'Food for Thought', description: 'Logged your first meal.', icon: 'AppleIcon' },
    { id: 'mindful_pro', name: 'Mindful Pro', description: 'Reached the highest wellness level.', icon: 'BrainCircuitIcon' },
];

const defaultGamificationData = (userId: string): GamificationData => ({
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
    userId,
});

export const getGamificationData = async (): Promise<GamificationData> => {
    if (!auth.currentUser) return defaultGamificationData("guest"); // Return default data for guest user

    const userDocRef = doc(db, 'gamification', auth.currentUser.uid);

    try {
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as GamificationData;
            // Check streak
            const today = new Date();
            const lastDate = data.lastActivityDate ? new Date(data.lastActivityDate) : null;
            if (lastDate) {
                const diffTime = today.getTime() - lastDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 1) {
                    data.streak = 0; // Reset streak
                }
            }
            return data;
        } else {
            // No data found, so create default data
            const defaultData = defaultGamificationData(auth.currentUser.uid);
            await setDoc(userDocRef, defaultData);
            return defaultData;
        }
    } catch (e) {
        console.error("Failed to get gamification data", e);
        return defaultGamificationData(auth.currentUser.uid);
    }
};

const saveGamificationData = async (data: GamificationData) => {
    if (!auth.currentUser) return; // Do not save if no user is logged in
    const userDocRef = doc(db, 'gamification', auth.currentUser.uid);
    await setDoc(userDocRef, data);
};

export const addXP = async (amount: number, badgeToCheck?: BadgeId) => {
    const data = await getGamificationData();
    
    data.xp += amount;
    const levelThresholds = [100, 300];
    if (data.level === 1 && data.xp >= levelThresholds[0]) data.level = 2;
    if (data.level === 2 && data.xp >= levelThresholds[1]) {
        data.level = 3;
        data.badges.mindful_pro = true;
    }

    const todayStr = getTodayDateString();
    if (data.lastActivityDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (data.lastActivityDate === yesterdayStr) {
            data.streak += 1;
        } else {
            data.streak = 1;
        }
        data.lastActivityDate = todayStr;
    }

    if (badgeToCheck && !data.badges[badgeToCheck]) {
        data.badges[badgeToCheck] = true;
    }

    if (data.streak >= 3) data.badges.streak_3 = true;
    if (data.streak >= 7) data.badges.streak_7 = true;

    await saveGamificationData(data);
};

export const getBadges = async (): Promise<Badge[]> => {
    const data = await getGamificationData();
    return ALL_BADGES.map(badge => ({
        ...badge,
        unlocked: data.badges[badge.id] || false,
    }));
};
