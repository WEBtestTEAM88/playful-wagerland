import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane } from "lucide-react";

export const FlightControl = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [planes, setPlanes] = useState<Array<{id: number; x: number; y: number; target: number}>>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bet, setBet] = useState(10);
  const [selectedPlane, setSelectedPlane] = useState<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const spawnPlane = setInterval(() => {
        if (planes.length < 3) {
          setPlanes(prev => [...prev, {
            id: Date.now(),
            x: 0,
            y: Math.floor(Math.random() * 3) * 33,
            target: Math.floor(Math.random() * 3) * 33
          }]);
        }
      }, 2000);

      const movePlanes = setInterval(() => {
        setPlanes(prev => prev.map(plane => ({
          ...plane,
          x: plane.x + 2
        })).filter(plane => plane.x < 100));
      }, 100);

      const gameTimer = setTimeout(() => {
        clearInterval(spawnPlane);
        clearInterval(movePlanes);
        endGame();
      }, 30000);

      return () => {
        clearInterval(spawnPlane);
        clearInterval(movePlanes);
        clearTimeout(gameTimer);
      };
    }
  }, [isPlaying]);

  const startGame = () => {
    if (user && user.balance >= bet) {
      setIsPlaying(true);
      setScore(0);
      setPlanes([]);
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
    
    updateUserStats("flight_control", won, Math.abs(winAmount));
  };

  const handleLaneClick = (lane: number) => {
    if (selectedPlane !== null) {
      setPlanes(prev => prev.map(plane => 
        plane.id === selectedPlane 
          ? { ...plane, target: lane }
          : plane
      ));
      setSelectedPlane(null);

      // Check if plane landed correctly
      const plane = planes.find(p => p.id === selectedPlane);
      if (plane && Math.abs(plane.target - plane.y) < 5) {
        setScore(prev => prev + 1);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Flight Control</CardTitle>
        <CardDescription>Guide planes to safe landing!</CardDescription>
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

        <div className="relative w-full h-60 bg-blue-50 rounded-lg overflow-hidden">
          {[0, 33, 66].map((lane) => (
            <div 
              key={lane}
              onClick={() => handleLaneClick(lane)}
              className="absolute w-full h-[33%] border-t-2 border-dashed border-gray-300 cursor-pointer hover:bg-blue-100/50"
              style={{ top: `${lane}%` }}
            />
          ))}
          
          {planes.map((plane) => (
            <div
              key={plane.id}
              onClick={() => setSelectedPlane(plane.id)}
              className={`absolute transition-all duration-200 ${
                selectedPlane === plane.id ? 'scale-125' : ''
              }`}
              style={{ 
                left: `${plane.x}%`, 
                top: `${plane.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Plane className={`h-6 w-6 ${
                selectedPlane === plane.id ? 'text-blue-500' : 'text-gray-600'
              }`} />
            </div>
          ))}
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