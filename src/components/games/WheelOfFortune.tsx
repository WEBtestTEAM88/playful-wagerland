import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { playWinSound, playSpinSound } from "@/utils/sounds";

const WHEEL_SEGMENTS = [
  { value: 0, color: "bg-red-500", multiplier: 0 },
  { value: 2, color: "bg-blue-500", multiplier: 2 },
  { value: 5, color: "bg-green-500", multiplier: 5 },
  { value: 10, color: "bg-yellow-500", multiplier: 10 },
  { value: 20, color: "bg-purple-500", multiplier: 20 },
  { value: 50, color: "bg-pink-500", multiplier: 50 },
];

export const WheelOfFortune = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [bet, setBet] = useState(10);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const spin = () => {
    if (!user) return;
    if (bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    updateBalance(-bet);
    playSpinSound();

    // Random number of full rotations (3-5) plus the winning segment
    const fullRotations = (Math.floor(Math.random() * 3) + 3) * 360;
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const winningSegmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const finalAngle = fullRotations + (winningSegmentIndex * segmentAngle);
    
    setRotation(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const segment = WHEEL_SEGMENTS[winningSegmentIndex];
      
      if (segment.multiplier > 0) {
        const winnings = bet * segment.multiplier;
        updateBalance(winnings);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        updateUserStats("wheelOfFortune", true, winnings - bet);
        playWinSound();
        toast({
          title: "Congratulations!",
          description: `You won $${winnings - bet}!`,
        });
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        updateUserStats("wheelOfFortune", false, bet);
        toast({
          title: "Better luck next time!",
          description: "Try again!",
          variant: "destructive",
        });
      }
    }, 4000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Wheel of Fortune</h2>
        <p className="text-sm text-gray-400">Spin to win big!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="relative w-64 h-64 mx-auto">
        <div 
          className="absolute inset-0 rounded-full border-4 border-casino-gold overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)' : 'none'
          }}
        >
          {WHEEL_SEGMENTS.map((segment, index) => (
            <div
              key={index}
              className={`absolute w-1/2 h-1/2 ${segment.color} origin-bottom-right`}
              style={{
                transform: `rotate(${index * (360 / WHEEL_SEGMENTS.length)}deg)`,
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-white font-bold">
                x{segment.multiplier}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-8 bg-casino-gold clip-triangle" />
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
          onClick={spin}
          disabled={isSpinning || !user}
          className={`w-full ${
            isSpinning
              ? "bg-casino-gold/50"
              : "bg-casino-gold hover:bg-casino-gold/90"
          } text-casino-black`}
        >
          {isSpinning ? "Spinning..." : "Spin"}
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