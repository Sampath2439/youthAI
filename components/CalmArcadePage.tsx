import React, { useState, useEffect } from 'react';
import { ZenArcadeIcon, BubbleIcon, PaletteIcon, PuzzlePieceIcon, BlocksIcon, SlidersHorizontalIcon, QuillIcon } from './IconComponents';
import { BubbleWrapGame } from './BubbleWrapGame';
import { ColorSplashGame } from './ColorSplashGame';
import { PeacePuzzlerGame } from './PeacePuzzlerGame';
import { ClassicBlocksGame } from './ClassicBlocksGame';
import { GameSettingsModal } from './GameSettingsModal';
import { WordFlowGame } from './WordFlowGame';


interface CalmArcadePageProps {
    onSetGameMode: (isGame: boolean) => void;
    onSetGameSubtitle: (subtitle: React.ReactNode | null) => void;
    onSetGameBackAction: (action: (() => void) | null) => void;
}

export const CalmArcadePage: React.FC<CalmArcadePageProps> = ({ onSetGameMode, onSetGameSubtitle, onSetGameBackAction }) => {
    const [showGame, setShowGame] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const isGameActive = !!showGame;
        onSetGameMode(isGameActive);

        const handleBack = () => () => setShowGame(null);

        if (showGame === 'bubbleWrap') {
            onSetGameSubtitle(<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1"><BubbleIcon className="w-4 h-4" /> Pop & Chill</div>);
            onSetGameBackAction(handleBack);
        } else if (showGame === 'colorSplash') {
            onSetGameSubtitle(<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1"><PaletteIcon className="w-4 h-4" /> Color Splash</div>);
            onSetGameBackAction(handleBack);
        } else if (showGame === 'peacePuzzler') {
            onSetGameSubtitle(<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1"><PuzzlePieceIcon className="w-4 h-4" /> Peace Puzzler</div>);
            onSetGameBackAction(handleBack);
        } else if (showGame === 'classicBlocks') {
            onSetGameSubtitle(<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1"><BlocksIcon className="w-4 h-4" /> Classic Blocks</div>);
            onSetGameBackAction(handleBack);
        } else if (showGame === 'wordFlow') {
            onSetGameSubtitle(<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1"><QuillIcon className="w-4 h-4" /> Word Flow</div>);
            onSetGameBackAction(handleBack);
        } else {
            onSetGameSubtitle(null);
            onSetGameBackAction(null);
        }
        
        // Cleanup on component unmount
        return () => {
            onSetGameMode(false);
            onSetGameSubtitle(null);
            onSetGameBackAction(null);
        };

    }, [showGame, onSetGameMode, onSetGameSubtitle, onSetGameBackAction]);


    if (showGame === 'bubbleWrap') {
        return <BubbleWrapGame />;
    }

    if (showGame === 'colorSplash') {
        return <ColorSplashGame />;
    }

    if (showGame === 'peacePuzzler') {
        return <PeacePuzzlerGame onBack={() => setShowGame(null)} />;
    }

    if (showGame === 'classicBlocks') {
        return <ClassicBlocksGame />;
    }

    if (showGame === 'wordFlow') {
        return <WordFlowGame onBack={() => setShowGame(null)} />;
    }


    return (
        <>
        {isSettingsOpen && <GameSettingsModal onClose={() => setIsSettingsOpen(false)} />}
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <ZenArcadeIcon className="h-20 w-20 text-teal-400 dark:text-teal-300 mx-auto" />
            <h2 className="text-4xl font-bold mt-4 bg-gradient-to-r from-purple-400 to-cyan-400 dark:from-purple-300 dark:to-cyan-300 text-transparent bg-clip-text">
                Calm Arcade
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
                Take a break with these simple, satisfying games designed to help you relax.
            </p>
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="my-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
                <SlidersHorizontalIcon className="w-4 h-4" />
                Customize Your Games
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Game Card: Bubble Wrap */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/30 text-center flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-300 group">
                    <div className="relative w-full h-24 mb-4">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-200/50 dark:bg-blue-900/40 rounded-full blur-lg"></div>
                        <BubbleIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-blue-500 dark:text-blue-400 transition-transform group-hover:scale-110" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pop & Chill</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
                        Relieve stress by popping endless virtual bubbles.
                    </p>
                    <button 
                        onClick={() => setShowGame('bubbleWrap')}
                        className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 animate-pulse-glow"
                    >
                        Play Now
                    </button>
                </div>

                {/* Game Card: Color Splash */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/30 text-center flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-300 group">
                    <div className="relative w-full h-24 mb-4">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-pink-200/50 dark:bg-pink-900/40 rounded-full blur-lg"></div>
                        <PaletteIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-pink-500 dark:text-pink-400 transition-transform group-hover:scale-110" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Color Splash</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
                        Create soothing gradients with a simple tap.
                    </p>
                    <button 
                        onClick={() => setShowGame('colorSplash')}
                        className="bg-pink-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-pink-600 transition-all duration-300 animate-pulse-glow"
                        style={{animationDelay: '0.2s'}}
                    >
                        Play Now
                    </button>
                </div>
                
                 {/* Game Card: Word Flow */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/30 text-center flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-300 group">
                    <div className="relative w-full h-24 mb-4">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-amber-200/50 dark:bg-amber-900/40 rounded-full blur-lg"></div>
                        <QuillIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-amber-500 dark:text-amber-400 transition-transform group-hover:scale-110" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Word Flow</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
                       Find words in a tranquil, journal-themed puzzle.
                    </p>
                    <button 
                        onClick={() => setShowGame('wordFlow')}
                        className="bg-amber-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-amber-600 transition-all duration-300 animate-pulse-glow"
                        style={{animationDelay: '0.4s'}}
                    >
                        Play Now
                    </button>
                </div>


                 {/* New Game Card: Peace Puzzler */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/30 text-center flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-300 group">
                    <div className="relative w-full h-24 mb-4">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-teal-200/50 dark:bg-teal-900/40 rounded-full blur-lg"></div>
                        <PuzzlePieceIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-teal-500 dark:text-teal-400 transition-transform group-hover:scale-110" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Peace Puzzler</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
                       Arrange tiles to solve a calming, beautiful puzzle.
                    </p>
                    <button 
                        onClick={() => setShowGame('peacePuzzler')}
                        className="bg-teal-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-teal-600 transition-all duration-300 animate-pulse-glow"
                        style={{animationDelay: '0.4s'}}
                    >
                        Play Now
                    </button>
                </div>

                {/* Game Card: Classic Blocks */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/30 text-center flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-300 group">
                    <div className="relative w-full h-24 mb-4">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-indigo-200/50 dark:bg-indigo-900/40 rounded-full blur-lg"></div>
                        <BlocksIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-indigo-500 dark:text-indigo-400 transition-transform group-hover:scale-110" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Classic Blocks</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
                       A calming, meditative take on a timeless puzzle.
                    </p>
                    <button 
                        onClick={() => setShowGame('classicBlocks')}
                        className="bg-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-600 transition-all duration-300 animate-pulse-glow"
                        style={{animationDelay: '0.6s'}}
                    >
                        Play Now
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};