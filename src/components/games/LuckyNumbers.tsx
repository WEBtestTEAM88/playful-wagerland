import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";

export const LuckyNumbers = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bet, setBet] = useState(10);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const selectNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else if (selectedNumbers.length < 3) {
      setSelectedNumbers(prev => [...prev, num]);
    }
  };

  const play = () => {
    if (!user) return;
    if (selectedNumbers.length !== 3) {
      toast.error("Please select exactly 3 numbers!");
      return;
    }
    if (bet > user.balance) {
      toast.error("Insufficient balance!");
      return;
    }

    setIsPlaying(true);
    updateBalance(-bet);

    // Draw random numbers
    const drawnNumbers = Array.from({ length: 3 }, () => 
      Math.floor(Math.random() * 9) + 1
    );

    setTimeout(() => {
      const matches = selectedNumbers.filter(n => drawnNumbers.includes(n)).length;
      let winnings = 0;

      if (matches >= 2) {
        const multiplier = matches === 3 ? 50 : 5;
        winnings = bet * multiplier;
        updateBalance(winnings);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        playWinSound();
        toast.success(`${matches} matches! You won $${winnings}!`);
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        playLoseSound();
        toast.error("Better luck next time!");
      }

      updateUserStats(matches >= 2);
      setIsPlaying(false);
      setSelectedNumbers([]);
    }, 1500);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Lucky Numbers</h2>
        <p className="text-sm text-gray-400">Pick 3 numbers from 1-9. Match 2+ to win!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
          <Button
            key={num}
            onClick={() => !isPlaying && selectNumber(num)}
            className={`h-12 ${
              selectedNumbers.includes(num)
                ? "bg-casino-gold text-black"
                : "bg-casino-black/50"
            }`}
            disabled={isPlaying}
          >
            {num}
          </Button>
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
          onClick={play}
          disabled={isPlaying || !user || selectedNumbers.length !== 3}
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-black"
        >
          {isPlaying ? "Playing..." : "Play"}
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