import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { Coins, Sparkles } from "lucide-react";

const SCRATCH_PRICES = {
  basic: 5,
  silver: 10,
  gold: 20,
};

const PRIZE_MULTIPLIERS = {
  basic: [0, 0, 0, 1, 1.5, 2],
  silver: [0, 0, 1, 1.5, 2, 3],
  gold: [0, 1, 1.5, 2, 3, 5],
};

export const ScratchCards = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedAreas, setScratchedAreas] = useState<number[]>([]);
  const [currentCard, setCurrentCard] = useState<"basic" | "silver" | "gold">("basic");
  const [prizes, setPrizes] = useState<number[]>([]);

  const handlePurchaseCard = (type: "basic" | "silver" | "gold") => {
    if (!user) return;
    
    if (user.balance < SCRATCH_PRICES[type]) {
      toast.error("Insufficient balance!");
      return;
    }

    updateBalance(-SCRATCH_PRICES[type]);
    setCurrentCard(type);
    setIsScratching(true);
    setScratchedAreas([]);
    
    // Generate random prizes
    const newPrizes = Array(9)
      .fill(0)
      .map(() => {
        const multiplier = PRIZE_MULTIPLIERS[type][Math.floor(Math.random() * PRIZE_MULTIPLIERS[type].length)];
        return SCRATCH_PRICES[type] * multiplier;
      });
    setPrizes(newPrizes);
  };

  const handleScratch = (index: number) => {
    if (!isScratching || scratchedAreas.includes(index)) return;

    const newScratchedAreas = [...scratchedAreas, index];
    setScratchedAreas(newScratchedAreas);

    if (newScratchedAreas.length === 3) {
      setIsScratching(false);
      const totalWin = prizes[newScratchedAreas[0]] + 
                      prizes[newScratchedAreas[1]] + 
                      prizes[newScratchedAreas[2]];
      
      if (totalWin > 0) {
        updateBalance(totalWin);
        updateUserStats("scratchcards", true, totalWin);
        toast.success(`You won $${totalWin}!`);
      } else {
        updateUserStats("scratchcards", false, SCRATCH_PRICES[currentCard]);
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
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={() => handlePurchaseCard("basic")}
              className="bg-casino-gold hover:bg-casino-gold/80"
            >
              <Coins className="mr-2 h-4 w-4" />
              Basic ($5)
            </Button>
            <Button
              onClick={() => handlePurchaseCard("silver")}
              className="bg-gray-400 hover:bg-gray-400/80"
            >
              <Coins className="mr-2 h-4 w-4" />
              Silver ($10)
            </Button>
            <Button
              onClick={() => handlePurchaseCard("gold")}
              className="bg-yellow-600 hover:bg-yellow-600/80"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Gold ($20)
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {Array(9)
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
