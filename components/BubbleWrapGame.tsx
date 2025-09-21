import React, { useState, useEffect, useCallback, useRef, FC } from 'react';
import { GameSettings, BubbleTheme } from '../types';
import { getGameSettings } from '../services/settingsService';

const BUBBLE_COUNT = 48; // e.g., 8 columns * 6 rows

const ThemedBubble: FC<{ theme: BubbleTheme }> = ({ theme }) => {
    switch (theme) {
        case 'balloons':
            return <div className="w-12 h-12 flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform">🎈</div>;
        case 'lanterns':
            return <div className="w-12 h-12 flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform">🎐</div>;
        case 'classic':
        default:
            return (
                <div
                    className="w-12 h-12 rounded-full"
                    style={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
                        boxShadow: 'inset 0 0 10px rgba(255,255,255,0.3), 0 0 5px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                    }}
                >
                    <div className="absolute top-2 left-2 w-3 h-3 bg-white/50 rounded-full blur-sm"></div>
                </div>
            );
    }
};


const Particle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="particle absolute w-1 h-1 bg-cyan-300 rounded-full" style={style}></div>
);

export const BubbleWrapGame: React.FC = () => {
    const [poppedBubbles, setPoppedBubbles] = useState<Set<number>>(new Set());
    const [particles, setParticles] = useState<{ id: number; style: React.CSSProperties }[]>([]);
    const [settings, setSettings] = useState<GameSettings>(getGameSettings());
    const popSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize the audio object when the component mounts.
        const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
        audio.volume = 0.5;
        audio.preload = 'auto'; // Preload the sound for instant playback.
        popSoundRef.current = audio;
    }, []);

    useEffect(() => {
        const handleSettingsUpdate = () => setSettings(getGameSettings());
        window.addEventListener('gameSettingsUpdated', handleSettingsUpdate);
        return () => window.removeEventListener('gameSettingsUpdated', handleSettingsUpdate);
    }, []);


    const handlePop = (id: number) => {
        if (poppedBubbles.has(id)) return;

        setPoppedBubbles(prev => new Set(prev).add(id));
        triggerParticles(id);

        if (navigator.vibrate) navigator.vibrate(20);

        const audio = popSoundRef.current;
        if (audio) {
            try {
                // Reset playback to the start for rapid pops.
                audio.currentTime = 0;
                audio.play().catch(err => console.warn("Error playing pop sound:", err));
            } catch (err) {
                console.warn("Error playing pop sound:", err);
            }
        }
    };

    const triggerParticles = (bubbleId: number) => {
        const bubbleElement = document.getElementById(`bubble-${bubbleId}`);
        if (!bubbleElement) return;

        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * 360;
            const distance = Math.random() * 20 + 10;
            const x = Math.cos(angle * Math.PI / 180) * distance;
            const y = Math.sin(angle * Math.PI / 180) * distance;

            const newParticle = {
                id: Date.now() + i,
                style: { '--transform-end': `translate(${x}px, ${y}px)` } as React.CSSProperties,
            };
            setParticles(prev => [...prev, newParticle]);

            setTimeout(() => {
                setParticles(prev => prev.filter(p => p.id !== newParticle.id));
            }, 500);
        }
    };

    const resetGrid = useCallback(() => {
        setTimeout(() => {
            setPoppedBubbles(new Set());
        }, 500);
    }, []);

    useEffect(() => {
        if (poppedBubbles.size === BUBBLE_COUNT) {
            resetGrid();
        }
    }, [poppedBubbles, resetGrid]);

    return (
        <div className="w-full h-full flex flex-col animate-fade-in">
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="grid grid-cols-8 gap-4">
                    {Array.from({ length: BUBBLE_COUNT }, (_, id) => {
                        const isPopped = poppedBubbles.has(id);
                        return (
                            <div key={id} id={`bubble-${id}`} className="relative group">
                                <button
                                    onClick={() => handlePop(id)}
                                    className={`relative w-12 h-12 flex items-center justify-center transition-all duration-300 ${isPopped ? 'opacity-0 scale-125' : 'opacity-100 scale-100'}`}
                                    aria-label={`Pop item ${id + 1}`}
                                >
                                    <ThemedBubble theme={settings.bubbleTheme} />
                                </button>
                                {isPopped && particles.map(p => <Particle key={p.id} style={p.style} />)}
                            </div>
                        );
                    })}
                </div>

            </main>
            <div className="content-center justify-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Pop & Chill</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Click or tap on the bubbles to pop them. There's no goal, just relax and enjoy the satisfying pops!</p>

            </div>
        </div>

    );
};