import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Heart, Club, Diamond, Spade } from "lucide-react";
import { playWinSound, playLoseSound, playSpinSound } from "@/utils/sounds";

const CARDS = [
  { icon: Heart, name: "heart", color: "text-red-500" },
  { icon: Club, name: "club", color: "text-white" },
  { icon: Diamond, name: "diamond", color: "text-red-500" },
  { icon: Spade, name: "spade", color: "text-white" },
];

export const CardFlip = () => {
  const { user, updateBalance } = useUser();
  const [cards, setCards] = useState(Array(3).fill(CARDS[0]));
  const [isFlipping, setIsFlipping] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const bet = 20;

  const flip = () => {
    if (!user) return;
    if (bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    setIsFlipping(true);
    updateBalance(-bet);
    playSpinSound();

    const flipInterval = setInterval(() => {
      setCards(
        Array(3)
          .fill(null)
          .map(() => CARDS[Math.floor(Math.random() * CARDS.length)])
      );
    }, 100);

    setTimeout(() => {
      clearInterval(flipInterval);
      const finalCards = Array(3)
        .fill(null)
        .map(() => CARDS[Math.floor(Math.random() * CARDS.length)]);
      setCards(finalCards);
      setIsFlipping(false);

      const uniqueSuits = new Set(finalCards.map(card => card.name));
      if (uniqueSuits.size === 1 || uniqueSuits.size === 3) {
        const winnings = bet * (uniqueSuits.size === 1 ? 4 : 2);
        updateBalance(winnings); // Only add winnings, bet was already deducted
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        playWinSound();
        toast({
          title: "Winner!",
          description: `You won $${winnings - bet}!`, // Show net winnings
        });
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        playLoseSound();
        toast({
          title: "Try again!",
          description: "Better luck next time!",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Card Flip</h2>
        <p className="text-sm text-gray-400">Match all suits or get all different suits to win!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 p-6 bg-casino-black rounded-lg border border-casino-gold/30">
        {cards.map((card, index) => {
          const CardIcon = card.icon;
          return (
            <div
              key={index}
              className={`w-20 h-20 flex items-center justify-center bg-casino-black/50 rounded-lg border-2 border-casino-gold/20 ${
                isFlipping ? "animate-flip" : ""
              }`}
            >
              <CardIcon className={`w-12 h-12 ${card.color}`} />
            </div>
          );
        })}
      </div>

      <Button
        onClick={flip}
        disabled={isFlipping || !user}
        className={`w-full ${
          isFlipping
            ? "bg-casino-gold/50"
            : "bg-casino-gold hover:bg-casino-gold/90"
        } text-casino-black`}
      >
        {isFlipping ? "Flipping..." : `Flip ($${bet})`}
      </Button>

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};