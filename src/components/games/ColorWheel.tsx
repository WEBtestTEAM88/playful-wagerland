import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";

const COLORS = [
  { name: "red", class: "bg-red-500", multiplier: 2 },
  { name: "black", class: "bg-black", multiplier: 2 },
  { name: "green", class: "bg-green-500", multiplier: 14 },
];

export const ColorWheel = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [bet, setBet] = useState(10);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [wheelRotation, setWheelRotation] = useState(0);

  const spin = () => {
    if (!user || !selectedColor) return;
    if (bet > user.balance) {
      toast.error("Insufficient balance!");
      return;
    }

    setIsSpinning(true);
    updateBalance(-bet);

    // Random rotation between 5-10 full spins plus random position
    const spins = 5 + Math.floor(Math.random() * 5);
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = (spins * 360) + extraDegrees;
    setWheelRotation(totalRotation);

    setTimeout(() => {
      // Determine winning color based on final position
      const normalizedDegrees = extraDegrees % 360;
      let resultColor;
      if (normalizedDegrees >= 345 || normalizedDegrees < 15) {
        resultColor = "green";
      } else {
        resultColor = normalizedDegrees % 30 < 15 ? "red" : "black";
      }

      const won = resultColor === selectedColor;
      if (won) {
        const multiplier = COLORS.find(c => c.name === selectedColor)?.multiplier || 2;
        const winnings = bet * multiplier;
        updateBalance(winnings);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        playWinSound();
        toast.success(`You won $${winnings}!`);
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        playLoseSound();
        toast.error("Better luck next time!");
      }

      updateUserStats(won);
      setIsSpinning(false);
      setSelectedColor(null);
    }, 3000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Color Wheel</h2>
        <p className="text-sm text-gray-400">
          Pick a color and spin! Green pays 14x, Red/Black pay 2x
        </p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="relative w-48 h-48 mx-auto">
        <div
          className="absolute inset-0 rounded-full border-4 border-casino-gold overflow-hidden transition-transform duration-[3000ms]"
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-1/2 h-1/2 origin-bottom-right -rotate-[${
                i * 15
              }deg] ${
                i === 0 ? "bg-green-500" : i % 2 === 0 ? "bg-red-500" : "bg-black"
              }`}
              style={{
                transformOrigin: "0% 100%",
                transform: `rotate(${i * 15}deg)`,
              }}
            />
          ))}
        </div>
        <div className="absolute top-0 left-1/2 -ml-2 w-4 h-4 bg-casino-gold transform -translate-y-1/2 rotate-45" />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
          <input
            type="number"
            min={1}
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {COLORS.map(color => (
            <Button
              key={color.name}
              onClick={() => !isSpinning && setSelectedColor(color.name)}
              className={`${color.class} ${
                selectedColor === color.name ? "ring-2 ring-casino-gold" : ""
              }`}
              disabled={isSpinning}
            >
              {color.name}
            </Button>
          ))}
        </div>

        <Button
          onClick={spin}
          disabled={isSpinning || !user || !selectedColor}
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-black"
        >
          {isSpinning ? "Spinning..." : "Spin"}
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