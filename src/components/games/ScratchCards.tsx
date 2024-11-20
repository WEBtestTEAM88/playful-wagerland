import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { Coins, Sparkles } from "lucide-react";
import { playWinSound, playLoseSound } from "@/utils/sounds";

const SCRATCH_PRICES = {
  basic: 50,
  silver: 100,
  gold: 200,
};

const PRIZE_MULTIPLIERS = {
  basic: [0, 0, 0.5, 1, 1.5],
  silver: [0, 0.5, 1, 1.5, 2],
  gold: [0, 1, 1.5, 2, 3],
};

type CardType = keyof typeof SCRATCH_PRICES;

export const ScratchCards = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedAreas, setScratchedAreas] = useState<number[]>([]);
  const [currentCard, setCurrentCard] = useState<CardType>("basic");
  const [prizes, setPrizes] = useState<number[]>([]);

  const getGridSize = (type: CardType) => {
    return 9; // All cards now use 3x3 grid
  };

  const getMaxScratches = () => {
    return 3; // All cards now have 3 scratches
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
            <div className="grid grid-cols-3 gap-2">
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
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
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
        )}
      </CardContent>
    </Card>
  );
};