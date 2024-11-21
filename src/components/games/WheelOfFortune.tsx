import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { playWinSound, playSpinSound } from "@/utils/sounds";

const WHEEL_SEGMENTS = [
  { value: 0, color: "bg-red-600", multiplier: 0, label: "LOSE" },
  { value: 2, color: "bg-yellow-500", multiplier: 2, label: "2x" },
  { value: 3, color: "bg-green-500", multiplier: 3, label: "3x" },
  { value: 5, color: "bg-blue-500", multiplier: 5, label: "5x" },
  { value: 10, color: "bg-purple-500", multiplier: 10, label: "10x" },
  { value: 20, color: "bg-pink-500", multiplier: 20, label: "20x" },
];

export const WheelOfFortune = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [bet, setBet] = useState(10);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [lastWin, setLastWin] = useState<number | null>(null);

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
    setLastWin(null);

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
        updateUserStats(true);
        setLastWin(winnings - bet);
        playWinSound();
        toast({
          title: "Congratulations!",
          description: `You won $${winnings - bet}!`,
        });
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        updateUserStats(false);
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

      <div className="relative w-72 h-72 mx-auto">
        <div 
          className="absolute inset-0 rounded-full border-4 border-casino-gold overflow-hidden shadow-lg shadow-casino-gold/20"
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
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white font-bold text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                {segment.label}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-8 bg-casino-gold" 
             style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      </div>

      {lastWin !== null && (
        <div className="text-center text-xl font-bold text-green-500 animate-bounce">
          Won: ${lastWin}
        </div>
      )}

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

