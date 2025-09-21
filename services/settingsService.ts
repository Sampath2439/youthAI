import { GameSettings } from '../types';

const GAME_SETTINGS_KEY = 'mindfulme-game-settings';

const DEFAULT_SETTINGS: GameSettings = {
    bubbleSound: 'pop',
    bubbleTheme: 'classic',
    colorPalette: 'pastel',
    animationSpeed: 'medium',
};

export const getGameSettings = (): GameSettings => {
    try {
        const storedSettings = localStorage.getItem(GAME_SETTINGS_KEY);
        if (storedSettings) {
            // Merge defaults with stored settings to handle cases where new settings are added
            return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
        }
    } catch (e) {
        console.error("Failed to parse game settings", e);
    }
    return DEFAULT_SETTINGS;
};

export const saveGameSettings = (settings: GameSettings) => {
    localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('gameSettingsUpdated'));
};
