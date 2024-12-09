import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { useUser } from "@/contexts/UserContext";

const RACE_DURATION = 8000; // 8 seconds
const UPDATE_INTERVAL = 50; // Update more frequently for smoother movement
const OBSTACLE_CHANCE = 0.3; // 30% chance of obstacle per update
const MOVEMENT_SPEED = 3;
const OBSTACLE_DAMAGE = 3;

export const useSpaceRace = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [isRacing, setIsRacing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [position, setPosition] = useState(50);
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
          // Spawn asteroids 20-40% ahead of the current progress
          y: currentProgress + 20 + (Math.random() * 20)
        }]);
      }
    }, 400);

    const raceInterval = setInterval(() => {
      currentProgress += (UPDATE_INTERVAL / RACE_DURATION) * 100;
      
      const hitObstacle = obstacles.some(obstacle => 
        Math.abs(obstacle.x - position) < 10 && 
        Math.abs(obstacle.y - currentProgress) < 5
      );
      
      if (hitObstacle) {
        currentProgress -= OBSTACLE_DAMAGE;
        toast.error("Hit an asteroid! Losing altitude!");
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

  return {
    bet,
    setBet,
    isRacing,
    progress,
    position,
    obstacles,
    stats,
    moveRocket,
    startRace,
    user
  };
};