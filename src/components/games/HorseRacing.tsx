import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";

interface Horse {
  id: number;
  name: string;
  position: number;
  speed: number;
  odds: number;
}

export const HorseRacing = () => {
  const { user, updateBalance } = useUser();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [winner, setWinner] = useState<number | null>(null);

  const initializeHorses = () => {
    const newHorses: Horse[] = [
      { id: 1, name: "Thunder", position: 0, speed: 0, odds: 2.5 },
      { id: 2, name: "Lightning", position: 0, speed: 0, odds: 3.0 },
      { id: 3, name: "Storm", position: 0, speed: 0, odds: 3.5 },
      { id: 4, name: "Bolt", position: 0, speed: 0, odds: 4.0 },
    ];
    setHorses(newHorses);
    setWinner(null);
  };

  useEffect(() => {
    initializeHorses();
  }, []);

  const startRace = () => {
    if (!user) return;
    if (!selectedHorse) {
      toast.error("Please select a horse first!");
      return;
    }
    if (user.balance < betAmount) {
      toast.error("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    setIsRacing(true);
    setWinner(null);

    // Set random speeds for each horse
    setHorses(prev => prev.map(horse => ({
      ...horse,
      position: 0,
      speed: Math.random() * 2 + 2
    })));
  };

  useEffect(() => {
    if (!isRacing) return;

    const raceInterval = setInterval(() => {
      setHorses(prev => {
        const updatedHorses = prev.map(horse => ({
          ...horse,
          position: horse.position + horse.speed + (Math.random() * 0.5)
        }));

        const finishedHorse = updatedHorses.find(h => h.position >= 100);
        if (finishedHorse) {
          setIsRacing(false);
          setWinner(finishedHorse.id);
          
          if (finishedHorse.id === selectedHorse) {
            const winnings = Math.floor(betAmount * finishedHorse.odds);
            updateBalance(winnings);
            playWinSound();
            toast.success(`You won $${winnings}!`);
          } else {
            playLoseSound();
            toast.error("Better luck next time!");
          }
        }

        return updatedHorses;
      });
    }, 50);

    return () => clearInterval(raceInterval);
  }, [isRacing, selectedHorse, betAmount]);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-casino-black/90 border-casino-gold/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-casino-gold">
          Horse Racing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {horses.map(horse => (
            <Button
              key={horse.id}
              onClick={() => !isRacing && setSelectedHorse(horse.id)}
              className={`p-4 ${
                selectedHorse === horse.id
                  ? "bg-casino-gold text-black"
                  : "bg-casino-black/50 text-casino-gold border border-casino-gold/20"
              }`}
              disabled={isRacing}
            >
              {horse.name} (Odds: {horse.odds}x)
            </Button>
          ))}
        </div>

        <div className="relative h-[400px] bg-green-900/30 backdrop-blur-sm rounded-lg p-4 border border-casino-gold/20">
          {horses.map((horse, index) => (
            <div
              key={horse.id}
              className="relative h-[80px] mb-4"
            >
              <div className="absolute left-0 top-0 w-full h-2 bg-white/20" />
              <div
                className="absolute h-16 transition-all duration-50"
                style={{
                  left: `${horse.position}%`,
                  top: '8px'
                }}
              >
                <div className={`text-4xl ${isRacing ? 'animate-bounce' : ''}`}>
                  🐎
                </div>
                <div className="text-xs text-white mt-1">{horse.name}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
          <div className="space-x-2">
            <Button
              onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
              disabled={isRacing || betAmount <= 10}
              className="bg-casino-red"
            >
              -10
            </Button>
            <span className="text-casino-gold px-4">Bet: ${betAmount}</span>
            <Button
              onClick={() => setBetAmount(betAmount + 10)}
              disabled={isRacing || (user?.balance || 0) < betAmount + 10}
              className="bg-casino-green"
            >
              +10
            </Button>
          </div>
          <Button
            onClick={startRace}
            disabled={isRacing || !selectedHorse}
            className="bg-casino-gold hover:bg-yellow-600 text-black"
          >
            {isRacing ? "Racing..." : "Start Race"}
          </Button>
        </div>

        {winner && (
          <div className="text-center text-casino-gold mt-4">
            {winner === selectedHorse
              ? `Congratulations! ${horses.find(h => h.id === winner)?.name} won!`
              : `${horses.find(h => h.id === winner)?.name} won. Better luck next time!`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
