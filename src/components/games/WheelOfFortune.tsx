import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { playWinSound, playSpinSound } from "@/utils/sounds";

const SEGMENTS = [
  { value: 0, color: "bg-red-600", label: "LOSE" },
  { value: 2, color: "bg-yellow-500", label: "2x" },
  { value: 3, color: "bg-green-500", label: "3x" },
  { value: 5, color: "bg-blue-500", label: "5x" },
  { value: 10, color: "bg-purple-500", label: "10x" },
  { value: 20, color: "bg-pink-500", label: "20x" },
];

export const WheelOfFortune = () => {
  const { user, updateBalance } = useUser();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [bet, setBet] = useState(10);
  const [currentSegment, setCurrentSegment] = useState(0);

  const handleSpin = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to play",
        variant: "destructive",
      });
      return;
    }

    if (bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet",
        variant: "destructive",
      });
      return;
    }

    // Deduct bet immediately
    updateBalance(-bet);
    setIsSpinning(true);
    playSpinSound();

    // Calculate spin result
    const spinDuration = 5000;
    const minSpins = 5;
    const maxSpins = 8;
    const randomSpins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    const segmentAngle = 360 / SEGMENTS.length;
    const randomSegment = Math.floor(Math.random() * SEGMENTS.length);
    const finalRotation = rotation + (randomSpins * 360) + (randomSegment * segmentAngle);
    
    setRotation(finalRotation);
    setCurrentSegment(randomSegment);

    // Handle result after spin
    setTimeout(() => {
      setIsSpinning(false);
      const segment = SEGMENTS[randomSegment];

      if (segment.value > 0) {
        const winAmount = bet * segment.value;
        updateBalance(winAmount);
        playWinSound();
        toast({
          title: "Congratulations!",
          description: `You won ${segment.label} - $${winAmount}!`,
        });
      } else {
        toast({
          title: "Better luck next time!",
          description: "Try again!",
          variant: "destructive",
        });
      }
    }, spinDuration);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Wheel of Fortune</h2>
        <p className="text-sm text-gray-400">Spin to win up to 20x your bet!</p>
      </div>

      <div className="relative w-64 h-64 mx-auto">
        {/* Wheel */}
        <div
          className="absolute inset-0 rounded-full border-4 border-casino-gold overflow-hidden transition-all duration-[5000ms] ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {SEGMENTS.map((segment, index) => (
            <div
              key={index}
              className={`absolute w-1/2 h-1/2 ${segment.color} origin-bottom-right`}
              style={{
                transform: `rotate(${index * (360 / SEGMENTS.length)}deg)`,
              }}
            >
              <div 
                className="absolute top-6 left-1/2 -translate-x-1/2 text-white font-bold text-xl whitespace-nowrap"
                style={{ 
                  transform: `rotate(${-index * (360 / SEGMENTS.length)}deg)`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {segment.label}
              </div>
            </div>
          ))}
        </div>

        {/* Center point and pointer */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-casino-gold rounded-full z-20" />
        </div>
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-8 bg-casino-gold z-10"
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
          <input
            type="number"
            min={1}
            value={bet}
            onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
            className="w-full bg-casino-black/50 border border-casino-gold/30 text-casino-white rounded-md p-2"
          />
        </div>

        <Button
          onClick={handleSpin}
          disabled={isSpinning || !user}
          className={`w-full ${
            isSpinning
              ? "bg-casino-gold/50 cursor-not-allowed"
              : "bg-casino-gold hover:bg-casino-gold/90"
          } text-casino-black font-bold`}
        >
          {isSpinning ? "Spinning..." : "SPIN"}
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