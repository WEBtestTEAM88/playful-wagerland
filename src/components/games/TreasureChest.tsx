import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Gem } from "lucide-react";

const CHESTS = [
  { multiplier: 1.5, chance: 0.4, color: "bg-bronze-400" },
  { multiplier: 2.5, chance: 0.3, color: "bg-silver-400" },
  { multiplier: 4.0, chance: 0.2, color: "bg-casino-gold" },
  { multiplier: 10.0, chance: 0.1, color: "bg-purple-600" },
];

export const TreasureChest = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);

  const openChest = (index: number) => {
    if (!user || isPlaying) return;
    
    if (bet > user.balance) {
      toast.error("Insufficient balance!");
      return;
    }

    setIsPlaying(true);
    updateBalance(-bet);

    const random = Math.random();
    let cumulative = 0;
    let won = false;
    let winAmount = 0;

    for (const chest of CHESTS) {
      cumulative += chest.chance;
      if (random <= cumulative) {
        winAmount = bet * chest.multiplier;
        if (index === CHESTS.indexOf(chest)) {
          won = true;
          updateBalance(winAmount);
          playWinSound();
          toast.success(`You won $${winAmount.toFixed(2)}!`);
        } else {
          playLoseSound();
          toast.error("Wrong chest! Better luck next time!");
        }
        break;
      }
    }

    updateUserStats(won);
    setTimeout(() => setIsPlaying(false), 1000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Treasure Chest</h2>
        <p className="text-sm text-gray-400">
          Pick a chest to open! Different chests have different rewards.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {CHESTS.map((chest, index) => (
          <Button
            key={index}
            onClick={() => openChest(index)}
            disabled={isPlaying || !user}
            className={`h-24 ${chest.color} hover:opacity-90 transition-opacity flex flex-col items-center justify-center`}
          >
            <Gem className="w-8 h-8 mb-2" />
            <div className="text-black font-bold">{chest.multiplier}x</div>
          </Button>
        ))}
      </div>

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

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};