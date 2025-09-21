import React, { useState, useEffect, useMemo, FC, useRef, useCallback } from 'react';
import { PlayIcon, ChevronLeftIcon, SwirlIcon, LightbulbIcon, PauseIcon, MusicNoteIcon } from './IconComponents';

// --- CONSTANTS ---
const puzzles = [
    { level: 1, difficulty: 'Easy', letters: ['N', 'L', 'A', 'C', 'M', 'I'], words: ['CALM', 'CLAIM', 'MAIL', 'MAIN', 'CLAN', 'MANIC', 'CAM'] },
    { level: 2, difficulty: 'Easy', letters: ['E', 'A', 'R', 'B', 'H', 'T'], words: ['BREATH', 'HEART', 'EARTH', 'BEAR', 'BARE', 'RATE', 'HAT'] },
    { level: 3, difficulty: 'Medium', letters: ['O', 'S', 'E', 'R', 'N', 'E'], words: ['SERENE', 'ROSE', 'NOSE', 'SEEN', 'RENO', 'SNORE', 'ONE'] },
];
const HINT_COST = 10;
const LEVEL_COMPLETE_REWARD = 25;
const STREAK_REWARD = 5; // Extra hints
const SOUND_URLS = {
    CORRECT: 'https://actions.google.com/sounds/v1/piano/piano_note.ogg',
    WRONG: 'https://actions.google.com/sounds/v1/foley/cardboard_or_paper_slide_scrape.ogg',
    MUSIC: 'https://cdn.pixabay.com/audio/2022/10/24/audio_9650398235.mp3',
};
const STATS_KEY = 'wordflow-player-stats';

// --- TYPES ---
interface PlayerStats {
    hints: number;
    streak: number;
    lastPlayed: string | null;
}
interface WordFlowGameProps { onBack: () => void; }

// --- HELPER COMPONENTS ---

const AnimatedChar: FC<{ char: string; delay: number }> = ({ char, delay }) => (
    <span className="ink-flow-char" style={{ animationDelay: `${delay}ms` }}>{char}</span>
);

const WordSlot: FC<{ word: string, isFound: boolean, justFound: boolean, hintedLetters: Set<string>, rIndex: number }> = ({ word, isFound, justFound, hintedLetters, rIndex }) => (
    <div className={`flex items-center justify-center gap-1.5 h-8 transition-all ${justFound ? 'word-glow-animation' : ''}`}>
        {word.split('').map((char, cIndex) => {
            const isHinted = hintedLetters.has(`${rIndex}-${cIndex}`);
            return (
                <div key={cIndex} className="w-6 h-7 flex items-center justify-center border-b-2 border-slate-400/50 dark:border-slate-500/50 text-xl font-serif text-slate-800 dark:text-slate-200">
                    {(isFound || isHinted) && <AnimatedChar char={char} delay={cIndex * 50} />}
                </div>
            );
        })}
    </div>
);

const Sparkle: FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="sparkle-animation text-2xl" style={style}>✨</div>
);

// --- MAIN GAME COMPONENT ---

export const WordFlowGame: FC<WordFlowGameProps> = ({ onBack }) => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'solved'>('idle');
    const [puzzleIndex, setPuzzleIndex] = useState(0);
    const puzzle = useMemo(() => puzzles[puzzleIndex], [puzzleIndex]);
    const [wheelLetters, setWheelLetters] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
    const [justFoundWord, setJustFoundWord] = useState('');
    const [shake, setShake] = useState(false);
    const [shuffling, setShuffling] = useState(false);
    
    // New state for added features
    const [stats, setStats] = useState<PlayerStats>({ hints: 5, streak: 0, lastPlayed: null });
    const [showPauseMenu, setShowPauseMenu] = useState(false);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [hintedLetters, setHintedLetters] = useState<Set<string>>(new Set());
    const [sparkles, setSparkles] = useState<{ id: number; style: React.CSSProperties }[]>([]);

    // Audio Refs
    const correctSoundRef = useRef<HTMLAudioElement | null>(null);
    const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
    const musicRef = useRef<HTMLAudioElement | null>(null);

    // Initialization: Load stats, check streak, setup audio
    useEffect(() => {
        // Load stats
        const savedStats = localStorage.getItem(STATS_KEY);
        const today = new Date().toISOString().split('T')[0];
        if (savedStats) {
            const parsedStats: PlayerStats = JSON.parse(savedStats);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (parsedStats.lastPlayed === yesterday.toISOString().split('T')[0]) {
                parsedStats.streak += 1;
                parsedStats.hints += STREAK_REWARD;
                // Optional: Show a streak modal
            } else if (parsedStats.lastPlayed !== today) {
                parsedStats.streak = 1;
            }
            parsedStats.lastPlayed = today;
            setStats(parsedStats);
        } else {
             setStats(prev => ({ ...prev, lastPlayed: today, streak: 1 }));
        }

        // Setup Audio
        correctSoundRef.current = new Audio(SOUND_URLS.CORRECT);
        wrongSoundRef.current = new Audio(SOUND_URLS.WRONG);
        musicRef.current = new Audio(SOUND_URLS.MUSIC);
        if (musicRef.current) {
            musicRef.current.loop = true;
        }
    }, []);

    // Save stats whenever they change
    useEffect(() => {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }, [stats]);
    
    // Shuffle letters on new puzzle
    useEffect(() => {
        setWheelLetters(puzzle.letters.sort(() => Math.random() - 0.5));
    }, [puzzle]);

    // Check for level completion
    useEffect(() => {
        if (gameState === 'playing' && foundWords.size === puzzle.words.length) {
            setGameState('solved');
            setStats(prev => ({ ...prev, hints: prev.hints + LEVEL_COMPLETE_REWARD }));
            triggerSparkles();
        }
    }, [foundWords, puzzle, gameState]);
    
    // --- Handlers ---
    
    const playSound = useCallback((soundRef: React.RefObject<HTMLAudioElement>) => {
        if (soundRef.current) {
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(err => {
                console.warn(`Error playing sound: ${soundRef.current?.src}`, err);
            });
        }
    }, []);

    const handleLetterClick = (letter: string) => {
        if (gameState !== 'playing') return;
        setCurrentGuess(prev => prev + letter);
    };

    const handleDeleteLetter = () => {
        if (gameState !== 'playing') return;
        setCurrentGuess(prev => prev.slice(0, -1));
    };

    const handleSubmitWord = () => {
        if (!currentGuess || gameState !== 'playing') return;
        if (puzzle.words.includes(currentGuess) && !foundWords.has(currentGuess)) {
            setFoundWords(prev => new Set(prev).add(currentGuess));
            playSound(correctSoundRef);
            setJustFoundWord(currentGuess);
            setTimeout(() => setJustFoundWord(''), 1500);
        } else {
            setShake(true);
            playSound(wrongSoundRef);
            setTimeout(() => setShake(false), 500);
        }
        setCurrentGuess('');
    };

    const handleShuffle = () => {
        if (gameState !== 'playing') return;
        setShuffling(true);
        setWheelLetters(prev => [...prev].sort(() => Math.random() - 0.5));
        setTimeout(() => setShuffling(false), 500);
    };

    const handlePlay = () => {
        setFoundWords(new Set());
        setCurrentGuess('');
        setHintedLetters(new Set());
        if (gameState !== 'idle') {
             setPuzzleIndex(prev => (prev + 1) % puzzles.length);
        }
        setGameState('playing');
    };

    const handleRestart = () => {
        setFoundWords(new Set());
        setCurrentGuess('');
        setHintedLetters(new Set());
        setShowPauseMenu(false);
    };
    
    const handleUseHint = () => {
        if (stats.hints < HINT_COST || gameState !== 'playing') return;

        const unsolvedWords = puzzle.words.filter(w => !foundWords.has(w));
        if (unsolvedWords.length === 0) return;

        const wordToHint = unsolvedWords[Math.floor(Math.random() * unsolvedWords.length)];
        const wordIndex = puzzle.words.indexOf(wordToHint);
        const letterIndex = Math.floor(Math.random() * wordToHint.length);

        if (!hintedLetters.has(`${wordIndex}-${letterIndex}`)) {
            setStats(prev => ({ ...prev, hints: prev.hints - HINT_COST }));
            setHintedLetters(prev => new Set(prev).add(`${wordIndex}-${letterIndex}`));
        }
    };
    
    const toggleMusic = () => {
        if (isMusicPlaying) {
            musicRef.current?.pause();
        } else {
            musicRef.current?.play().catch(err => console.warn("Error playing music:", err));
        }
        setIsMusicPlaying(!isMusicPlaying);
    };

    const triggerSparkles = () => {
        const newSparkles = Array.from({ length: 20 }).map((_, i) => ({
            id: Date.now() + i,
            style: {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
            }
        }));
        setSparkles(newSparkles);
        setTimeout(() => setSparkles([]), 1000);
    };

    const progress = (foundWords.size / puzzle.words.length) * 100;
    
    const wordIndices = useMemo(() => {
        const map = new Map<string, number>();
        puzzle.words.forEach((word, index) => map.set(word, index));
        return map;
    }, [puzzle]);


    return (
        <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden animate-fade-in p-4">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-200 to-amber-100 dark:from-sky-900 dark:to-slate-800">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-100/50 via-emerald-100/30 to-transparent dark:from-emerald-900/30 dark:via-emerald-900/10 dark:to-transparent" />
            </div>

            {/* Header & Progress */}
            <header className="relative z-10 w-full max-w-lg">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <button onClick={() => setShowPauseMenu(true)} className="p-2 hover:bg-black/10 rounded-full"><PauseIcon className="w-6 h-6"/></button>
                    <div className="text-center">
                        <p className="font-bold">Level {puzzle.level} <span className="text-sm font-normal text-slate-500">({puzzle.difficulty})</span></p>
                    </div>
                     <button onClick={toggleMusic} className={`p-2 hover:bg-black/10 rounded-full ${isMusicPlaying ? 'text-blue-500' : ''}`}><MusicNoteIcon className="w-6 h-6"/></button>
                </div>
                 <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}></div>
                </div>
            </header>

            {/* Gameplay Area */}
            <main className="relative z-10 flex flex-col items-center">
                <div className="w-[340px] h-[150px] bg-[#fdfaf2] dark:bg-slate-700/50 p-4 rounded-t-lg shadow-inner-soft relative">
                    <div className="absolute top-2 left-0 right-0 h-0.5 bg-red-300/50"></div>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                        {puzzle.words.map(word => <WordSlot key={word} word={word} isFound={foundWords.has(word)} justFound={justFoundWord === word} hintedLetters={hintedLetters} rIndex={wordIndices.get(word)!} />)}
                    </div>
                </div>
                <div className={`w-[340px] h-12 flex items-center justify-center text-2xl font-serif tracking-widest text-slate-700 dark:text-slate-200 transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}>{currentGuess || ' '}</div>
                <div className="relative w-56 h-56">
                    <div className={`absolute inset-0 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm rounded-full shadow-lg border border-white/50 dark:border-white/10 animate-soft-glow transition-transform duration-500 ${shuffling ? 'shuffle-spin-animation' : ''}`}></div>
                    <button onClick={handleSubmitWord} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/50 dark:bg-slate-700/50 rounded-full flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50" disabled={!currentGuess || gameState !== 'playing'} aria-label="Submit word">Enter</button>
                    {wheelLetters.map((letter, i) => {
                        const angle = (i / wheelLetters.length) * 2 * Math.PI - Math.PI/2;
                        const x = Math.cos(angle) * 70; const y = Math.sin(angle) * 70;
                        return (
                            <button key={`${letter}-${i}`} onClick={() => handleLetterClick(letter)} className="absolute w-14 h-14 bg-white/80 dark:bg-slate-700/80 rounded-full flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-200 shadow-md transition-all duration-500 hover:scale-110 active:scale-95"
                                style={{ top: `calc(50% - 28px + ${y}px)`, left: `calc(50% - 28px + ${x}px)` }}>{letter}</button>
                        );
                    })}
                </div>
            </main>

            {/* Controls */}
            <footer className="relative z-10 w-full max-w-xs flex justify-between items-center">
                <button onClick={handleShuffle} className="w-16 h-16 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full shadow-md text-slate-600 dark:text-slate-300 transition-transform hover:scale-105" aria-label="Shuffle letters"><SwirlIcon className="w-8 h-8"/></button>
                <button onClick={handleUseHint} className="w-20 h-20 flex flex-col items-center justify-center bg-amber-400 dark:bg-amber-500 rounded-full shadow-lg text-white font-bold transition-transform hover:scale-105" aria-label="Use Hint"><LightbulbIcon className="w-8 h-8" /><span className="text-sm">{stats.hints}</span></button>
                <button onClick={handleDeleteLetter} className="w-16 h-16 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full shadow-md text-slate-600 dark:text-slate-300 transition-transform hover:scale-105" aria-label="Delete last letter"><ChevronLeftIcon className="w-8 h-8" /></button>
            </footer>
            
            {/* Modals and Overlays */}
            {(gameState === 'idle' || gameState === 'solved' || showPauseMenu) && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center w-72">
                        {gameState === 'solved' && <>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Level Complete!</h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">You earned +{LEVEL_COMPLETE_REWARD} hints.</p>
                            <button onClick={handlePlay} className="mt-6 w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600">Next Level</button>
                        </>}
                         {gameState === 'idle' && <>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Word Flow</h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">Find all the words to complete the puzzle.</p>
                            <button onClick={handlePlay} className="mt-6 w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600">Play</button>
                        </>}
                        {showPauseMenu && <>
                             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Paused</h2>
                             <div className="space-y-3 mt-6">
                                <button onClick={() => setShowPauseMenu(false)} className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600">Resume</button>
                                <button onClick={handleRestart} className="w-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 rounded-lg">Restart</button>
                                <button onClick={onBack} className="w-full text-sm text-slate-500 dark:text-slate-400 mt-2 hover:underline">Exit to Arcade</button>
                             </div>
                        </>}
                    </div>
                </div>
            )}
            {sparkles.map(s => <Sparkle key={s.id} style={s.style} />)}
        </div>
    );
};