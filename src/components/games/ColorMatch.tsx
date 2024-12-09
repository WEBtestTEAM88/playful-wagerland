import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Palette } from "lucide-react";

const COLORS = [
  { name: "Red", class: "bg-red-500" },
  { name: "Blue", class: "bg-blue-500" },
  { name: "Green", class: "bg-green-500" },
  { name: "Yellow", class: "bg-yellow-500" },
];

export const ColorMatch = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [targetColor, setTargetColor] = useState<string | null>(null);

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

    setIsPlaying(true);
    updateBalance(-bet);
    setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)].name);
  };

  const handleColorPick = (pickedColor: string) => {
    setTimeout(() => {
      if (pickedColor === targetColor) {
        const winAmount = bet * 4;
        playWinSound();
        updateBalance(winAmount);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        updateUserStats(true);
        toast.success(`Color match! You won $${winAmount - bet}!`);
      } else {
        playLoseSound();
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        toast.error(`Wrong color! It was ${targetColor}`);
      }
      setIsPlaying(false);
      setTargetColor(null);
    }, 1000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Color Match</h2>
        <p className="text-sm text-gray-400">Match the target color to win 4x your bet!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="flex justify-center items-center h-32">
        {targetColor ? (
          <div className="text-4xl font-bold text-casino-gold">{targetColor}</div>
        ) : (
          <Palette className="w-24 h-24 text-casino-gold" />
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
            {COLORS.map((color) => (
              <Button
                key={color.name}
                onClick={() => handleColorPick(color.name)}
                className={`h-16 ${color.class} hover:opacity-90`}
              >
                {color.name}
              </Button>
            ))}
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