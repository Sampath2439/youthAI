import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LightbulbIcon, PlayIcon, ChevronLeftIcon, PauseIcon, InfoIcon, RotateCwIcon } from './IconComponents';

const GRID_SIZE = 4;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const COLORS = ['#a7f3d0', '#fecdd3', '#e0e7ff', '#f5d0fe', '#bae6fd']; // 5 pastel colors
const MAX_PROGRESS = 100;

type Tile = { id: number; color: string };
type Position = { row: number; col: number };

const createRandomTile = (): Tile => ({
    id: Date.now() + Math.random(),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
});

// Check for matches
const findMatches = (grid: Tile[][]): Position[] => {
    const matches = new Set<string>();

    // Horizontal matches
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE - 2; c++) {
            if (grid[r][c].color !== 'transparent' && grid[r][c].color === grid[r][c + 1].color && grid[r][c].color === grid[r][c + 2].color) {
                const color = grid[r][c].color;
                let matchLength = 3;
                while (c + matchLength < GRID_SIZE && grid[r][c + matchLength].color === color) {
                    matchLength++;
                }
                for (let i = 0; i < matchLength; i++) {
                    matches.add(`${r}-${c + i}`);
                }
                c += matchLength - 1; // Skip checked tiles
            }
        }
    }
    // Vertical matches
    for (let c = 0; c < GRID_SIZE; c++) {
        for (let r = 0; r < GRID_SIZE - 2; r++) {
            if (grid[r][c].color !== 'transparent' && grid[r][c].color === grid[r + 1][c].color && grid[r][c].color === grid[r + 2][c].color) {
                const color = grid[r][c].color;
                let matchLength = 3;
                while (r + matchLength < GRID_SIZE && grid[r + matchLength][c].color === color) {
                    matchLength++;
                }
                for (let i = 0; i < matchLength; i++) {
                    matches.add(`${r + i}-${c}`);
                }
                r += matchLength - 1; // Skip checked tiles
            }
        }
    }
    return Array.from(matches).map(s => {
        const [row, col] = s.split('-').map(Number);
        return { row, col };
    });
};

// Helper to generate a board without initial matches
const generateInitialGrid = (): Tile[][] => {
    const grid: Tile[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        grid[r] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            let newTile: Tile;
            do {
                newTile = createRandomTile();
            } while (
                (c >= 2 && newTile.color === grid[r][c - 1].color && newTile.color === grid[r][c - 2].color) ||
                (r >= 2 && newTile.color === grid[r - 1][c].color && newTile.color === grid[r - 2][c].color)
            );
            grid[r][c] = newTile;
        }
    }
    return grid;
};


const applyGravity = (grid: Tile[][]): Tile[][] => {
    const newGrid = grid.map(row => [...row]);
    for (let c = 0; c < GRID_SIZE; c++) {
        let emptyRow = GRID_SIZE - 1;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
            if (newGrid[r][c].color !== 'transparent') {
                [newGrid[emptyRow][c], newGrid[r][c]] = [newGrid[r][c], newGrid[emptyRow][c]];
                emptyRow--;
            }
        }
    }
    return newGrid;
};

const refillGrid = (grid: Tile[][]): Tile[][] => {
    return grid.map(row => row.map(tile => tile.color === 'transparent' ? createRandomTile() : tile));
};

// Function to find all possible moves
const findPossibleMoves = (grid: Tile[][]): { from: Position; to: Position }[] => {
    const moves: { from: Position; to: Position }[] = [];

    const checkSwap = (r1: number, c1: number, r2: number, c2: number) => {
        const tempGrid = grid.map(row => row.map(tile => ({ ...tile })));
        [tempGrid[r1][c1], tempGrid[r2][c2]] = [tempGrid[r2][c2], tempGrid[r1][c1]];
        return findMatches(tempGrid).length > 0;
    };

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (c < GRID_SIZE - 1) { // Swap right
                if (checkSwap(r, c, r, c + 1)) {
                    moves.push({ from: { row: r, col: c }, to: { row: r, col: c + 1 } });
                }
            }
            if (r < GRID_SIZE - 1) { // Swap down
                if (checkSwap(r, c, r + 1, c)) {
                    moves.push({ from: { row: r, col: c }, to: { row: r + 1, col: c } });
                }
            }
        }
    }
    return moves;
};


interface PeacePuzzlerGameProps {
    onBack: () => void;
}

export const PeacePuzzlerGame: React.FC<PeacePuzzlerGameProps> = ({ onBack }) => {
    const [tiles, setTiles] = useState<Tile[][]>(generateInitialGrid());
    const [selectedTile, setSelectedTile] = useState<Position | null>(null);
    const [progress, setProgress] = useState(0);
    const [isProgressing, setIsProgressing] = useState(false);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'solved'>('idle');
    const [hint, setHint] = useState<{ from: Position; to: Position } | null>(null);
    const [isShuffling, setIsShuffling] = useState(false);

    const reshuffleBoard = useCallback(async () => {
        setIsShuffling(true);
        await new Promise(res => setTimeout(res, 500)); // Show message
        let newGrid;
        do {
            newGrid = generateInitialGrid();
        } while (findPossibleMoves(newGrid).length === 0);
        setTiles(newGrid);
        setIsShuffling(false);
    }, []);

    // Main game logic loop
    const processMatches = useCallback(async (currentGrid: Tile[][]): Promise<Tile[][]> => {
        const matches = findMatches(currentGrid);
        if (matches.length === 0) {
            return currentGrid; // Base case: no more matches
        }

        setProgress(p => Math.min(p + matches.length, MAX_PROGRESS));
        setIsProgressing(true);
        setTimeout(() => setIsProgressing(false), 500);

        const gridWithMatchesRemoved = currentGrid.map(row => row.map(tile => ({ ...tile })));
        matches.forEach(({ row, col }) => {
            gridWithMatchesRemoved[row][col].color = 'transparent';
        });
        setTiles(gridWithMatchesRemoved);

        await new Promise(res => setTimeout(res, 300));

        const gridAfterGravity = applyGravity(gridWithMatchesRemoved);
        const finalGrid = refillGrid(gridAfterGravity);
        setTiles(finalGrid);
        
        return processMatches(finalGrid);
    }, []);
    

    const handleTileClick = async (row: number, col: number) => {
        if (gameState !== 'playing' || !tiles[row]?.[col] || tiles[row][col].color === 'transparent') return;
    
        if (selectedTile) {
            const { row: selRow, col: selCol } = selectedTile;
            const originalGrid = tiles;
            setSelectedTile(null); 
    
            if (Math.abs(selRow - row) + Math.abs(selCol - col) === 1) {
                const newGrid = tiles.map(r => r.map(tile => ({...tile})));
                [newGrid[selRow][selCol], newGrid[row][col]] = [newGrid[row][col], newGrid[selRow][selCol]];
    
                setTiles(newGrid);
                await new Promise(res => setTimeout(res, 200));
    
                if (findMatches(newGrid).length > 0) {
                    const finalGridState = await processMatches(newGrid);
                    if (findPossibleMoves(finalGridState).length === 0) {
                        await new Promise(res => setTimeout(res, 500));
                        await reshuffleBoard();
                    }
                } else {
                    setTiles(originalGrid); // Swap back
                }
            }
        } else {
            setSelectedTile({ row, col });
        }
    };
    
    
    const handlePlayPause = () => {
        if (gameState === 'playing') {
            setGameState('paused');
        } else if (gameState === 'paused' || gameState === 'idle' || gameState === 'solved') {
            if (gameState === 'idle' || gameState === 'solved') {
                setTiles(generateInitialGrid());
                setProgress(0);
            }
            setGameState('playing');
        }
    };
    
    useEffect(() => {
        if (progress >= MAX_PROGRESS && gameState === 'playing') {
            setGameState('solved');
        }
    }, [progress, gameState]);

    const handleHint = () => {
        if (gameState !== 'playing' || hint) return;
        const moves = findPossibleMoves(tiles);
        if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            setHint(randomMove);
            setTimeout(() => setHint(null), 2000);
        } else {
            console.warn("Hint requested, but no moves found. Auto-shuffling.");
            reshuffleBoard();
        }
    };

    const circumference = 2 * Math.PI * 190;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const isGameOver = gameState === 'solved';

    return (
        <div className="relative w-full h-full flex flex-col items-center peace-puzzler-bg overflow-hidden animate-fade-in py-8 px-4">
            {/* Background floating pieces can go here if needed */}
            <main className="relative z-10 flex flex-col items-center">
                
                {/* How to Play Panel */}
                <div className="mb-6 w-full max-w-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl shadow-md flex items-start gap-3">
                    <InfoIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">How to Play</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Swap adjacent tiles to match 3 or more of the same color, either horizontally or vertically. Matched tiles will disappear, and new ones will fall into place. Fill the 'Calm Ring' to 100% to complete the puzzle. Use the 'Hint' button if you get stuck, or the game will reshuffle automatically if no moves are left.
                        </p>
                    </div>
                </div>

                {/* Progress Ring and Puzzle Board Wrapper */}
                <div className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px] flex items-center justify-center">
                    <svg className="absolute w-full h-full" viewBox="0 0 400 400">
                        <circle cx="200" cy="200" r="190" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                        <circle
                            cx="200" cy="200" r="190"
                            stroke="#a7f3d0"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            transform="rotate(-90 200 200)"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className={`transition-all duration-500 ease-out ${isProgressing ? 'tile-shimmer-animation' : ''}`}
                            style={{ filter: `drop-shadow(0 0 5px #a7f3d0)` }}
                        />
                    </svg>
                    
                    <div className="relative grid grid-cols-4 gap-1 p-2 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl shadow-lg"
                         style={{ boxShadow: '0 0 20px 5px rgba(255, 255, 255, 0.2)' }}>
                        {tiles.map((row, r) =>
                            row.map((tile, c) => {
                                const isHinted = hint && ((hint.from.row === r && hint.from.col === c) || (hint.to.row === r && hint.to.col === c));
                                return (
                                <button
                                    key={tile.id}
                                    onClick={() => handleTileClick(r, c)}
                                    className={`w-16 h-16 md:w-20 md:h-20 rounded-lg transition-all duration-300 transform-gpu focus:outline-none 
                                        ${selectedTile?.row === r && selectedTile?.col === c ? 'ring-4 ring-white dark:ring-sky-300 scale-105 shadow-2xl' : ''}
                                        ${isHinted ? 'animate-pulse ring-4 ring-white' : ''}
                                    `}
                                    style={{
                                        backgroundColor: tile.color,
                                        boxShadow: '0 0 5px 0px rgba(0,0,0,0.1)',
                                        opacity: gameState === 'playing' ? 1 : 0.7
                                    }}
                                    aria-label={`Tile at row ${r+1}, column ${c+1}`}
                                />
                            )})
                        )}
                         {isGameOver && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-3xl font-bold z-20">
                                Solved!
                            </div>
                        )}
                        {isShuffling && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white text-xl font-bold text-center z-20">
                                <RotateCwIcon className="w-10 h-10 animate-spin mb-2" />
                                No more moves!
                                <br />
                                Reshuffling...
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-8 z-10 w-full max-w-sm">
                <button 
                    onClick={handleHint}
                    className="flex items-center gap-2 bg-green-100/80 dark:bg-green-900/60 text-green-700 dark:text-green-200 font-semibold px-4 py-3 rounded-full shadow-md hover:scale-105 transition-transform"
                >
                    <LightbulbIcon className="w-5 h-5" /> Hint
                </button>
                <button 
                    onClick={handlePlayPause}
                    className="bg-blue-300/80 dark:bg-blue-800/60 text-blue-800 dark:text-blue-100 font-bold p-5 rounded-full shadow-lg hover:scale-105 transition-transform"
                    aria-label={gameState === 'playing' ? "Pause" : "Play"}
                >
                    {gameState === 'playing' ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                </button>
                <button onClick={onBack} className="flex items-center gap-2 bg-slate-200/80 dark:bg-slate-700/60 text-slate-600 dark:text-slate-200 font-semibold px-4 py-3 rounded-full shadow-md hover:scale-105 transition-transform">
                    <ChevronLeftIcon className="w-5 h-5" /> Back
                </button>
            </div>
        </div>
    );
};
