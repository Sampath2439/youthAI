import React, { useState, useEffect, useRef } from 'react';
import { Page, Theme, Notification } from '../types';
import { BellIcon, SettingsIcon, ChevronLeftIcon } from './IconComponents';
import { BackButton } from './BackButton';

interface AppHeaderProps {
  currentPage: Page;
  theme: Theme;
  toggleTheme: () => void;
  onNavigate: (page: Page) => void;
  isGameMode?: boolean;
  subtitle?: React.ReactNode | null;
  onGameBack?: (() => void) | null;
}

const pageTitles: Record<Page, string> = {
    landing: 'Home',
    dashboard: 'Dashboard',
    predictor: 'Wellness Predictor',
    aiTherapist: 'AI Therapist',
    meditation: 'Guided Breathing',
    music: 'AI Music Scapes',
    settings: 'Settings',
    diet: 'Diet & Food Tracker',
    imageStudio: 'AI Image Studio',
    journal: 'Guided Journal',
    help: 'Urgent Support',
    calmArcade: 'Calm Arcade',
};

const timeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}y ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}mo ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m ago`;
    return "Just now";
};

const AppHeader: React.FC<AppHeaderProps> = ({ currentPage, theme, toggleTheme, onNavigate, isGameMode, subtitle, onGameBack }) => {
    const title = isGameMode ? 'Calm Arcade' : pageTitles[currentPage] || 'Welcome back';

    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        const storedValue = localStorage.getItem('mindfulme-notifications-enabled');
        try {
          return storedValue ? JSON.parse(storedValue) : true;
        } catch {
            return true;
        }
    });
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hasUnread = notifications.some(n => !n.read);

    const initializeNotifications = () => {
        const mockNotifications: Notification[] = [
            { id: 1, message: "Welcome to Mindfulme! Let's start your wellness journey.", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false },
            { id: 2, message: "Your daily goals are waiting for you on the dashboard.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: false },
            { id: 3, message: "New breathing exercise 'Box Breathing' is available.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
        ];
        setNotifications(mockNotifications);
        localStorage.setItem('mindfulme-notifications', JSON.stringify(mockNotifications));
    };

    useEffect(() => {
        const storedNotifications = localStorage.getItem('mindfulme-notifications');
        if (storedNotifications) {
            try {
                setNotifications(JSON.parse(storedNotifications));
            } catch (error) {
                console.error("Failed to parse notifications from localStorage", error);
                initializeNotifications(); // Reset to default if parsing fails
            }
        } else {
            initializeNotifications();
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('mindfulme-notifications-enabled', JSON.stringify(notificationsEnabled));
    }, [notificationsEnabled]);

    const toggleNotifications = () => {
        setNotificationsEnabled(prev => !prev);
    };

    const handleBellClick = () => {
        setIsNotificationDropdownOpen(prev => {
            const willBeOpen = !prev;
            if (willBeOpen && hasUnread) {
                const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
                setNotifications(updatedNotifications);
                localStorage.setItem('mindfulme-notifications', JSON.stringify(updatedNotifications));
            }
            return willBeOpen;
        });
    };

    // Effect to handle clicks outside of the dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotificationDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className={`flex justify-between items-center flex-shrink-0 ${isGameMode ? 'p-4' : 'mb-6'}`}>
            <div className="flex items-center gap-4">
                {currentPage !== 'dashboard' && currentPage !== 'landing' && (
                    <BackButton onBack={() => onNavigate('dashboard')} />
                )}
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
                    {isGameMode && subtitle && <div>{subtitle}</div>}
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 text-slate-600 dark:text-slate-300"
                    aria-label="Toggle theme"
                >
                    <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
                </button>
                
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={handleBellClick}
                        className="relative p-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 text-slate-600 dark:text-slate-300"
                        aria-label="Open notification settings"
                    >
                        <BellIcon className="w-5 h-5"/>
                        {hasUnread && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white/80 dark:ring-slate-800/80"></div>}
                    </button>
                    {isNotificationDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                               {notifications.length > 0 ? (
                                   notifications.map(n => (
                                       <div key={n.id} className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/50">
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{n.message}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{timeAgo(n.timestamp)}</p>
                                       </div>
                                   ))
                               ) : (
                                   <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No new notifications.</p>
                               )}
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Enable Notifications</span>
                                    <button
                                        onClick={toggleNotifications}
                                        className={`${
                                            notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-800`}
                                        role="switch"
                                        aria-checked={notificationsEnabled}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`${
                                                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => onNavigate('settings')}
                    className="p-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 text-slate-600 dark:text-slate-300"
                    aria-label="Open settings"
                >
                    <SettingsIcon className="w-5 h-5"/>
                </button>
                {isGameMode && onGameBack && (
                     <button 
                        onClick={onGameBack}
                        className="flex items-center gap-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-full font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-900/70"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                        Back
                    </button>
                )}
            </div>
        </header>
    );
};

export default AppHeader;
