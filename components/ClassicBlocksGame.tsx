import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LightbulbIcon, ChevronLeftIcon, ChevronRightIcon, ArrowDownIcon, RotateCwIcon } from './IconComponents';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINOES: Record<string, { shape: (string | number)[][]; color: string }> = {
  '0': { shape: [[0]], color: 'transparent' },
  I: { shape: [[0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0]], color: 'bg-[#A6D8FF]' }, // sky blue
  J: { shape: [[0, 'J', 0], [0, 'J', 0], ['J', 'J', 0]], color: 'bg-[#F9B6C5]' }, // light pink
  L: { shape: [[0, 'L', 0], [0, 'L', 0], [0, 'L', 'L']], color: 'bg-[#FFD2A6]' }, // peach
  O: { shape: [['O', 'O'], ['O', 'O']], color: 'bg-[#FFF6A3]' }, // soft yellow
  S: { shape: [[0, 'S', 'S'], ['S', 'S', 0], [0, 0, 0]], color: 'bg-[#C7F9E7]' }, // mint
  T: { shape: [['T', 'T', 'T'], [0, 'T', 0], [0, 0, 0]], color: 'bg-[#C9A7EB]' }, // lavender
  Z: { shape: [['Z', 'Z', 0], [0, 'Z', 'Z'], [0, 0, 0]], color: 'bg-[#8EE5D1]' }, // teal
};

const createBoard = (): (string | number)[][][] =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill([0, 'clear']));

const useGameInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<(() => void) | null>(null);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    function tick() { if (savedCallback.current) savedCallback.current(); }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const InstructionPanel = () => (
    <div className="bg-slate-900/50 p-4 rounded-lg text-white">
        <h3 className="font-bold text-lg">How to Play</h3>
        <ul className="text-sm space-y-1 mt-2 list-disc list-inside">
            <li><strong>Objective:</strong> Arrange falling blocks to complete horizontal lines.</li>
            <li><strong>How to Play:</strong> Move blocks left or right with arrow keys (or on-screen controls). Rotate blocks to fit better.</li>
            <li><strong>Scoring:</strong> Each completed line dissolves gently, increasing your Calm Score.</li>
            <li><strong>Goal:</strong> Keep playing as long as possible. Relax, enjoy the visuals, and focus on steady stacking.</li>
        </ul>
    </div>
);

export const ClassicBlocksGame: React.FC = () => {
    const [board, setBoard] = useState(createBoard());
    const [player, setPlayer] = useState({ pos: { x: 0, y: 0 }, tetromino: TETROMINOES[0].shape, collided: false });
    const [score, setScore] = useState(0);
    const [rows, setRows] = useState(0);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'over'>('idle');
    const [showHint, setShowHint] = useState(false);

    const randomTetromino = useCallback(() => {
        const tetrominoes = 'IJLOSTZ';
        const randTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
        return TETROMINOES[randTetromino];
    }, []);

    const resetPlayer = useCallback(() => {
        const newTetromino = randomTetromino();
        setPlayer({ pos: { x: BOARD_WIDTH / 2 - 2, y: 0 }, tetromino: newTetromino.shape, collided: false });
    }, [randomTetromino]);
    
    const startGame = () => {
        setBoard(createBoard());
        resetPlayer();
        setScore(0);
        setRows(0);
        setGameState('playing');
    };

    const checkCollision = (playerToCheck: typeof player, boardToCheck: (string | number)[][][]) => {
        for (let y = 0; y < playerToCheck.tetromino.length; y += 1) {
            for (let x = 0; x < playerToCheck.tetromino[y].length; x += 1) {
                if (playerToCheck.tetromino[y][x] !== 0) {
                    if (!boardToCheck[y + playerToCheck.pos.y] || !boardToCheck[y + playerToCheck.pos.y][x + playerToCheck.pos.x] || boardToCheck[y + playerToCheck.pos.y][x + playerToCheck.pos.x][1] !== 'clear') {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const updatePlayerPos = ({ x, y, collided }: { x: number; y: number; collided?: boolean }) => {
        setPlayer(prev => ({ ...prev, pos: { x: (prev.pos.x += x), y: (prev.pos.y += y) }, collided: collided ?? prev.collided }));
    };

    const drop = useCallback(() => {
        if (gameState !== 'playing') return;
        if (checkCollision({ ...player, pos: { x: player.pos.x, y: player.pos.y + 1 } }, board)) {
            if (player.pos.y < 1) { setGameState('over'); return; }
            setPlayer(prev => ({ ...prev, collided: true }));
        } else {
            updatePlayerPos({ x: 0, y: 1, collided: false });
        }
    }, [board, player, gameState]);
    
    useEffect(() => {
        if (player.collided) {
            const newBoard = board.map(row => [...row]);
            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        newBoard[y + player.pos.y][x + player.pos.x] = [value, 'merged'];
                    }
                });
            });
            
            const sweptBoard = newBoard.reduce((ack, row) => {
                if (row.every(cell => cell[1] === 'merged')) {
                    setRows(prev => prev + 1);
                    setScore(prev => prev + 10);
                    ack.unshift(Array(BOARD_WIDTH).fill([0, 'clear']));
                    return ack;
                }
                ack.push(row);
                return ack;
            }, [] as (string | number)[][][]);
            
            setBoard(sweptBoard);
            resetPlayer();
        }
    }, [player.collided, board, resetPlayer]);

    const movePlayer = (dir: number) => {
        if (gameState !== 'playing') return;
        if (!checkCollision({ ...player, pos: { x: player.pos.x + dir, y: player.pos.y } }, board)) {
            updatePlayerPos({ x: dir, y: 0 });
        }
    };
    
    const rotate = (matrix: (string | number)[][]) => {
        const rotated = matrix.map((_, index) => matrix.map(col => col[index]));
        return rotated.map(row => row.reverse());
    };

    const playerRotate = () => {
        if (gameState !== 'playing') return;
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino);
        
        let offset = 1;
        while (checkCollision(clonedPlayer, board)) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > clonedPlayer.tetromino[0].length) return;
        }
        setPlayer(clonedPlayer);
    };

    useGameInterval(() => { if (gameState === 'playing') drop(); }, 1000);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (gameState !== 'playing') return;
        if (e.key === 'ArrowLeft') movePlayer(-1);
        else if (e.key === 'ArrowRight') movePlayer(1);
        else if (e.key === 'ArrowDown') drop();
        else if (e.key === 'ArrowUp') playerRotate();
    }, [gameState, drop]);
    
    const ghostPlayer = useMemo(() => {
        if (!player.tetromino || player.tetromino[0][0] === 0 || gameState !== 'playing') return null;
        const ghost = JSON.parse(JSON.stringify(player));
        while (!checkCollision({ ...ghost, pos: { ...ghost.pos, y: ghost.pos.y + 1 } }, board)) {
            ghost.pos.y += 1;
        }
        return ghost;
    }, [player, board, gameState]);

    const handleHintClick = () => {
        if (gameState !== 'playing') return;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 2000);
    };

    useEffect(() => {
        const keydownHandler = (e: KeyboardEvent) => handleKeyDown(e);
        window.addEventListener('keydown', keydownHandler);
        return () => window.removeEventListener('keydown', keydownHandler);
    }, [handleKeyDown]);

    const renderedBoard = useMemo(() => {
        const newBoard = board.map(row => [...row]);
        if (showHint && ghostPlayer) {
            ghostPlayer.tetromino.forEach((row, y) => {
                row.forEach((value, x) => { if (value !== 0) newBoard[y + ghostPlayer.pos.y][x + ghostPlayer.pos.x] = [value, 'hint']; });
            });
        }
        if (gameState === 'playing') {
            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => { if (value !== 0) newBoard[y + player.pos.y][x + player.pos.x] = [value, 'clear']; });
            });
        }
        return newBoard;
    }, [board, player, ghostPlayer, showHint, gameState]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center classic-blocks-bg p-4 overflow-hidden animate-fade-in" tabIndex={0}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start w-full max-w-6xl mx-auto">
                <div className="md:col-span-2 flex justify-center">
                    <div className="relative">
                        <div className="grid grid-cols-10 gap-px bg-[#5A6A7A]/20 p-1 rounded-lg border-2 border-[#5A6A7A]/20" style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.4)' }}>
                            {renderedBoard.map((row, y) =>
                                row.map((cell, x) => {
                                    const cellValue = cell[0]; const cellType = cell[1]; const colorKey = cellValue as keyof typeof TETROMINOES;
                                    const color = cellValue !== 0 ? TETROMINOES[colorKey].color : 'bg-transparent';
                                    const glow = cellValue !== 0 && cellType !== 'hint' ? 'shadow-[0_0_10px_1px_rgba(255,255,255,0.4)]' : '';
                                    const hintStyle = cellType === 'hint' ? 'opacity-30 border border-white/50' : '';
                                    return <div key={`${y}-${x}`} className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md ${color} ${glow} ${hintStyle} transition-colors duration-100`}></div>;
                                })
                            )}
                        </div>
                        {(gameState === 'over' || gameState === 'idle' || gameState === 'paused') && (
                            <div className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center text-white z-10">
                                {gameState === 'over' && <h2 className="text-3xl font-bold">Game Over</h2>}
                                {gameState === 'idle' && <h2 className="text-3xl font-bold">Classic Blocks</h2>}
                                {gameState === 'paused' && <h2 className="text-3xl font-bold">Paused</h2>}
                                <button onClick={startGame} className="mt-4 bg-gradient-to-br from-[#C9A7EB] to-[#F9B6C5] text-slate-800 font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
                                    {gameState === 'over' ? 'Play Again' : 'Play'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="md:col-span-1 w-full space-y-6">
                     <div className="bg-slate-900/50 p-4 rounded-lg text-white space-y-4">
                        <h3 className="font-bold text-lg text-center">Controls & Status</h3>
                        
                        <div className="flex justify-around text-center">
                            <div>
                                <h3 className="font-semibold text-sm text-slate-300">Calm Score</h3>
                                <p className="text-4xl font-bold">{score}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-slate-300">Lines Cleared</h3>
                                <p className="text-4xl font-bold">{rows}</p>
                            </div>
                        </div>

                        <div className="w-full max-w-[240px] mx-auto">
                            <div className="grid grid-cols-3 grid-rows-3 gap-2">
                                <div className="col-start-2 row-start-1 flex justify-center"><button onClick={playerRotate} className="w-16 h-16 bg-slate-900/80 rounded-full flex items-center justify-center text-white" aria-label="Rotate"><RotateCwIcon className="w-8 h-8" /></button></div>
                                <div className="col-start-1 row-start-2 flex justify-center"><button onClick={() => movePlayer(-1)} className="w-16 h-16 bg-slate-900/80 rounded-full flex items-center justify-center text-white" aria-label="Move Left"><ChevronLeftIcon className="w-10 h-10" /></button></div>
                                <div className="col-start-3 row-start-2 flex justify-center"><button onClick={() => movePlayer(1)} className="w-16 h-16 bg-slate-900/80 rounded-full flex items-center justify-center text-white" aria-label="Move Right"><ChevronRightIcon className="w-10 h-10" /></button></div>
                                <div className="col-start-2 row-start-3 flex justify-center"><button onClick={drop} className="w-16 h-16 bg-slate-900/80 rounded-full flex items-center justify-center text-white" aria-label="Drop"><ArrowDownIcon className="w-8 h-8" /></button></div>
                            </div>
                        </div>
                        
                        <button onClick={handleHintClick} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-4 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"><LightbulbIcon className="w-5 h-5" /> Show Hint</button>
                    </div>

                    <InstructionPanel />
                </div>
            </div>
            {[...Array(30)].map((_, i) => (<div key={i} className="star" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 8}s`, animationDuration: `${Math.random() * 4 + 6}s` }}></div>))}
        </div>
    );
};
