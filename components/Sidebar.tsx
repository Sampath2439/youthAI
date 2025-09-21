import React, { useState } from 'react';
import { Page } from '../types';
import { 
  LayoutGridIcon, TargetIcon, BookOpenIcon, 
  CircleHelpIcon, FlagIcon, MusicNoteIcon, HeartPulseIcon, ChevronLeftIcon,
  LogOutIcon, SettingsIcon, AppleIcon, ImageIcon, PenSquareIcon, MessageSquareIcon, ZenArcadeIcon, MoreHorizontalIcon, XMarkIcon, CompassIcon
} from './IconComponents';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const mainNavItems = [
    { icon: LayoutGridIcon, page: 'dashboard' as const, label: 'Dashboard' },
    { icon: TargetIcon, page: 'predictor' as const, label: 'Predictor' },
    { icon: MusicNoteIcon, page: 'music' as const, label: 'Music' },
    { icon: MessageSquareIcon, page: 'aiTherapist' as const, label: 'AI Therapist' },
    { icon: BookOpenIcon, page: 'meditation' as const, label: 'Meditation' },
    { icon: PenSquareIcon, page: 'journal' as const, label: 'Journal' },
    { icon: ImageIcon, page: 'imageStudio' as const, label: 'Image Studio' },
    { icon: AppleIcon, page: 'diet' as const, label: 'Diet Tracker' },
    { icon: ZenArcadeIcon, page: 'calmArcade' as const, label: 'Calm Arcade' },
    { icon: CompassIcon, page: 'explore' as const, label: 'Explore' },
];

const moreNavItems = [
    
    { icon: SettingsIcon, page: 'settings' as const, label: 'Settings' }
];

const footerNavItems = [
    { icon: CircleHelpIcon, page: 'help' as const, label: 'Help' },
    { icon: FlagIcon, page: 'reports' as const, label: 'Reports' }, // Assuming 'reports' is a future page
]

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isExpanded, onToggle }) => {
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const allNavItems = [...mainNavItems, ...moreNavItems];

  return (
    <>
    {/* Desktop Sidebar */}
    <aside className={`hidden lg:flex flex-col flex-shrink-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}>
      {/* Logo */}
      <div className="h-20 flex items-center px-4">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center space-x-2 text-slate-800 dark:text-slate-100">
            <HeartPulseIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <h1 className={`text-xl font-bold tracking-tight whitespace-nowrap transition-all duration-200 ${isExpanded ? 'opacity-100 ml-2' : 'opacity-0 w-0'}`}>
                Mindfulme
            </h1>
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-grow px-3 space-y-2">
        {allNavItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`flex items-center w-full p-3 rounded-xl font-semibold text-sm transition-colors duration-200 ${
                currentPage === item.page 
                ? 'bg-blue-500 text-white' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-slate-700'
            } ${isExpanded ? '' : 'justify-center'}`}
            aria-label={item.label}
          >
            <item.icon className="w-6 h-6 flex-shrink-0" />
            <span className={`whitespace-nowrap ml-4 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer Nav */}
      <div className="px-3 pb-4 space-y-2">
         {footerNavItems.map((item) => (
            <button
                key={item.label}
                onClick={() => item.page === 'help' && onNavigate('help')}
                className={`flex items-center w-full p-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                    currentPage === item.page
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-slate-700'
                } ${isExpanded ? '' : 'justify-center'}`}
                aria-label={item.label}
            >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <span className={`whitespace-nowrap ml-4 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    {item.label}
                </span>
            </button>
         ))}
         <button
            onClick={onToggle}
            className={`flex items-center w-full p-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-slate-700 ${isExpanded ? '' : 'justify-center'}`}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
         >
            <ChevronLeftIcon className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`} />
            <span className={`whitespace-nowrap ml-4 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                Collapse
            </span>
         </button>
      </div>
    </aside>

    {/* Mobile Bottom Nav */}
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 flex justify-around items-center h-20 z-50">
        {mainNavItems.map(item => (
            <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
                    currentPage === item.page ? 'text-blue-500' : 'text-slate-600 dark:text-slate-400'
                }`}
            >
                <item.icon className="w-7 h-7" />
                <span className="text-xs font-medium mt-1">{item.label}</span>
            </button>
        ))}
        <button 
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${isMoreMenuOpen ? 'text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}>
            <MoreHorizontalIcon className="w-7 h-7" />
            <span className="text-xs font-medium mt-1">More</span>
        </button>
    </nav>

    {/* More Menu Modal */}
    {isMoreMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-[60]" onClick={() => setIsMoreMenuOpen(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-t-2xl shadow-xl w-full max-w-lg p-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">More Options</h3>
                    <button onClick={() => setIsMoreMenuOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-2xl font-bold">&times;</button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[...moreNavItems, ...footerNavItems].map(item => (
                        <button
                            key={item.page}
                            onClick={() => { onNavigate(item.page as Page); setIsMoreMenuOpen(false); }}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors duration-200 ${
                                currentPage === item.page ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            <item.icon className="w-7 h-7 mb-2" />
                            <span className="text-xs font-semibold text-center">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default Sidebar;