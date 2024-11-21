import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";

interface Fish {
  id: number;
  x: number;
  y: number;
  direction: "left" | "right";
  speed: number;
  points: number;
  size: number;
}

export const FishHunter = () => {
  const { user, updateBalance } = useUser();
  const [score, setScore] = useState(0);
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bullets, setBullets] = useState(20);
  const containerRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    if (!user) return;
    if (user.balance < 10) {
      toast.error("Insufficient balance! Need $10 to play.");
      return;
    }
    updateBalance(-10);
    setIsPlaying(true);
    setScore(0);
    setBullets(20);
    setFishes([]);
  };

  const spawnFish = () => {
    if (!containerRef.current || !isPlaying) return;
    const direction = Math.random() > 0.5 ? "left" : "right";
    const size = Math.random() * 30 + 20;
    const points = Math.floor(50 / size * 10);
    const newFish: Fish = {
      id: Date.now(),
      x: direction === "left" ? -50 : containerRef.current.offsetWidth + 50,
      y: Math.random() * (containerRef.current.offsetHeight - 50),
      direction,
      speed: Math.random() * 2 + 1,
      points,
      size,
    };
    setFishes(prev => [...prev, newFish]);
  };

  useEffect(() => {
    if (isPlaying) {
      const spawnInterval = setInterval(spawnFish, 2000);
      return () => clearInterval(spawnInterval);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    const moveInterval = setInterval(() => {
      setFishes(prev => prev.map(fish => {
        const newX = fish.direction === "right" 
          ? fish.x - fish.speed 
          : fish.x + fish.speed;
        return { ...fish, x: newX };
      }).filter(fish => fish.x > -100 && fish.x < (containerRef.current?.offsetWidth || 0) + 100));
    }, 16);
    return () => clearInterval(moveInterval);
  }, [isPlaying]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying || bullets <= 0) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setBullets(prev => prev - 1);
    
    const hit = fishes.find(fish => {
      const distance = Math.sqrt(
        Math.pow(fish.x - x, 2) + Math.pow(fish.y - y, 2)
      );
      return distance < fish.size;
    });

    if (hit) {
      setScore(prev => prev + hit.points);
      setFishes(prev => prev.filter(f => f.id !== hit.id));
      
      // Create splash effect
      const splash = document.createElement('div');
      splash.className = 'absolute w-8 h-8 bg-blue-500 rounded-full animate-splash';
      splash.style.left = `${x - 16}px`;
      splash.style.top = `${y - 16}px`;
      containerRef.current?.appendChild(splash);
      setTimeout(() => splash.remove(), 300);
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    updateBalance(score);
    if (score > 0) {
      playWinSound();
    } else {
      playLoseSound();
    }
    toast.success(`Game Over! You won $${score}!`);
  };

  useEffect(() => {
    if (bullets === 0) {
      endGame();
    }
  }, [bullets]);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-casino-black/90 border-casino-gold/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-casino-gold">
          Fish Hunter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4 space-x-4">
          <span className="text-casino-gold">Score: ${score}</span>
          <span className="text-casino-gold">Bullets: {bullets}</span>
        </div>
        <div
          ref={containerRef}
          onClick={handleClick}
          className="relative w-full h-[400px] bg-blue-900/50 backdrop-blur-sm rounded-lg overflow-hidden cursor-crosshair border border-casino-gold/20"
          style={{ cursor: isPlaying ? 'crosshair' : 'default' }}
        >
          {fishes.map(fish => (
            <div
              key={fish.id}
              className="absolute transition-transform"
              style={{
                left: `${fish.x}px`,
                top: `${fish.y}px`,
                transform: `scaleX(${fish.direction === "right" ? -1 : 1})`,
              }}
            >
              <div 
                className="text-4xl animate-swim"
                style={{ fontSize: `${fish.size}px` }}
              >
                🐟
              </div>
            </div>
          ))}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Button onClick={startGame} className="bg-casino-gold hover:bg-yellow-600 text-black">
                Play ($10)
              </Button>
            </div>
          )}
        </div>
        {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
      </CardContent>
    </Card>
  );
};
