import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon } from './IconComponents';
import { getGameSettings } from '../services/settingsService';
import { GameSettings, ColorPalette, AnimationSpeed } from '../types';

const PALETTES: Record<ColorPalette, { light: string[]; dark: string[] }> = {
    pastel: {
        light: [
            'from-cyan-300 to-blue-400',
            'from-pink-300 via-rose-300 to-orange-300',
            'from-teal-300 via-cyan-300 to-sky-400',
            'from-lime-300 via-emerald-300 to-green-400',
            'from-amber-300 via-yellow-300 to-orange-400',
            'from-fuchsia-300 via-pink-400 to-rose-400'
        ],
        dark: [
            'dark:from-cyan-800 dark:to-blue-900',
            'dark:from-pink-800 dark:via-rose-900 dark:to-orange-900',
            'dark:from-teal-800 dark:via-cyan-900 dark:to-sky-900',
            'dark:from-lime-800 dark:via-emerald-900 dark:to-green-900',
            'dark:from-amber-800 dark:via-yellow-900 dark:to-orange-900',
            'dark:from-fuchsia-800 dark:via-pink-900 dark:to-rose-900'
        ]
    },
    oceanic: {
        light: [
            'from-sky-400 to-blue-600', 'from-teal-300 to-cyan-500', 'from-blue-300 to-indigo-400',
            'from-cyan-200 to-sky-400', 'from-teal-400 to-blue-500', 'from-sky-300 to-indigo-500'
        ],
        dark: [
            'dark:from-sky-900 dark:to-blue-950', 'dark:from-teal-900 dark:to-cyan-950', 'dark:from-blue-900 dark:to-indigo-950',
            'dark:from-cyan-900 dark:to-sky-950', 'dark:from-teal-900 dark:to-blue-950', 'dark:from-sky-900 dark:to-indigo-950'
        ]
    },
    sunset: {
        light: [
            'from-amber-400 to-orange-600', 'from-red-400 to-rose-600', 'from-yellow-300 to-red-500',
            'from-pink-400 to-fuchsia-600', 'from-orange-400 to-red-600', 'from-rose-400 to-purple-600'
        ],
        dark: [
            'dark:from-amber-900 dark:to-orange-950', 'dark:from-red-900 dark:to-rose-950', 'dark:from-yellow-900 dark:to-red-950',
            'dark:from-pink-900 dark:to-fuchsia-950', 'dark:from-orange-900 dark:to-red-950', 'dark:from-rose-900 dark:to-purple-950'
        ]
    }
};

const SPEEDS: Record<AnimationSpeed, number> = {
    slow: 1000,
    medium: 600,
    fast: 300,
};

interface Ripple {
    id: number;
    x: number;
    y: number;
}

export const ColorSplashGame: React.FC = () => {
    const [points, setPoints] = useState(2);
    const [isPaused, setIsPaused] = useState(false);
    const [currentColorIndex, setCurrentColorIndex] = useState(0);
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const [settings, setSettings] = useState<GameSettings>(getGameSettings());
    const canvasRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleSettingsUpdate = () => setSettings(getGameSettings());
        window.addEventListener('gameSettingsUpdated', handleSettingsUpdate);
        return () => window.removeEventListener('gameSettingsUpdated', handleSettingsUpdate);
    }, []);

    const activePalette = PALETTES[settings.colorPalette];
    const rippleDuration = SPEEDS[settings.animationSpeed];

    const handleSplash = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isPaused || !canvasRef.current) return;

        setPoints(p => Math.min(p + 1, 100));
        setCurrentColorIndex(i => (i + 1) % activePalette.light.length);
        
        const canvas = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - canvas.left;
        const y = e.clientY - canvas.top;

        const newRipple: Ripple = { id: Date.now(), x, y };
        setRipples(prev => [...prev, newRipple]);

        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, rippleDuration);
    };

    return (
        <div className="relative w-full h-full flex flex-col color-splash-bg overflow-hidden animate-fade-in">
             {/* Background Shapes */}
            <div className="absolute top-[10%] left-[-15%] w-72 h-48 bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl -rotate-12 opacity-80"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-64 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl rotate-12 opacity-80"></div>
            <div className="absolute bottom-[5%] left-[5%] w-48 h-32 bg-pink-200/10 dark:bg-pink-800/10 rounded-full blur-2xl opacity-50"></div>
            
            <main className="flex-grow flex flex-col items-center justify-center p-4 z-10">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Color Splash</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Tap the colorful circle to create soothing color splashes. Watch your Calm Points grow as you relax. You can pause the game at any time. Customize colors and animation speed in the game settings.</p>
                <button
                    ref={canvasRef}
                    onClick={handleSplash}
                    className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-2xl transition-all duration-500 ease-in-out overflow-hidden bg-gradient-to-br ${activePalette.light[currentColorIndex]} ${activePalette.dark[currentColorIndex]}`}
                    aria-label="Color splash canvas"
                    disabled={isPaused}
                    style={{boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)'}}
                >
                    {ripples.map(ripple => (
                        <span 
                            key={ripple.id} 
                            className="ripple-effect"
                            style={{ top: ripple.y, left: ripple.x, animationDuration: `${rippleDuration}ms` }}
                        />
                    ))}
                </button>

                {/* Color Palette section */}
                <div className="flex justify-center gap-3 my-8">
                    <div className="w-10 h-10 rounded-lg bg-blue-200/80 dark:bg-blue-800/50 border border-white/50"></div>
                    <div className="w-10 h-10 rounded-lg bg-pink-200/80 dark:bg-pink-800/50 border border-white/50"></div>
                    <div className="w-10 h-10 rounded-lg bg-slate-300/80 dark:bg-slate-600/50 border border-white/50"></div>
                    <div className="w-10 h-10 rounded-lg bg-purple-200/80 dark:bg-purple-800/50 border border-white/50"></div>
                    <div className="w-10 h-10 rounded-lg bg-teal-200/80 dark:bg-teal-800/50 border border-white/50"></div>
                    <div className="w-10 h-10 rounded-lg bg-amber-200/80 dark:bg-amber-800/50 border border-white/50"></div>
                </div>

                {/* Controls Card */}
                <div className="w-full max-w-sm bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Calm Points</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{points} / 100</span>
                    </div>
                    <div className="w-full bg-slate-200/70 dark:bg-slate-700 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${points}%`, transition: 'width 0.5s ease-in-out' }}></div>
                    </div>
                    <div className="flex justify-center mt-4">
                        <button 
                            onClick={() => setIsPaused(p => !p)}
                            className="w-16 h-16 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200"
                            aria-label={isPaused ? "Play" : "Pause"}
                        >
                            {isPaused ? <PlayIcon className="w-8 h-8" /> : <PauseIcon className="w-8 h-8" />}
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
};