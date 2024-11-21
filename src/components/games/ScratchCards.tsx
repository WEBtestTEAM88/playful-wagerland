import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { Coins, Sparkles, Diamond } from "lucide-react";
import { playWinSound, playLoseSound } from "@/utils/sounds";

const SCRATCH_PRICES = {
  basic: 50,
  silver: 100,
  gold: 200,
  diamond: 500,
};

const PRIZE_MULTIPLIERS = {
  basic: [0, 0, 0.25, 0.5, 0.75],
  silver: [0, 0.25, 0.5, 0.75, 1],
  gold: [0, 0.5, 0.75, 1, 1.5],
  diamond: [0.5, 1, 1.5, 2, 2.5],
};

type CardType = keyof typeof SCRATCH_PRICES;

export const ScratchCards = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedAreas, setScratchedAreas] = useState<number[]>([]);
  const [currentCard, setCurrentCard] = useState<CardType>("basic");
  const [prizes, setPrizes] = useState<number[]>([]);
  const [totalWin, setTotalWin] = useState<number | null>(null);

  const getGridSize = (type: CardType) => {
    switch (type) {
      case "basic":
        return 9; // 3x3
      case "silver":
        return 25; // 5x5
      case "gold":
        return 49; // 7x7
      case "diamond":
        return 49; // 7x7
      default:
        return 9;
    }
  };

  const getGridCols = (type: CardType) => {
    switch (type) {
      case "basic":
        return "grid-cols-3"; // 3x3
      case "silver":
        return "grid-cols-5"; // 5x5
      case "gold":
      case "diamond":
        return "grid-cols-7"; // 7x7
      default:
        return "grid-cols-3";
    }
  };

  const getMaxScratches = () => {
    return 3; // All cards have 3 scratches
  };

  const handlePurchaseCard = (type: CardType) => {
    if (!user) return;
    
    if (user.balance < SCRATCH_PRICES[type]) {
      toast.error("Insufficient balance!");
      return;
    }

    updateBalance(-SCRATCH_PRICES[type]);
    setCurrentCard(type);
    setIsScratching(true);
    setScratchedAreas([]);
    setTotalWin(null);
    
    const gridSize = getGridSize(type);
    const newPrizes = Array(gridSize)
      .fill(0)
      .map(() => {
        const multiplier = PRIZE_MULTIPLIERS[type][Math.floor(Math.random() * PRIZE_MULTIPLIERS[type].length)];
        return Math.floor(SCRATCH_PRICES[type] * multiplier);
      });
    setPrizes(newPrizes);
  };

  const handleScratch = (index: number) => {
    if (!isScratching || scratchedAreas.includes(index)) return;

    const maxScratches = getMaxScratches();
    if (scratchedAreas.length >= maxScratches) return;

    const newScratchedAreas = [...scratchedAreas, index];
    setScratchedAreas(newScratchedAreas);

    if (newScratchedAreas.length === maxScratches) {
      setIsScratching(false);
      const totalWin = newScratchedAreas.reduce((sum, idx) => sum + prizes[idx], 0);
      setTotalWin(totalWin);
      
      if (totalWin > 0) {
        updateBalance(totalWin);
        updateUserStats("scratchcards", true, totalWin - SCRATCH_PRICES[currentCard]);
        playWinSound();
        toast.success(`You won $${totalWin}!`);
      } else {
        updateUserStats("scratchcards", false, SCRATCH_PRICES[currentCard]);
        playLoseSound();
        toast.error("Better luck next time!");
      }
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <CardHeader>
        <CardTitle className="text-center text-casino-gold">Scratch Cards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScratching ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                onClick={() => handlePurchaseCard("basic")}
                className="w-full bg-casino-gold hover:bg-casino-gold/80 text-black font-semibold"
              >
                <Coins className="mr-2 h-4 w-4" />
                Basic ($50)
              </Button>
              <Button
                onClick={() => handlePurchaseCard("silver")}
                className="w-full bg-gray-400 hover:bg-gray-400/80 text-black font-semibold"
              >
                <Coins className="mr-2 h-4 w-4" />
                Silver ($100)
              </Button>
              <Button
                onClick={() => handlePurchaseCard("gold")}
                className="w-full bg-yellow-600 hover:bg-yellow-600/80 text-black font-semibold"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Gold ($200)
              </Button>
              <Button
                onClick={() => handlePurchaseCard("diamond")}
                className="w-full bg-blue-500 hover:bg-blue-500/80 text-white font-semibold"
              >
                <Diamond className="mr-2 h-4 w-4" />
                Diamond ($500)
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`grid ${getGridCols(currentCard)} gap-1 md:gap-2`}>
              {Array(getGridSize(currentCard))
                .fill(0)
                .map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleScratch(index)}
                    className={`aspect-square rounded-md transition-all duration-300 text-xs md:text-sm ${
                      scratchedAreas.includes(index)
                        ? "bg-casino-gold text-black"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {scratchedAreas.includes(index) && (
                      <span className="font-bold">${prizes[index]}</span>
                    )}
                  </button>
                ))}
            </div>
            {totalWin !== null && (
              <div className="text-center text-xl font-bold text-casino-gold">
                {totalWin > 0 ? `Total Win: $${totalWin}` : "No Win"}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};