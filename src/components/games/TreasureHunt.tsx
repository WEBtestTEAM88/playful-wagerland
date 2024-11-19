import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { Coins, Bomb, Diamond } from "lucide-react";

const GRID_SIZE = 5;
const BET_AMOUNT = 10;
const TREASURE_REWARD = 50;
const BOMB_COUNT = 3;

export const TreasureHunt = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<Array<"hidden" | "treasure" | "bomb" | "empty">>([]);
  const [revealedCells, setRevealedCells] = useState<number[]>([]);

  const initializeGame = () => {
    if (!user || user.balance < BET_AMOUNT) {
      toast.error("Insufficient balance!");
      return;
    }

    updateBalance(-BET_AMOUNT);
    
    // Create empty grid
    const newGrid = Array(GRID_SIZE * GRID_SIZE).fill("hidden");
    
    // Place treasure
    const treasurePosition = Math.floor(Math.random() * newGrid.length);
    newGrid[treasurePosition] = "treasure";
    
    // Place bombs
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
      updateBalance(TREASURE_REWARD);
      updateUserStats("treasurehunt", true, TREASURE_REWARD - BET_AMOUNT);
      toast.success(`You found the treasure! Won $${TREASURE_REWARD}!`);
    } else if (grid[index] === "bomb") {
      setIsPlaying(false);
      updateUserStats("treasurehunt", false, BET_AMOUNT);
      toast.error("Boom! You hit a bomb!");
    }
  };

  const getCellContent = (type: string) => {
    switch (type) {
      case "treasure":
        return <Diamond className="w-6 h-6 text-casino-gold" />;
      case "bomb":
        return <Bomb className="w-6 h-6 text-casino-red" />;
      case "empty":
        return <span className="w-6 h-6" />;
      default:
        return <span className="w-6 h-6" />;
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <CardHeader>
        <CardTitle className="text-center text-casino-gold">Treasure Hunt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-casino-gold">Bet: ${BET_AMOUNT}</span>
          <Button
            onClick={initializeGame}
            disabled={isPlaying}
            className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
          >
            <Coins className="mr-2 h-4 w-4" />
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
              {revealedCells.includes(index) && getCellContent(cell)}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
