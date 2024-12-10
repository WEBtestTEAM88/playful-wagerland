import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Diamond, Skull, Battery } from "lucide-react";

const GRID_SIZE = 8;
const CRYSTAL_COUNT = 5;
const TRAP_COUNT = 8;
const ENERGY_DRAIN = 10;
const MIN_BET = 10;

export const CrystalMaze = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(MIN_BET);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [grid, setGrid] = useState<Array<Array<string>>>(Array(GRID_SIZE).fill(Array(GRID_SIZE).fill("")));
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [energy, setEnergy] = useState(100);
  const [crystalsCollected, setCrystalsCollected] = useState(0);
  const [revealed, setRevealed] = useState<Array<Array<boolean>>>(
    Array(GRID_SIZE).fill(Array(GRID_SIZE).fill(false))
  );

  const initializeGame = () => {
    if (!user) {
      toast.error("Please log in to play");
      return;
    }

    if (bet > user.balance) {
      toast.error("Insufficient funds");
      return;
    }

    if (bet < MIN_BET) {
      toast.error(`Minimum bet is $${MIN_BET}`);
      return;
    }

    // Deduct bet
    updateBalance(-bet);

    // Initialize new grid
    const newGrid = Array(GRID_SIZE).fill("").map(() => Array(GRID_SIZE).fill(""));
    const newRevealed = Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false));

    // Place crystals
    let crystalsPlaced = 0;
    while (crystalsPlaced < CRYSTAL_COUNT) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      if (newGrid[y][x] === "") {
        newGrid[y][x] = "crystal";
        crystalsPlaced++;
      }
    }

    // Place traps
    let trapsPlaced = 0;
    while (trapsPlaced < TRAP_COUNT) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      if (newGrid[y][x] === "" && !(x === 0 && y === 0)) {
        newGrid[y][x] = "trap";
        trapsPlaced++;
      }
    }

    // Reset game state
    setGrid(newGrid);
    setRevealed(newRevealed);
    setPlayerPos({ x: 0, y: 0 });
    setEnergy(100);
    setCrystalsCollected(0);
    setIsPlaying(true);
  };

  const move = (dx: number, dy: number) => {
    if (!isPlaying || energy <= 0) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      return;
    }

    // Update position and reveal cells around new position
    setPlayerPos({ x: newX, y: newY });
    const newRevealed = revealed.map((row, y) =>
      row.map((cell, x) => {
        if (Math.abs(x - newX) <= 1 && Math.abs(y - newY) <= 1) {
          return true;
        }
        return cell;
      })
    );
    setRevealed(newRevealed);

    // Handle cell content
    const cellContent = grid[newY][newX];
    if (cellContent === "crystal") {
      playWinSound();
      setCrystalsCollected(prev => prev + 1);
      const newGrid = grid.map(row => [...row]);
      newGrid[newY][newX] = "";
      setGrid(newGrid);
      
      if (crystalsCollected + 1 === CRYSTAL_COUNT) {
        endGame(true);
      }
    } else if (cellContent === "trap") {
      playLoseSound();
      setEnergy(prev => Math.max(0, prev - ENERGY_DRAIN));
      if (energy - ENERGY_DRAIN <= 0) {
        endGame(false);
      }
    }

    // Drain energy for movement
    setEnergy(prev => {
      const newEnergy = prev - 5;
      if (newEnergy <= 0) {
        endGame(false);
      }
      return newEnergy;
    });
  };

  const endGame = (won: boolean) => {
    setIsPlaying(false);
    if (won) {
      const winnings = bet * 3;
      updateBalance(winnings);
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
      updateUserStats(true);
      toast.success(`You collected all crystals! Won $${winnings - bet}!`);
    } else {
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      updateUserStats(false);
      toast.error("Game Over! Out of energy!");
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Crystal Maze</h2>
        <p className="text-sm text-gray-400">
          Navigate the maze, collect crystals, avoid traps!
        </p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-casino-gold">
          <Diamond className="inline-block mr-2" />
          {crystalsCollected}/{CRYSTAL_COUNT}
        </div>
        <div className="text-yellow-500">
          <Battery className="inline-block mr-2" />
          {energy}%
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1 bg-casino-black/50 p-2 rounded-lg">
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-10 h-10 flex items-center justify-center rounded ${
                playerPos.x === x && playerPos.y === y
                  ? "bg-blue-500"
                  : revealed[y][x]
                  ? "bg-casino-black/80"
                  : "bg-casino-black/30"
              }`}
            >
              {revealed[y][x] && cell === "crystal" && (
                <Diamond className="text-yellow-500" size={20} />
              )}
              {revealed[y][x] && cell === "trap" && (
                <Skull className="text-red-500" size={20} />
              )}
              {playerPos.x === x && playerPos.y === y && "🚀"}
            </div>
          ))
        )}
      </div>

      {isPlaying ? (
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => move(0, -1)}
            disabled={!isPlaying || energy <= 0}
            className="col-start-2"
          >
            ↑
          </Button>
          <Button
            onClick={() => move(-1, 0)}
            disabled={!isPlaying || energy <= 0}
            className="col-start-1"
          >
            ←
          </Button>
          <Button
            onClick={() => move(0, 1)}
            disabled={!isPlaying || energy <= 0}
            className="col-start-2"
          >
            ↓
          </Button>
          <Button
            onClick={() => move(1, 0)}
            disabled={!isPlaying || energy <= 0}
            className="col-start-3"
          >
            →
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
            <input
              type="number"
              min={MIN_BET}
              value={bet}
              onChange={(e) => setBet(Math.max(MIN_BET, Number(e.target.value)))}
              className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
            />
          </div>
          <Button
            onClick={initializeGame}
            disabled={!user || bet > (user?.balance || 0)}
            className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
          >
            Start Game (${bet})
          </Button>
        </div>
      )}

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};