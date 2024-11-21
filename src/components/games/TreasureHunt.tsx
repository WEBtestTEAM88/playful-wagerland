import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { Diamond, Bomb } from "lucide-react";
import { playWinSound, playLoseSound } from "@/utils/sounds";

const GRID_SIZE = 5;
const TREASURE_REWARD = 50;
const BOMB_COUNT = 3;

export const TreasureHunt = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<Array<"hidden" | "treasure" | "bomb" | "empty">>([]);
  const [revealedCells, setRevealedCells] = useState<number[]>([]);
  const [betAmount, setBetAmount] = useState(10);

  const initializeGame = () => {
    if (!user || user.balance < betAmount) {
      toast.error("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    
    const newGrid = Array(GRID_SIZE * GRID_SIZE).fill("hidden");
    const treasurePosition = Math.floor(Math.random() * newGrid.length);
    newGrid[treasurePosition] = "treasure";
    
    let bombsPlaced = 0;
    while (bombsPlaced < BOMB_COUNT) {
      const position = Math.floor(Math.random() * newGrid.length);
      if (newGrid[position] === "hidden") {
        newGrid[position] = "bomb";
        bombsPlaced++;
      }
    }

    setGrid(newGrid);
    setRevealedCells([]);
    setIsPlaying(true);
  };

  const handleCellClick = (index: number) => {
    if (!isPlaying || revealedCells.includes(index)) return;

    const newRevealedCells = [...revealedCells, index];
    setRevealedCells(newRevealedCells);

    if (grid[index] === "treasure") {
      setIsPlaying(false);
      const winnings = TREASURE_REWARD;
      updateBalance(winnings);
      updateUserStats("treasurehunt", true, winnings - betAmount);
      playWinSound();
      toast.success(`You found the treasure! Won $${winnings}!`);
    } else if (grid[index] === "bomb") {
      setIsPlaying(false);
      updateUserStats("treasurehunt", false, betAmount);
      playLoseSound();
      toast.error("Boom! You hit a bomb!");
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <CardHeader>
        <CardTitle className="text-center text-casino-gold">Treasure Hunt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center items-center mb-4">
          <div className="flex items-center space-x-4">
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
            </div>
            <div className="flex justify-center">
          <Button
            onClick={initializeGame}
            disabled={isPlaying}
            className="bg-casino-gold hover:bg-casino-gold/90 text-casino-black ml-8"
          >
            Start Game
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {grid.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!isPlaying || revealedCells.includes(index)}
              className={`aspect-square rounded-md flex items-center justify-center transition-all duration-300 ${
                revealedCells.includes(index)
                  ? "bg-casino-gold/20"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {revealedCells.includes(index) && (
                <div className="text-2xl">
                  {cell === "treasure" && <Diamond className="text-casino-gold" />}
                  {cell === "bomb" && <Bomb className="text-casino-red" />}
                  {cell === "empty" && <span>·</span>}
                </div>
              )}
            </button>
          ))}
        </div>
        {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
      </CardContent>
    </Card>
  );
};