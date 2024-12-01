import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Coins } from "lucide-react";

export const CoinToss = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [isFlipping, setIsFlipping] = useState(false);
  const [bet, setBet] = useState(10);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const flip = (choice: "heads" | "tails") => {
    if (!user) return;
    if (bet > user.balance) {
      toast.error("Insufficient balance!");
      return;
    }

    if (bet <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    setIsFlipping(true);
    // Deduct bet immediately
    updateBalance(-bet);

    // Simulate coin flip
    setTimeout(() => {
      const result = Math.random() < 0.5 ? "heads" : "tails";
      const won = result === choice;

      if (won) {
        const winnings = bet * 2;
        updateBalance(winnings);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        updateUserStats(true);
        playWinSound();
        toast.success(`You won $${winnings - bet}!`);
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        updateUserStats(false);
        playLoseSound();
        toast.error(`You lost $${bet}!`);
      }
      setIsFlipping(false);
    }, 1500);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Coin Toss</h2>
        <p className="text-sm text-gray-400">Pick heads or tails!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <Coins className={`w-24 h-24 text-casino-gold ${isFlipping ? "animate-spin" : ""}`} />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
          <input
            type="number"
            min={1}
            value={bet}
            onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
            disabled={isFlipping}
            className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => flip("heads")}
            disabled={isFlipping || !user}
            className="bg-casino-gold hover:bg-casino-gold/90 text-black"
          >
            Heads
          </Button>
          <Button
            onClick={() => flip("tails")}
            disabled={isFlipping || !user}
            className="bg-casino-gold hover:bg-casino-gold/90 text-black"
          >
            Tails
          </Button>
        </div>
      </div>

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};