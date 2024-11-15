import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Coins, Cherry, Star, Gem } from "lucide-react";

const SYMBOLS = [
  { icon: Cherry, name: "cherry", multiplier: 2 },
  { icon: Star, name: "star", multiplier: 3 },
  { icon: Gem, name: "gem", multiplier: 7 },
  { icon: Coins, name: "coins", multiplier: 5 },
];

export const SlotMachine = () => {
  const { user, updateBalance } = useUser();
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(10);

  const spin = () => {
    if (!user) return;
    if (bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    updateBalance(-bet);

    // Simulate spinning animation
    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
    }, 100);

    // Stop spinning after 2 seconds and calculate winnings
    setTimeout(() => {
      clearInterval(spinInterval);
      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ];
      setReels(finalReels);
      setIsSpinning(false);

      // Check for wins
      if (finalReels[0].name === finalReels[1].name && finalReels[1].name === finalReels[2].name) {
        const winnings = bet * finalReels[0].multiplier;
        updateBalance(winnings);
        toast({
          title: "Jackpot!",
          description: `You won ${winnings} coins!`,
        });
      }
    }, 2000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Slot Machine</h2>
        <p className="text-sm text-gray-400">Match 3 symbols to win!</p>
      </div>

      <div className="flex justify-center gap-4 p-6 bg-casino-black rounded-lg border border-casino-gold/30">
        {reels.map((symbol, index) => (
          <div
            key={index}
            className={`w-24 h-24 flex items-center justify-center bg-casino-black/50 rounded-lg border-2 border-casino-gold/20 ${
              isSpinning ? "animate-spin-slow" : ""
            }`}
          >
            <symbol.icon className="w-12 h-12 text-casino-gold" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <input
            type="number"
            min={1}
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
          />
        </div>

        <Button
          onClick={spin}
          disabled={isSpinning || !user}
          className={`w-full ${
            isSpinning
              ? "bg-casino-gold/50"
              : "bg-casino-gold hover:bg-casino-gold/90"
          } text-casino-black`}
        >
          {isSpinning ? "Spinning..." : "Spin"}
        </Button>
      </div>

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: {user.balance} coins
        </div>
      )}
    </Card>
  );
};