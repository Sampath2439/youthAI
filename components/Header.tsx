import React, { useState, useEffect, useRef } from 'react';
import { HeartPulseIcon, UserCircleIcon, LogOutIcon } from './IconComponents';
import { Page, Theme, User } from '../types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const jwtDecode = (token: string): any => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error('Error decoding JWT', e);
        return null;
    }
};

const GoogleSignInButton: React.FC<{ onLoginSuccess: (user: User) => void }> = ({ onLoginSuccess }) => {
  const buttonDiv = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const checkGoogle = () => {
      // FIX: Cast window to any to access the 'google' property injected by the Google Identity Services script.
      if ((window as any).google) {
        setScriptLoaded(true);
        if (buttonDiv.current) {
          // FIX: Cast window to any to access the 'google' property.
          (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
            callback: (response: any) => {
              const userData = jwtDecode(response.credential);
              if (userData) {
                onLoginSuccess({
                  name: userData.name,
                  email: userData.email,
                  picture: userData.picture,
                });
              }
            },
          });
          // FIX: Cast window to any to access the 'google' property.
          (window as any).google.accounts.id.renderButton(
            buttonDiv.current,
            { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with' }
          );
        }
      } else {
        setTimeout(checkGoogle, 100); // Check again shortly
      }
    };
    checkGoogle();
  }, [onLoginSuccess, scriptLoaded]);

  return <div ref={buttonDiv}></div>;
};

const UserMenu: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)}>
                <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-1 border border-slate-200 dark:border-slate-700">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button onClick={onLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <LogOutIcon className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

const NavLink: React.FC<{
  page: Page;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}> = ({ page, currentPage, onNavigate, children }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => onNavigate(page)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'text-slate-900 dark:text-slate-50'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
    >
      {children}
    </button>
  );
};

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, user, onLoginSuccess, onLogout, theme, toggleTheme }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate('landing')} className="flex items-center space-x-2">
              <HeartPulseIcon className="h-7 w-7 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Mindfulme
              </h1>
            </button>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink page="landing" currentPage={currentPage} onNavigate={onNavigate}>Home</NavLink>
            {user && (
              <>
                <NavLink page="dashboard" currentPage={currentPage} onNavigate={onNavigate}>Dashboard</NavLink>
                <NavLink page="predictor" currentPage={currentPage} onNavigate={onNavigate}>Predictor</NavLink>
                <NavLink page="aiTherapist" currentPage={currentPage} onNavigate={onNavigate}>Coach</NavLink>
                <NavLink page="meditation" currentPage={currentPage} onNavigate={onNavigate}>Meditation</NavLink>
                <NavLink page="music" currentPage={currentPage} onNavigate={onNavigate}>Music</NavLink>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
                aria-label="Toggle theme"
            >
                <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>
            {user ? (
              <UserMenu user={user} onLogout={onLogout} />
            ) : (
               <div className="hidden md:block">
                 <GoogleSignInButton onLoginSuccess={onLoginSuccess} />
               </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;