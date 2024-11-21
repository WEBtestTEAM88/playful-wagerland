import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const PaperPlane = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [power, setPower] = useState(50);
  const [isCharging, setIsCharging] = useState(false);
  const [distance, setDistance] = useState(0);
  const [bet, setBet] = useState(10);

  const handleMouseDown = () => {
    setIsCharging(true);
    const chargeInterval = setInterval(() => {
      setPower(prev => prev < 100 ? prev + 2 : 0);
    }, 50);

    const handleMouseUp = () => {
      setIsCharging(false);
      clearInterval(chargeInterval);
      launchPlane();
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mouseup', handleMouseUp);
  };

  const launchPlane = () => {
    const distance = Math.floor(power * (Math.random() * 0.5 + 0.75));
    setDistance(distance);
    
    const won = distance > 75;
    const winAmount = won ? bet * 2 : -bet;
    
    updateBalance(winAmount);
    updateUserStats("paper_plane", won, Math.abs(winAmount));
    
    if (won) {
      playWinSound();
    } else {
      playLoseSound();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Paper Plane Challenge</CardTitle>
        <CardDescription>Hold to charge, release to launch!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Bet: ${bet}</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setBet(Math.max(1, bet - 5))}
              disabled={!user || user.balance < bet - 5}
            >
              -5
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setBet(bet + 5)}
              disabled={!user || user.balance < bet + 5}
            >
              +5
            </Button>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 h-4 rounded-full">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all"
            style={{ width: `${power}%` }}
          />
        </div>
        
        <Button
          className="w-full"
          onMouseDown={handleMouseDown}
          disabled={!user || user.balance < bet}
        >
          {isCharging ? "Charging..." : "Hold to Launch"}
        </Button>
        
        {distance > 0 && (
          <div className="text-center">
            <p>Distance: {distance}m</p>
            <p>{distance > 75 ? "You won!" : "Try again!"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};