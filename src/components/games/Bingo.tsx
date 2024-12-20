import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { playWinSound, playLoseSound } from "@/utils/sounds";

export const Bingo = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [numbers, setNumbers] = useState<number[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);

  useEffect(() => {
    const generateUniqueNumbers = () => {
      const nums = new Set<number>();
      while (nums.size < 25) {
        nums.add(Math.floor(Math.random() * 75) + 1);
      }
      return Array.from(nums);
    };
    setNumbers(generateUniqueNumbers());
  }, []);

  const selectNumber = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(prev => prev.filter(n => n !== number));
    } else if (selectedNumbers.length < 5) {
      setSelectedNumbers(prev => [...prev, number]);
    }
  };

  const play = () => {
    if (!user) return;
    if (selectedNumbers.length !== 5) {
      toast({
        title: "Select Numbers",
        description: "Please select exactly 5 numbers to play",
        variant: "destructive",
      });
      return;
    }
    if (bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }
    if (bet <= 0) {
      toast({
        title: "Invalid bet",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }

    setIsPlaying(true);
    // Deduct bet immediately
    updateBalance(-bet);

    // Draw 5 unique random numbers
    const drawn = new Set<number>();
    while (drawn.size < 5) {
      drawn.add(Math.floor(Math.random() * 75) + 1);
    }
    const drawnArray = Array.from(drawn);
    setDrawnNumbers(drawnArray);

    // Check matches
    const matches = selectedNumbers.filter(n => drawnArray.includes(n)).length;

    setTimeout(() => {
      if (matches >= 3) {
        const multiplier = matches === 5 ? 100 : matches === 4 ? 10 : 2;
        const winnings = bet * multiplier;
        playWinSound();
        updateBalance(winnings);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        updateUserStats(true);
        toast({
          title: "Bingo!",
          description: `${matches} matches! You won $${winnings - bet}!`,
        });
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        updateUserStats(false);
        playLoseSound();
        toast({
          title: "No Bingo",
          description: `Only ${matches} matches. You lost $${bet}!`,
          variant: "destructive",
        });
      }

      setTimeout(() => {
        setIsPlaying(false);
        setSelectedNumbers([]);
        setDrawnNumbers([]);
        const newNumbers = new Set<number>();
        while (newNumbers.size < 25) {
          newNumbers.add(Math.floor(Math.random() * 75) + 1);
        }
        setNumbers(Array.from(newNumbers));
      }, 3000);
    }, 1000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Bingo</h2>
        <p className="text-sm text-gray-400">Select 5 numbers and try your luck!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {numbers.map((number, index) => (
          <Button
            key={index}
            onClick={() => !isPlaying && selectNumber(number)}
            className={`h-12 ${
              selectedNumbers.includes(number)
                ? "bg-casino-gold text-black"
                : drawnNumbers.includes(number)
                ? "bg-green-500 text-white"
                : "bg-casino-black/50"
            }`}
            disabled={isPlaying}
          >
            {number}
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
          disabled={isPlaying || !user || selectedNumbers.length !== 5}
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
        >
          Play Bingo
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