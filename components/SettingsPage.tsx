import React, { useState, useEffect, FC, ReactNode } from 'react';
import { 
    UserCircleIcon, ShieldCheckIcon, BellIcon, HeartPulseIcon, 
    AccessibilityIcon, CircleHelpIcon, InfoIcon, ChevronDownIcon, LogOutIcon 
} from './IconComponents';

const PrivacyPolicyModal: FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full m-4 border border-slate-200 dark:border-slate-700"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Privacy Policy</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-2xl font-bold">&times;</button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-sm text-slate-600 dark:text-slate-400">
                   <h4 className="font-bold text-base text-slate-700 dark:text-slate-200">1. Data Collection</h4>
                   <ul className="list-disc pl-5 space-y-1">
                       <li>Minimal personal data (name, age, preferences).</li>
                       <li>Wellness & health-related logs stored securely.</li>
                   </ul>
                   <h4 className="font-bold text-base text-slate-700 dark:text-slate-200">2. Data Usage</h4>
                   <ul className="list-disc pl-5 space-y-1">
                       <li>Used only for personalization and progress tracking.</li>
                       <li>Never sold or shared with third parties.</li>
                   </ul>
                   <h4 className="font-bold text-base text-slate-700 dark:text-slate-200">3. Data Storage & Security</h4>
                   <ul className="list-disc pl-5 space-y-1">
                       <li>Encrypted and securely stored.</li>
                       <li>User can download/delete anytime from "Privacy & Security".</li>
                   </ul>
                   <h4 className="font-bold text-base text-slate-700 dark:text-slate-200">4. Third-Party Integrations</h4>
                   <ul className="list-disc pl-5 space-y-1">
                       <li>Access to wearables (Fitbit, Apple Health, Google Fit) only with explicit consent.</li>
                   </ul>
                   <h4 className="font-bold text-base text-slate-700 dark:text-slate-200">5. Notifications</h4>
                   <ul className="list-disc pl-5 space-y-1">
                       <li>Users control all notification types.</li>
                       <li>Motivational reminders are optional.</li>
                   </ul>
                   <h4 className="font-bold text-base text-slate-700 dark:text-slate-200">6. Children’s Privacy</h4>
                   <ul className="list-disc pl-5 space-y-1">
                       <li>Not for users under 13.</li>
                       <li>Minors require guardian supervision.</li>
                   </ul>
                   <h4 className="font-bold text-base text-slate-700 dark:text-slate-200">7. Policy Updates</h4>
                   <ul className="list-disc pl-5 space-y-1">
                       <li>Updates will be shown in-app before changes are applied.</li>
                   </ul>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end rounded-b-2xl">
                    <button onClick={onClose} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

const SettingsLink: FC<{ children: ReactNode; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void; }> = ({ children, onClick }) => (
    <a href="#" onClick={onClick} className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm py-2 px-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
        {children}
    </a>
);

interface AccordionItemProps {
    title: string;
    icon: FC<{ className?: string }>;
    isOpen: boolean;
    onClick: () => void;
    children: ReactNode;
}

const AccordionItem: FC<AccordionItemProps> = ({ title, icon: Icon, isOpen, onClick, children }) => {
    return (
        <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center p-5 text-left font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                aria-expanded={isOpen}
            >
                <div className="flex items-center">
                    <Icon className="w-6 h-6 mr-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-base">{title}</span>
                </div>
                <ChevronDownIcon
                    className={`w-5 h-5 text-slate-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] visible' : 'max-h-0 invisible'}`}
            >
                <div className="p-5 pt-0 text-slate-600 dark:text-slate-400">
                    {children}
                </div>
            </div>
        </div>
    );
};

const EditProfileForm: FC = () => {
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const storedProfile = localStorage.getItem('mindfulme-user-profile');
        if (storedProfile) {
            setProfile(JSON.parse(storedProfile));
        } else {
            // A fallback if nothing is stored, e.g. from a fresh login
            setProfile({ name: 'Alex Doe', email: 'alex.doe@example.com' });
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        setSaved(false); // Reset saved status on change
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('mindfulme-user-profile', JSON.stringify(profile));
        setSaved(true);
        // Hide saved message after 3 seconds
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block mb-2 font-semibold text-sm text-slate-600 dark:text-slate-400">
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                    required
                />
            </div>
            <div>
                <label htmlFor="email" className="block mb-2 font-semibold text-sm text-slate-600 dark:text-slate-400">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                    required
                />
            </div>
            <div className="flex items-center justify-end space-x-4">
                {saved && <span className="text-sm text-green-600 dark:text-green-400 transition-opacity duration-300">Saved!</span>}
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors">
                    Save Changes
                </button>
            </div>
        </form>
    );
};

interface SettingsPageProps {
    onLogout: () => void;
}

export const SettingsPage: FC<SettingsPageProps> = ({ onLogout }) => {
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [openItem, setOpenItem] = useState<string | null>('account');

    const handleToggle = (id: string) => {
        setOpenItem(prev => (prev === id ? null : id));
    };

    return (
        <>
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-8">Settings</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <AccordionItem
                            title="Account"
                            icon={UserCircleIcon}
                            isOpen={openItem === 'account'}
                            onClick={() => handleToggle('account')}
                        >
                            <div className="space-y-2">
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors font-semibold"
                                >
                                    <LogOutIcon className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </AccordionItem>
                        <AccordionItem
                            title="Profile & Personalization"
                            icon={UserCircleIcon}
                            isOpen={openItem === 'profile'}
                            onClick={() => handleToggle('profile')}
                        >
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Edit Profile</h4>
                                <EditProfileForm />
                                <hr className="border-slate-200 dark:border-slate-600" />
                                <SettingsLink>Wellness Goals Setup</SettingsLink>
                                <SettingsLink>Daily Reminders</SettingsLink>
                                <SettingsLink>Theme & Appearance</SettingsLink>
                            </div>
                        </AccordionItem>
                        <AccordionItem
                            title="Privacy & Security"
                            icon={ShieldCheckIcon}
                            isOpen={openItem === 'privacy'}
                            onClick={() => handleToggle('privacy')}
                        >
                            <div className="space-y-2">
                                <SettingsLink>Data Privacy Controls</SettingsLink>
                                <SettingsLink>Download My Data</SettingsLink>
                                <SettingsLink>Clear History / Reset Progress</SettingsLink>
                                <SettingsLink>App Lock</SettingsLink>
                            </div>
                        </AccordionItem>
                        <AccordionItem
                            title="Notifications"
                            icon={BellIcon}
                            isOpen={openItem === 'notifications'}
                            onClick={() => handleToggle('notifications')}
                        >
                            <div className="space-y-2">
                                <SettingsLink>Therapy / Session Reminders</SettingsLink>
                                <SettingsLink>Progress Updates</SettingsLink>
                                <SettingsLink>Motivational Nudges</SettingsLink>
                                <SettingsLink>Toggle Push / Email / In-App notifications</SettingsLink>
                            </div>
                        </AccordionItem>
                        <AccordionItem
                            title="Health & Integrations"
                            icon={HeartPulseIcon}
                            isOpen={openItem === 'integrations'}
                            onClick={() => handleToggle('integrations')}
                        >
                             <div className="space-y-2">
                                <SettingsLink>Connect Wearables (Fitbit, Apple Health, etc.)</SettingsLink>
                                <SettingsLink>Sleep / Activity Data Sync</SettingsLink>
                                <SettingsLink>Third-party Integrations (Calendar sync)</SettingsLink>
                            </div>
                        </AccordionItem>
                        <AccordionItem
                            title="Accessibility"
                            icon={AccessibilityIcon}
                            isOpen={openItem === 'accessibility'}
                            onClick={() => handleToggle('accessibility')}
                        >
                             <div className="space-y-2">
                                <SettingsLink>Text-to-Speech toggle</SettingsLink>
                                <SettingsLink>High Contrast Mode</SettingsLink>
                                <SettingsLink>Adjust Voice Input Sensitivity</SettingsLink>
                                <SettingsLink>Subtitles / Closed Captions</SettingsLink>
                            </div>
                        </AccordionItem>
                        <AccordionItem
                            title="Support & Help"
                            icon={CircleHelpIcon}
                            isOpen={openItem === 'support'}
                            onClick={() => handleToggle('support')}
                        >
                            <div className="space-y-2">
                                <SettingsLink>Help Center / FAQ</SettingsLink>
                                <SettingsLink>Contact Support</SettingsLink>
                                <SettingsLink>Emergency Helplines</SettingsLink>
                                <SettingsLink>Feedback & Suggestions</SettingsLink>
                            </div>
                        </AccordionItem>
                        <AccordionItem
                            title="About"
                            icon={InfoIcon}
                            isOpen={openItem === 'about'}
                            onClick={() => handleToggle('about')}
                        >
                            <div className="space-y-2">
                                <SettingsLink>About MindMate</SettingsLink>
                                <SettingsLink onClick={(e) => { e.preventDefault(); setIsPrivacyModalOpen(true); }}>
                                    Terms & Privacy Policy
                                </SettingsLink>
                                <SettingsLink>Version Info & Updates</SettingsLink>
                            </div>
                        </AccordionItem>
                    </div>
                </div>
            </main>
            {isPrivacyModalOpen && <PrivacyPolicyModal onClose={() => setIsPrivacyModalOpen(false)} />}
        </>
    );
};