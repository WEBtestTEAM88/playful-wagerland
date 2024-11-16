import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Gem, Diamond, Pickaxe } from "lucide-react";
import { playWinSound, playLoseSound, playSpinSound } from "@/utils/sounds";

const SYMBOLS = [
  { icon: Gem, name: "gem", multiplier: 3 },
  { icon: Diamond, name: "diamond", multiplier: 5 },
  { icon: Pickaxe, name: "pickaxe", multiplier: 2 },
];

export const DiamondMine = () => {
  const { user, updateBalance } = useUser();
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const bet = 10;

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
    playSpinSound();

    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ];
      setReels(finalReels);
      setIsSpinning(false);

      if (finalReels[0].name === finalReels[1].name && finalReels[1].name === finalReels[2].name) {
        const winnings = bet * finalReels[0].multiplier;
        updateBalance(winnings);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        playWinSound();
        toast({
          title: "Winner!",
          description: `You won $${winnings}!`,
        });
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        playLoseSound();
      }
    }, 2000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Diamond Mine</h2>
        <p className="text-sm text-gray-400">Match 3 symbols to win!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 p-6 bg-casino-black rounded-lg border border-casino-gold/30">
        {reels.map((symbol, index) => (
          <div
            key={index}
            className={`w-20 h-20 flex items-center justify-center bg-casino-black/50 rounded-lg border-2 border-casino-gold/20 ${
              isSpinning ? "animate-spin-slow" : ""
            }`}
          >
            <symbol.icon className="w-10 h-10 text-casino-gold" />
          </div>
        ))}
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
        {isSpinning ? "Spinning..." : `Spin ($${bet})`}
      </Button>

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};