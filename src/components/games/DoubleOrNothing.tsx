import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

export const DoubleOrNothing = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [diceRoll, setDiceRoll] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  const DiceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const CurrentDice = DiceIcons[diceRoll - 1];

  const rollDice = () => {
    setIsRolling(true);
    const rollInterval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      setIsRolling(false);
    }, 1000);
  };

  const play = () => {
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
    rollDice();

    setTimeout(() => {
      const success = Math.random() > 0.5;
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
    }, 1200);
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

      <div className="flex justify-center my-8">
        <div className={`transform transition-all duration-100 ${isRolling ? 'animate-spin' : ''}`}>
          <CurrentDice className="w-24 h-24 text-casino-gold" />
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