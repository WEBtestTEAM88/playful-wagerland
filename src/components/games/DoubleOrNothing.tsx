import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { CircleDollarSign, Coins } from "lucide-react";

export const DoubleOrNothing = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [showCoins, setShowCoins] = useState(false);

  const play = async () => {
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
    setShowCoins(true);

    // Deduct bet immediately
    updateBalance(-bet);

    // Generate result immediately but wait to show it
    const success = Math.random() > 0.5;

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (success) {
      const winnings = bet * 2;
      updateBalance(winnings);
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
      updateUserStats("doubleOrNothing", true, winnings);
      playWinSound();
      toast({
        title: "Congratulations!",
        description: `You doubled your bet! Won $${winnings}!`,
      });
    } else {
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      updateUserStats("doubleOrNothing", false, bet);
      playLoseSound();
      toast({
        title: "Better luck next time!",
        description: "You lost your bet.",
        variant: "destructive",
      });
    }

    setIsPlaying(false);
    setTimeout(() => setShowCoins(false), 500);
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

      <div className="relative h-32 flex justify-center items-center">
        {showCoins && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(6)].map((_, i) => (
              <Coins
                key={i}
                className={`absolute text-casino-gold w-8 h-8 animate-[fall_1s_ease-in_forwards] opacity-0`}
                style={{
                  left: `${30 + i * 8}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
        <CircleDollarSign 
          className={`w-24 h-24 text-casino-gold transition-all duration-300 ${
            isPlaying ? 'animate-bounce' : ''
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
            onChange={(e) => setBet(Number(e.target.value))}
            className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
          />
        </div>

        <Button
          onClick={play}
          disabled={isPlaying || !user}
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
        >
          Double or Nothing
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