import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { CircleDollarSign } from "lucide-react";

export const DoubleOrNothing = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const handlePlay = () => {
    if (!user) {
      toast.error("Please log in to play");
      return;
    }

    if (bet > user.balance) {
      toast.error("Insufficient funds");
      return;
    }

    if (bet <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    setIsPlaying(true);
    updateBalance(-bet);

    // Generate result immediately but show it after animation
    const success = Math.random() > 0.5;

    setTimeout(() => {
      if (success) {
        const winnings = bet * 2;
        playWinSound();
        setTimeout(() => {
          updateBalance(winnings);
          setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
          updateUserStats("doubleOrNothing", true, winnings - bet);
          toast.success(`You won $${winnings}!`);
        }, 100);
      } else {
        playLoseSound();
        setTimeout(() => {
          setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
          updateUserStats("doubleOrNothing", false, bet);
          toast.error(`You lost $${bet}`);
        }, 100);
      }
      setIsPlaying(false);
    }, 1000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Double or Nothing</h2>
        <p className="text-sm text-gray-400">50/50 chance to double your bet!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="flex justify-center items-center h-32">
        <CircleDollarSign 
          className={`w-24 h-24 text-casino-gold transition-all duration-300 ${
            isPlaying ? 'animate-spin' : ''
          }`}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
          <input
            type="number"
            min={1}
            value={bet}
            onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
            disabled={isPlaying}
            className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
          />
        </div>

        <Button
          onClick={handlePlay}
          disabled={isPlaying || !user || bet > (user?.balance || 0)}
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
        >
          {isPlaying ? "Rolling..." : "Double or Nothing!"}
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