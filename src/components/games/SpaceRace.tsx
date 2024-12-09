import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Rocket, Star } from "lucide-react";

const RACE_DURATION = 5000; // 5 seconds
const UPDATE_INTERVAL = 100; // Update progress every 100ms
const OBSTACLE_CHANCE = 0.3; // 30% chance of obstacle per update

export const SpaceRace = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isRacing, setIsRacing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [selectedLane, setSelectedLane] = useState(1);

  const startRace = () => {
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

    setIsRacing(true);
    setProgress(0);
    updateBalance(-bet);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += (UPDATE_INTERVAL / RACE_DURATION) * 100;
      
      // Random obstacles in different lanes
      const hitObstacle = Math.random() < OBSTACLE_CHANCE && 
                         Math.floor(Math.random() * 3) + 1 === selectedLane;
      
      if (hitObstacle) {
        currentProgress -= 5; // Lose 5% progress on obstacle hit
        toast.error("Hit an asteroid! Slowing down...");
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        handleRaceEnd(true);
      } else if (currentProgress < 0) {
        clearInterval(interval);
        handleRaceEnd(false);
      }

      setProgress(Math.max(0, Math.min(100, currentProgress)));
    }, UPDATE_INTERVAL);

    // Cleanup interval if component unmounts
    return () => clearInterval(interval);
  };

  const handleRaceEnd = (finished: boolean) => {
    setIsRacing(false);
    setProgress(0);

    if (finished) {
      const winAmount = bet * 3;
      playWinSound();
      updateBalance(winAmount);
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
      updateUserStats(true);
      toast.success(`Race completed! You won $${winAmount - bet}!`);
    } else {
      playLoseSound();
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      updateUserStats(false);
      toast.error("Your ship crashed! Better luck next time!");
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Space Race</h2>
        <p className="text-sm text-gray-400">
          Navigate through the asteroid field! Choose your lane wisely and reach the finish line for 3x your bet!
        </p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-8 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-casino-gold transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-center items-center h-24 gap-4">
          {[1, 2, 3].map(lane => (
            <Button
              key={lane}
              onClick={() => !isRacing && setSelectedLane(lane)}
              className={`w-20 h-20 ${
                selectedLane === lane 
                  ? 'bg-casino-gold text-casino-black' 
                  : 'bg-gray-800 text-casino-gold'
              }`}
              disabled={isRacing}
            >
              {selectedLane === lane ? (
                <Rocket className={`w-8 h-8 ${isRacing ? 'animate-pulse' : ''}`} />
              ) : (
                <Star className="w-8 h-8" />
              )}
            </Button>
          ))}
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
          <input
            type="number"
            min={1}
            value={bet}
            onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
            disabled={isRacing}
            className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
          />
        </div>

        <Button
          onClick={startRace}
          disabled={isRacing || !user || bet > (user?.balance || 0)}
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
        >
          {isRacing ? "Racing..." : "Start Race"}
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