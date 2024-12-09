import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Gamepad } from "lucide-react";

export const HigherLower = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const generateNumber = () => Math.floor(Math.random() * 100) + 1;

  const startGame = () => {
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

    setCurrentNumber(generateNumber());
    setIsPlaying(true);
    updateBalance(-bet);
  };

  const makeGuess = (higher: boolean) => {
    const nextNumber = generateNumber();
    const isCorrect = higher ? nextNumber > currentNumber! : nextNumber < currentNumber!;
    
    setTimeout(() => {
      if (isCorrect) {
        const winAmount = bet * 2;
        playWinSound();
        updateBalance(winAmount);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        updateUserStats(true);
        toast.success(`Next number was ${nextNumber}! You won $${winAmount - bet}!`);
      } else {
        playLoseSound();
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        toast.error(`Next number was ${nextNumber}. Wrong guess!`);
      }
      setIsPlaying(false);
      setCurrentNumber(null);
    }, 1000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Higher or Lower</h2>
        <p className="text-sm text-gray-400">Guess if the next number will be higher or lower!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="flex justify-center items-center h-32">
        {currentNumber ? (
          <div className="text-6xl font-bold text-casino-gold">{currentNumber}</div>
        ) : (
          <Gamepad className="w-24 h-24 text-casino-gold" />
        )}
      </div>

      <div className="space-y-4">
        {!isPlaying ? (
          <>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
              <input
                type="number"
                min={1}
                value={bet}
                onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
                className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
              />
            </div>
            <Button
              onClick={startGame}
              disabled={!user || bet > (user?.balance || 0)}
              className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
            >
              Start Game
            </Button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => makeGuess(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Higher
            </Button>
            <Button
              onClick={() => makeGuess(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Lower
            </Button>
          </div>
        )}
      </div>

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};