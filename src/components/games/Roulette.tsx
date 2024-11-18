import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { CircleDot, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { playWinSound, playLoseSound, playSpinSound } from "@/utils/sounds";

export const Roulette = () => {
  const { user, updateBalance } = useUser();
  const [bet, setBet] = useState(10);
  const [selectedNumber, setSelectedNumber] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [wheelRotation, setWheelRotation] = useState(0);

  const handleSpin = () => {
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

    // Simulate roulette spin with dynamic rotation
    const spins = 5; // Number of full rotations
    const result = Math.floor(Math.random() * 37);
    const finalRotation = spins * 360 + (result * (360 / 37));
    setWheelRotation(finalRotation);

    setTimeout(() => {
      setLastResult(result);
      if (result === selectedNumber) {
        const winnings = bet * 35;
        updateBalance(winnings);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        playWinSound();
        toast({
          title: "Congratulations!",
          description: `You won $${winnings}!`,
        });
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        playLoseSound();
      }
      setIsSpinning(false);
    }, 3000);
  };

  const renderRouletteWheel = () => {
    return (
      <div className="relative w-64 h-64 mx-auto mb-6">
        <div 
          className={`absolute inset-0 rounded-full border-4 border-casino-gold bg-gradient-to-br from-casino-black to-casino-black/80 flex items-center justify-center transform`}
          style={{
            transform: `rotate(${wheelRotation}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <CircleDot className="w-16 h-16 text-casino-gold" />
          </div>
          {Array.from({ length: 37 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-4 bg-casino-gold/50"
              style={{
                transform: `rotate(${i * (360 / 37)}deg) translateY(-50%)`,
                transformOrigin: '50% 50%',
                top: '50%',
              }}
            />
          ))}
        </div>
        {lastResult !== null && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-casino-gold font-bold text-xl">
            Last: {lastResult}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Roulette</h2>
        <p className="text-sm text-gray-400">Choose a number between 0 and 36</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="relative w-72 h-72 mx-auto">
        <div 
          className="absolute inset-0 rounded-full border-4 border-casino-gold bg-gradient-to-br from-casino-black to-casino-black/80 shadow-lg shadow-casino-gold/20"
          style={{
            transform: `rotate(${wheelRotation}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <CircleDot className="w-16 h-16 text-casino-gold animate-pulse" />
          </div>
          {Array.from({ length: 37 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-4 bg-casino-gold/50"
              style={{
                transform: `rotate(${i * (360 / 37)}deg) translateY(-50%)`,
                transformOrigin: '50% 50%',
                top: '50%',
              }}
            />
          ))}
        </div>
        {lastResult !== null && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-casino-gold font-bold text-xl animate-bounce">
            Last: {lastResult}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Number (0-36)</label>
          <Input
            type="number"
            min={0}
            max={36}
            value={selectedNumber}
            onChange={(e) => setSelectedNumber(Number(e.target.value))}
            className="bg-casino-black/50 border-casino-gold/30 text-casino-white"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
          <Input
            type="number"
            min={1}
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="bg-casino-black/50 border-casino-gold/30 text-casino-white"
          />
        </div>
      </div>

      <Button
        onClick={handleSpin}
        disabled={isSpinning || !user}
        className={`w-full ${
          isSpinning
            ? "bg-casino-gold/50"
            : "bg-casino-gold hover:bg-casino-gold/90"
        } text-casino-black`}
      >
        {isSpinning ? "Spinning..." : "Spin"}
      </Button>

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};
