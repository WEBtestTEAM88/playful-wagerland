import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { Coins, Diamond, Sparkles } from "lucide-react";
import { playWinSound, playLoseSound } from "@/utils/sounds";

const SCRATCH_PRICES = {
  basic: 50,
  silver: 100,
  gold: 200,
  diamond: 500,
  sapphire: 1000,
  ruby: 2000,
};

const PRIZE_MULTIPLIERS = {
  basic: [0, 0, 1, 1.5, 2],
  silver: [0, 1, 1.5, 2, 3],
  gold: [0, 1.5, 2, 3, 5],
  diamond: [0, 2, 3, 5, 10],
  sapphire: [0, 3, 5, 10, 20],
  ruby: [1, 2, 5, 10, 20, 50],
};

type CardType = keyof typeof SCRATCH_PRICES;

export const ScratchCards = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedAreas, setScratchedAreas] = useState<number[]>([]);
  const [currentCard, setCurrentCard] = useState<CardType>("basic");
  const [prizes, setPrizes] = useState<number[]>([]);

  const getGridSize = (type: CardType) => {
    if (type === "basic" || type === "silver") return 9;
    if (type === "gold") return 12;
    if (type === "diamond") return 16;
    if (type === "sapphire") return 25;
    return 64; // ruby (8x8)
  };

  const getMaxScratches = (type: CardType) => {
    return type === "ruby" ? 5 : 3;
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
        return SCRATCH_PRICES[type] * multiplier;
      });
    setPrizes(newPrizes);
  };

  const handleScratch = (index: number) => {
    if (!isScratching || scratchedAreas.includes(index)) return;

    const maxScratches = getMaxScratches(currentCard);
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

  const getGridCols = (type: CardType) => {
    if (type === "basic" || type === "silver") return "grid-cols-3";
    if (type === "gold") return "grid-cols-4";
    if (type === "diamond") return "grid-cols-4";
    if (type === "sapphire") return "grid-cols-5";
    return "grid-cols-8"; // ruby
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <CardHeader>
        <CardTitle className="text-center text-casino-gold">Scratch Cards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScratching ? (
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => handlePurchaseCard("basic")}
              className="w-40 bg-casino-gold hover:bg-casino-gold/80 text-black font-semibold"
            >
              <Coins className="mr-2 h-4 w-4" />
              Basic ($50)
            </Button>
            <Button
              onClick={() => handlePurchaseCard("silver")}
              className="w-40 bg-gray-400 hover:bg-gray-400/80 text-black font-semibold"
            >
              <Coins className="mr-2 h-4 w-4" />
              Silver ($100)
            </Button>
            <Button
              onClick={() => handlePurchaseCard("gold")}
              className="w-40 bg-yellow-600 hover:bg-yellow-600/80 text-black font-semibold"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Gold ($200)
            </Button>
            <Button
              onClick={() => handlePurchaseCard("diamond")}
              className="w-40 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            >
              <Diamond className="mr-2 h-4 w-4" />
              Diamond ($500)
            </Button>
            <Button
              onClick={() => handlePurchaseCard("sapphire")}
              className="w-40 bg-blue-700 hover:bg-blue-800 text-white font-semibold"
            >
              <Diamond className="mr-2 h-4 w-4" />
              Sapphire ($1000)
            </Button>
            <Button
              onClick={() => handlePurchaseCard("ruby")}
              className="w-40 bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <Diamond className="mr-2 h-4 w-4" />
              Ruby ($2000)
            </Button>
          </div>
        ) : (
          <div className={`grid ${getGridCols(currentCard)} gap-2`}>
            {Array(getGridSize(currentCard))
              .fill(0)
              .map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleScratch(index)}
                  className={`aspect-square rounded-md transition-all duration-300 ${
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
