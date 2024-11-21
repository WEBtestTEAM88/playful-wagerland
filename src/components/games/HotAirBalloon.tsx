import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

export const HotAirBalloon = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [position, setPosition] = useState(50);
  const [coins, setCoins] = useState<{ x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bet, setBet] = useState(10);

  useEffect(() => {
    if (isPlaying) {
      const gameLoop = setInterval(() => {
        setPosition(prev => {
          const newPos = prev + (Math.random() * 4 - 2);
          return Math.max(0, Math.min(100, newPos));
        });

        if (Math.random() < 0.1) {
          setCoins(prev => [...prev, {
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10
          }]);
        }
      }, 50);

      const gameTimer = setTimeout(() => {
        clearInterval(gameLoop);
        endGame();
      }, 10000);

      return () => {
        clearInterval(gameLoop);
        clearTimeout(gameTimer);
      };
    }
  }, [isPlaying]);

  const startGame = () => {
    if (user && user.balance >= bet) {
      setIsPlaying(true);
      setScore(0);
      setCoins([]);
      updateBalance(-bet);
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    const won = score >= 5;
    const winAmount = won ? bet * 2 : 0;
    
    if (won) {
      updateBalance(winAmount);
      playWinSound();
    } else {
      playLoseSound();
    }
    
    updateUserStats("hot_air_balloon", won, Math.abs(winAmount));
  };

  const moveBalloon = (direction: "up" | "down") => {
    if (isPlaying) {
      setPosition(prev => {
        const newPos = prev + (direction === "up" ? -5 : 5);
        return Math.max(0, Math.min(100, newPos));
      });

      setCoins(prev => {
        return prev.filter(coin => {
          const collected = Math.abs(coin.y - position) < 10;
          if (collected) setScore(s => s + 1);
          return !collected;
        });
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hot Air Balloon Race</CardTitle>
        <CardDescription>Collect coins in the clouds!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Bet: ${bet}</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setBet(Math.max(1, bet - 5))}
              disabled={!user || user.balance < bet - 5 || isPlaying}
            >
              -5
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setBet(bet + 5)}
              disabled={!user || user.balance < bet + 5 || isPlaying}
            >
              +5
            </Button>
          </div>
        </div>

        <div className="relative w-full h-60 bg-blue-100 rounded-lg overflow-hidden">
          <div 
            className="absolute w-8 h-8 bg-red-500 rounded-full transition-all duration-200"
            style={{ top: `${position}%`, left: '20%' }}
          />
          {coins.map((coin, i) => (
            <div 
              key={i}
              className="absolute w-4 h-4 bg-yellow-400 rounded-full"
              style={{ top: `${coin.y}%`, left: `${coin.x}%` }}
            />
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onMouseDown={() => moveBalloon("up")}
            disabled={!isPlaying}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            onMouseDown={() => moveBalloon("down")}
            disabled={!isPlaying}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center">
          <p>Score: {score}</p>
          {!isPlaying && (
            <Button 
              onClick={startGame}
              disabled={!user || user.balance < bet}
              className="mt-2"
            >
              Start Game
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};