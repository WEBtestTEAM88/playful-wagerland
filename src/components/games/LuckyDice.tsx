import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { playWinSound, playLoseSound, playSpinSound } from "@/utils/sounds";

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export const LuckyDice = () => {
  const { user, updateBalance } = useUser();
  const [dice, setDice] = useState([0, 0, 0]);
  const [isRolling, setIsRolling] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const bet = 15;

  const roll = () => {
    if (!user) return;
    if (bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    setIsRolling(true);
    updateBalance(-bet);
    playSpinSound();

    const rollInterval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6),
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      const finalDice = [
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6),
      ];
      setDice(finalDice);
      setIsRolling(false);

      // Win conditions: three of a kind or straight
      const isThreeOfAKind = finalDice[0] === finalDice[1] && finalDice[1] === finalDice[2];
      const sorted = [...finalDice].sort((a, b) => a - b);
      const isStraight = sorted[1] === sorted[0] + 1 && sorted[2] === sorted[1] + 1;

      if (isThreeOfAKind || isStraight) {
        const winnings = bet * (isThreeOfAKind ? 5 : 3);
        updateBalance(winnings);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        playWinSound();
        toast({
          title: "Winner!",
          description: `You won $${winnings}!`,
        });
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        playLoseSound();
      }
    }, 2000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Lucky Dice</h2>
        <p className="text-sm text-gray-400">Get three of a kind or a straight to win!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 p-6 bg-casino-black rounded-lg border border-casino-gold/30">
        {dice.map((value, index) => {
          const DiceIcon = DICE_ICONS[value];
          return (
            <div
              key={index}
              className={`w-20 h-20 flex items-center justify-center bg-casino-black/50 rounded-lg border-2 border-casino-gold/20 ${
                isRolling ? "animate-bounce" : ""
              }`}
            >
              <DiceIcon className="w-12 h-12 text-casino-gold" />
            </div>
          );
        })}
      </div>

      <Button
        onClick={roll}
        disabled={isRolling || !user}
        className={`w-full ${
          isRolling
            ? "bg-casino-gold/50"
            : "bg-casino-gold hover:bg-casino-gold/90"
        } text-casino-black`}
      >
        {isRolling ? "Rolling..." : `Roll ($${bet})`}
      </Button>

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};