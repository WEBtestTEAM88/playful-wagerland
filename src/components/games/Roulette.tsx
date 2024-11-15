import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export const Roulette = () => {
  const { user, updateBalance } = useUser();
  const [bet, setBet] = useState(10);
  const [selectedNumber, setSelectedNumber] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

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

    // Simulate roulette spin
    setTimeout(() => {
      const result = Math.floor(Math.random() * 37);
      if (result === selectedNumber) {
        const winnings = bet * 35;
        updateBalance(winnings);
        toast({
          title: "Congratulations!",
          description: `You won ${winnings} coins!`,
        });
      }
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Roulette</h2>
        <p className="text-sm text-gray-400">
          Choose a number between 0 and 36
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <Input
            type="number"
            min={0}
            max={36}
            value={selectedNumber}
            onChange={(e) => setSelectedNumber(Number(e.target.value))}
            className="bg-casino-black/50 border-casino-gold/30 text-casino-white"
          />
          <Input
            type="number"
            min={1}
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="bg-casino-black/50 border-casino-gold/30 text-casino-white"
          />
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
      </div>

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: {user.balance} coins
        </div>
      )}
    </Card>
  );
};