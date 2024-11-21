import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Coins, Cherry, Star, Gem, Diamond, Bell } from "lucide-react";
import { playWinSound, playLoseSound, playSpinSound } from "@/utils/sounds";

const SYMBOLS = [
  { icon: Cherry, name: "cherry", multiplier: 2 },
  { icon: Star, name: "star", multiplier: 3 },
  { icon: Gem, name: "gem", multiplier: 5 },
  { icon: Diamond, name: "diamond", multiplier: 7 },
  { icon: Bell, name: "bell", multiplier: 4 },
  { icon: Coins, name: "coins", multiplier: 6 },
];

export const SlotMachine = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

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
    setLastWin(null);
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
        setLastWin(winnings);
        updateBalance(winnings);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        updateUserStats("slotMachine", true, winnings);
        playWinSound();
        toast({
          title: "Jackpot!",
          description: `You won $${winnings}!`,
        });
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        updateUserStats("slotMachine", false, bet);
        playLoseSound();
      }
    }, 2000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Slot Machine</h2>
        <p className="text-sm text-gray-400">Match 3 symbols to win!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="relative">
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
        {lastWin && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-casino-gold text-casino-black px-4 py-1 rounded-full text-sm font-bold animate-bounce">
            +${lastWin}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 p-4 bg-casino-black/30 rounded-lg">
        {SYMBOLS.map((symbol, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
            <symbol.icon className="w-4 h-4 text-casino-gold" />
            <span>x{symbol.multiplier}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
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
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};