import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Rocket, Star, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

const RACE_DURATION = 8000; // 8 seconds
const UPDATE_INTERVAL = 50; // Update more frequently for smoother movement
const OBSTACLE_CHANCE = 0.2; // 20% chance of obstacle per update
const MOVEMENT_SPEED = 3; // Speed of lateral movement

export const SpaceRace = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isRacing, setIsRacing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [position, setPosition] = useState(50); // 0-100 horizontal position
  const [obstacles, setObstacles] = useState<Array<{ x: number; y: number }>>([]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isRacing) return;
    
    switch(e.key) {
      case "ArrowLeft":
        setPosition(prev => Math.max(0, prev - MOVEMENT_SPEED));
        break;
      case "ArrowRight":
        setPosition(prev => Math.min(100, prev + MOVEMENT_SPEED));
        break;
    }
  }, [isRacing]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const moveRocket = (direction: 'left' | 'right') => {
    if (!isRacing) return;
    if (direction === 'left') {
      setPosition(prev => Math.max(0, prev - MOVEMENT_SPEED));
    } else {
      setPosition(prev => Math.min(100, prev + MOVEMENT_SPEED));
    }
  };

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
    setPosition(50);
    setObstacles([]);
    updateBalance(-bet);

    let currentProgress = 0;
    let obstacleInterval = setInterval(() => {
      if (Math.random() < OBSTACLE_CHANCE) {
        setObstacles(prev => [...prev, {
          x: Math.random() * 100,
          y: currentProgress + (Math.random() * 20)
        }]);
      }
    }, 500);

    const raceInterval = setInterval(() => {
      currentProgress += (UPDATE_INTERVAL / RACE_DURATION) * 100;
      
      // Check for collisions
      const hitObstacle = obstacles.some(obstacle => 
        Math.abs(obstacle.x - position) < 10 && 
        Math.abs(obstacle.y - currentProgress) < 5
      );
      
      if (hitObstacle) {
        currentProgress -= 2; // Lose progress on obstacle hit
        toast.error("Hit an asteroid! Slowing down...");
      }

      if (currentProgress >= 100) {
        clearInterval(raceInterval);
        clearInterval(obstacleInterval);
        handleRaceEnd(true);
      } else if (currentProgress < 0) {
        clearInterval(raceInterval);
        clearInterval(obstacleInterval);
        handleRaceEnd(false);
      }

      setProgress(Math.max(0, Math.min(100, currentProgress)));
    }, UPDATE_INTERVAL);

    return () => {
      clearInterval(raceInterval);
      clearInterval(obstacleInterval);
    };
  };

  const handleRaceEnd = (finished: boolean) => {
    setIsRacing(false);
    setProgress(0);
    setObstacles([]);

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
          Navigate through the asteroid field using arrow keys or buttons! Reach the finish line for 3x your bet!
        </p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
          {/* Progress track */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20"
            style={{ transform: `translateY(${100 - progress}%)` }}
          />
          
          {/* Obstacles */}
          {obstacles.map((obstacle, index) => (
            <div
              key={index}
              className="absolute w-4 h-4 text-yellow-500"
              style={{
                left: `${obstacle.x}%`,
                top: `${100 - obstacle.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Star className="animate-pulse" />
            </div>
          ))}
          
          {/* Player rocket */}
          <div
            className="absolute bottom-0 w-8 h-8 text-casino-gold transition-all duration-100"
            style={{
              left: `${position}%`,
              transform: 'translateX(-50%)',
              bottom: `${progress}%`
            }}
          >
            <Rocket className={`${isRacing ? 'animate-bounce' : ''}`} />
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => moveRocket('left')}
            disabled={!isRacing}
            className="bg-casino-gold/20 hover:bg-casino-gold/30"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <Button
            onClick={() => moveRocket('right')}
            disabled={!isRacing}
            className="bg-casino-gold/20 hover:bg-casino-gold/30"
          >
            <ArrowRight className="w-6 h-6" />
          </Button>
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