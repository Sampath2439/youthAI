import React, { useState, useEffect, useRef } from 'react';
import { GameSettings } from '../types';
import { getGameSettings, saveGameSettings } from '../services/settingsService';
import { SlidersHorizontalIcon } from './IconComponents';

interface GameSettingsModalProps {
    onClose: () => void;
}

interface RadioGroupProps<T extends string> {
    label: string;
    name: string;
    options: T[];
    value: T;
    onChange: (value: T) => void;
}

const RadioGroup = <T extends string>({ label, name, options, value, onChange }: RadioGroupProps<T>) => (
    <div>
        <label className="block mb-2 font-semibold text-sm text-slate-600 dark:text-slate-400">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`flex-auto text-center text-sm capitalize px-3 py-2 border rounded-lg transition-all duration-200 ${
                        value === option
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({ onClose }) => {
    const [settings, setSettings] = useState<GameSettings>(getGameSettings());
    const modalRef = useRef<HTMLDivElement>(null);

    const handleSave = () => {
        saveGameSettings(settings);
        onClose();
    };

    const handleSettingChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full m-4 border border-slate-200 dark:border-slate-700 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontalIcon className="w-6 h-6 text-blue-500" />
                        <h3 id="settings-title" className="text-lg font-bold text-slate-800 dark:text-slate-100">Game Settings</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-2xl font-bold" aria-label="Close settings">&times;</button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <RadioGroup
                        label="Bubble Sound"
                        name="bubbleSound"
                        options={['pop', 'water', 'click']}
                        value={settings.bubbleSound}
                        onChange={(value) => handleSettingChange('bubbleSound', value)}
                    />
                     <RadioGroup
                        label="Bubble Theme"
                        name="bubbleTheme"
                        options={['classic', 'balloons', 'lanterns']}
                        value={settings.bubbleTheme}
                        onChange={(value) => handleSettingChange('bubbleTheme', value)}
                    />
                     <RadioGroup
                        label="Color Splash Palette"
                        name="colorPalette"
                        options={['pastel', 'oceanic', 'sunset']}
                        value={settings.colorPalette}
                        onChange={(value) => handleSettingChange('colorPalette', value)}
                    />
                     <RadioGroup
                        label="Animation Speed"
                        name="animationSpeed"
                        options={['slow', 'medium', 'fast']}
                        value={settings.animationSpeed}
                        onChange={(value) => handleSettingChange('animationSpeed', value)}
                    />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center gap-3 rounded-b-2xl">
                    <button onClick={onClose} className="text-sm font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors">Save Settings</button>
                </div>
            </div>
        </div>
    );
};
