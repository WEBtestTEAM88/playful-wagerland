import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Anchor, Ship } from "lucide-react";

const CREW_SIZES = [2, 3, 4, 5];
const TREASURE_MULTIPLIERS = {
  2: 3, // 3x for 2 crew members
  3: 5, // 5x for 3 crew members
  4: 8, // 8x for 4 crew members
  5: 12, // 12x for 5 crew members
};

export const PiratePlunder = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [crewSize, setCrewSize] = useState(2);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const startPlunder = () => {
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

    // Calculate success chance based on crew size (smaller crews have better odds)
    const baseChance = 60; // 60% base chance
    const crewPenalty = (crewSize - 2) * 15; // Each additional crew member reduces chance by 15%
    const successChance = baseChance - crewPenalty;

    setTimeout(() => {
      const success = Math.random() * 100 < successChance;

      if (success) {
        const multiplier = TREASURE_MULTIPLIERS[crewSize as keyof typeof TREASURE_MULTIPLIERS];
        const winAmount = bet * multiplier;
        playWinSound();
        updateBalance(winAmount);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        updateUserStats(true);
        toast.success(`Treasure found! You won $${winAmount - bet}!`);
      } else {
        playLoseSound();
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        updateUserStats(false);
        toast.error("Your crew failed to find the treasure!");
      }
      setIsPlaying(false);
    }, 1500);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Pirate Plunder</h2>
        <p className="text-sm text-gray-400">
          Assemble your crew and hunt for treasure! Larger crews mean bigger rewards but lower success rates.
        </p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="flex justify-center items-center h-32">
        {isPlaying ? (
          <Ship className="w-24 h-24 text-casino-gold animate-bounce" />
        ) : (
          <Anchor className="w-24 h-24 text-casino-gold" />
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Crew Size</label>
          <select
            value={crewSize}
            onChange={(e) => setCrewSize(Number(e.target.value))}
            disabled={isPlaying}
            className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
          >
            {CREW_SIZES.map(size => (
              <option key={size} value={size}>
                {size} crew ({TREASURE_MULTIPLIERS[size as keyof typeof TREASURE_MULTIPLIERS]}x multiplier)
              </option>
            ))}
          </select>
        </div>

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
          onClick={startPlunder}
          disabled={isPlaying || !user || bet > (user?.balance || 0)}
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
        >
          {isPlaying ? "Searching for treasure..." : "Start Plunder"}
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