import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { playWinSound, playLoseSound } from "@/utils/sounds";

export const Pool = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [pocketedBalls, setPocketedBalls] = useState(0);

  const shoot = () => {
    if (!user) return;
    if (bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    setIsPlaying(true);
    updateBalance(-bet);

    // Simulate pool shot
    const success = Math.random() > 0.5;
    if (success) {
      setPocketedBalls(prev => prev + 1);
      const winnings = bet * 2;
      updateBalance(winnings);
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
      updateUserStats("pool", true, winnings);
      playWinSound();
      toast({
        title: "Nice Shot!",
        description: `Ball pocketed! You won $${winnings}!`,
      });
    } else {
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      updateUserStats("pool", false, bet);
      playLoseSound();
      toast({
        title: "Missed!",
        description: "Better luck next time!",
        variant: "destructive",
      });
    }

    setIsPlaying(false);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Pool</h2>
        <p className="text-sm text-gray-400">Take your shot!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
          <span className="text-blue-500">Balls Pocketed: {pocketedBalls}</span>
        </div>
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
          onClick={shoot}
          disabled={isPlaying || !user}
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
        >
          Take Shot
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