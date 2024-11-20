import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { MinesweeperControls } from "./minesweeper/MinesweeperControls";
import { MinesweeperGrid } from "./minesweeper/MinesweeperGrid";

const GRID_SIZES = {
  easy: { size: 8, mines: 10 },
  medium: { size: 12, mines: 20 },
  hard: { size: 16, mines: 40 },
};

type Difficulty = keyof typeof GRID_SIZES;
type CellContent = "mine" | "empty" | number;

export const Minesweeper = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<CellContent[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [flagged, setFlagged] = useState<boolean[][]>([]);
  const [betAmount, setBetAmount] = useState(10);

  const initializeGame = () => {
    if (!user || user.balance < betAmount) {
      toast.error("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    const { size, mines } = GRID_SIZES[difficulty];
    
    const newGrid: CellContent[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill("empty"));
    
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      if (newGrid[y][x] !== "mine") {
        newGrid[y][x] = "mine";
        minesPlaced++;
      }
    }
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (newGrid[y][x] !== "mine") {
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (y + dy >= 0 && y + dy < size && x + dx >= 0 && x + dx < size) {
                if (newGrid[y + dy][x + dx] === "mine") count++;
              }
            }
          }
          newGrid[y][x] = count as CellContent;
        }
      }
    }
    
    setGrid(newGrid);
    setRevealed(Array(size).fill(null).map(() => Array(size).fill(false)));
    setFlagged(Array(size).fill(null).map(() => Array(size).fill(false)));
    setIsPlaying(true);
  };

  const handleCellClick = (y: number, x: number) => {
    if (!isPlaying || revealed[y][x] || flagged[y][x]) return;

    const newRevealed = revealed.map(row => [...row]);
    
    if (grid[y][x] === "mine") {
      setIsPlaying(false);
      updateUserStats("minesweeper", false, betAmount);
      playLoseSound();
      toast.error("Boom! Game Over!");
      grid.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell === "mine") newRevealed[i][j] = true;
        });
      });
    } else {
      revealCell(y, x, newRevealed);
      
      const unrevealed = newRevealed.flat().filter(cell => !cell).length;
      if (unrevealed === GRID_SIZES[difficulty].mines) {
        setIsPlaying(false);
        const winnings = betAmount * 2;
        updateBalance(winnings);
        updateUserStats("minesweeper", true, winnings - betAmount);
        playWinSound();
        toast.success(`You won $${winnings}!`);
      }
    }
    
    setRevealed(newRevealed);
  };

  const revealCell = (y: number, x: number, newRevealed: boolean[][]) => {
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length || newRevealed[y][x] || flagged[y][x]) return;
    
    newRevealed[y][x] = true;
    
    if (grid[y][x] === 0) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          revealCell(y + dy, x + dx, newRevealed);
        }
      }
    }
  };

  const handleRightClick = (e: React.MouseEvent, y: number, x: number) => {
    e.preventDefault();
    if (!isPlaying || revealed[y][x]) return;

    const newFlagged = flagged.map(row => [...row]);
    newFlagged[y][x] = !newFlagged[y][x];
    setFlagged(newFlagged);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <CardHeader>
        <CardTitle className="text-center text-casino-gold">Minesweeper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MinesweeperControls
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          isPlaying={isPlaying}
          userBalance={user?.balance || 0}
          onStartGame={initializeGame}
        />
        {grid.length > 0 && (
          <MinesweeperGrid
            grid={grid}
            revealed={revealed}
            flagged={flagged}
            isPlaying={isPlaying}
            size={GRID_SIZES[difficulty].size}
            onCellClick={handleCellClick}
            onCellRightClick={handleRightClick}
          />
        )}
      </CardContent>
    </Card>
  );
};