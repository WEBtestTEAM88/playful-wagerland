import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { Bomb, Flag } from "lucide-react";
import { playWinSound, playLoseSound } from "@/utils/sounds";

const GRID_SIZES = {
  easy: { size: 8, mines: 10 },
  medium: { size: 12, mines: 20 },
  hard: { size: 16, mines: 40 },
};

type Difficulty = keyof typeof GRID_SIZES;
type CellContent = "hidden" | "mine" | "empty" | number;

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
    
    // Initialize empty grid
    const newGrid: CellContent[][] = Array(size).fill(null).map(() => 
      Array(size).fill("empty")
    );
    
    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      if (newGrid[y][x] !== "mine") {
        newGrid[y][x] = "mine";
        minesPlaced++;
      }
    }
    
    // Calculate numbers
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
      // Game Over
      setIsPlaying(false);
      updateUserStats("minesweeper", false, betAmount);
      playLoseSound();
      toast.error("Boom! Game Over!");
      // Reveal all mines
      grid.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell === "mine") newRevealed[i][j] = true;
        });
      });
    } else {
      // Reveal clicked cell and neighbors if empty
      revealCell(y, x, newRevealed);
      
      // Check win condition
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
        <div className="flex justify-between items-center mb-4">
          <div className="space-x-2">
            <Button
              onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
              disabled={isPlaying || betAmount <= 10}
              className="bg-casino-red"
            >
              -10
            </Button>
            <span className="text-casino-gold px-4">Bet: ${betAmount}</span>
            <Button
              onClick={() => setBetAmount(betAmount + 10)}
              disabled={isPlaying || (user?.balance || 0) < betAmount + 10}
              className="bg-casino-green"
            >
              +10
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setDifficulty("easy")}
              disabled={isPlaying}
              className={`w-24 ${difficulty === "easy" ? "bg-casino-gold" : "bg-gray-700"}`}
            >
              Easy
            </Button>
            <Button
              onClick={() => setDifficulty("medium")}
              disabled={isPlaying}
              className={`w-24 ${difficulty === "medium" ? "bg-casino-gold" : "bg-gray-700"}`}
            >
              Medium
            </Button>
            <Button
              onClick={() => setDifficulty("hard")}
              disabled={isPlaying}
              className={`w-24 ${difficulty === "hard" ? "bg-casino-gold" : "bg-gray-700"}`}
            >
              Hard
            </Button>
          </div>
          <Button
            onClick={initializeGame}
            disabled={isPlaying}
            className="bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
          >
            Start Game
          </Button>
        </div>
        <div className="grid gap-1" style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZES[difficulty].size}, minmax(0, 1fr))` 
        }}>
          {grid.map((row, y) => 
            row.map((cell, x) => (
              <button
                key={`${y}-${x}`}
                onClick={() => handleCellClick(y, x)}
                onContextMenu={(e) => handleRightClick(e, y, x)}
                className={`aspect-square rounded-sm flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  revealed[y]?.[x]
                    ? cell === "mine"
                      ? "bg-casino-red"
                      : "bg-casino-gold/20"
                    : flagged[y]?.[x]
                    ? "bg-casino-green"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                disabled={!isPlaying || revealed[y]?.[x]}
              >
                {revealed[y]?.[x] ? (
                  cell === "mine" ? (
                    <Bomb className="w-4 h-4" />
                  ) : cell === 0 ? (
                    ""
                  ) : (
                    cell
                  )
                ) : flagged[y]?.[x] ? (
                  <Flag className="w-4 h-4" />
                ) : null}
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};