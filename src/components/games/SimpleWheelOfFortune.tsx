import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";

const BETTING_ZONES = [
  { multiplier: 2, color: "bg-red-600", chance: 0.45 },
  { multiplier: 3, color: "bg-black", chance: 0.3 },
  { multiplier: 5, color: "bg-casino-gold", chance: 0.2 },
  { multiplier: 10, color: "bg-green-600", chance: 0.05 },
];

export const SimpleWheelOfFortune = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [betAmount, setBetAmount] = useState(10);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    if (!user || selectedZone === null) {
      toast.error("Please select a betting zone first!");
      return;
    }

    if (user.balance < betAmount) {
      toast.error("Insufficient balance!");
      return;
    }

    setIsSpinning(true);
    updateBalance(-betAmount);

    const random = Math.random();
    let cumulative = 0;
    let winningZone = 0;

    for (let i = 0; i < BETTING_ZONES.length; i++) {
      cumulative += BETTING_ZONES[i].chance;
      if (random <= cumulative) {
        winningZone = i;
        break;
      }
    }

    setTimeout(() => {
      setIsSpinning(false);
      
      if (winningZone === selectedZone) {
        const winnings = betAmount * BETTING_ZONES[selectedZone].multiplier;
        updateBalance(winnings);
        updateUserStats("wheelOfFortune", true, winnings - betAmount);
        playWinSound();
        toast.success(`You won $${winnings}!`);
      } else {
        updateUserStats("wheelOfFortune", false, betAmount);
        playLoseSound();
        toast.error("Better luck next time!");
      }
      
      setSelectedZone(null);
    }, 2000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <CardHeader>
        <CardTitle className="text-center text-casino-gold">Simple Wheel of Fortune</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="space-x-2">
            <Button
              onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
              disabled={isSpinning}
              className="bg-casino-red"
            >
              -10
            </Button>
            <span className="text-casino-gold px-4">Bet: ${betAmount}</span>
            <Button
              onClick={() => setBetAmount(betAmount + 10)}
              disabled={isSpinning || (user?.balance || 0) < betAmount + 10}
              className="bg-casino-green"
            >
              +10
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {BETTING_ZONES.map((zone, index) => (
            <Button
              key={index}
              onClick={() => setSelectedZone(index)}
              disabled={isSpinning}
              className={`h-24 ${zone.color} ${
                selectedZone === index ? "ring-4 ring-white" : ""
              }`}
            >
              <div className="text-white text-center">
                <div className="text-2xl font-bold">{zone.multiplier}x</div>
                <div className="text-sm">{(zone.chance * 100).toFixed(1)}%</div>
              </div>
            </Button>
          ))}
        </div>

        <Button
          onClick={handleSpin}
          disabled={isSpinning || selectedZone === null}
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black mt-4"
        >
          {isSpinning ? "Spinning..." : "Spin"}
        </Button>
      </CardContent>
    </Card>
  );
};