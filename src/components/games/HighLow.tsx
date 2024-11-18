import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { playWinSound, playLoseSound } from "@/utils/sounds";

const CARDS = [
  "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"
];

export const HighLow = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [currentCard, setCurrentCard] = useState<string | null>(null);
  const [nextCard, setNextCard] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bet, setBet] = useState(10);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [streak, setStreak] = useState(0);

  const getRandomCard = () => CARDS[Math.floor(Math.random() * CARDS.length)];

  const startGame = () => {
    if (!user) return;
    if (bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    updateBalance(-bet);
    setCurrentCard(getRandomCard());
    setNextCard(null);
    setIsPlaying(true);
  };

  const getCardValue = (card: string) => CARDS.indexOf(card);

  const makeGuess = (higher: boolean) => {
    const nextCardValue = getRandomCard();
    setNextCard(nextCardValue);

    const currentValue = getCardValue(currentCard!);
    const nextValue = getCardValue(nextCardValue);
    const correct = higher ? nextValue > currentValue : nextValue < currentValue;

    if (correct) {
      const multiplier = 1 + (streak * 0.5);
      const winnings = bet * multiplier;
      updateBalance(winnings);
      setStreak(prev => prev + 1);
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
      updateUserStats("highLow", true, winnings);
      playWinSound();
      toast({
        title: "Correct!",
        description: `You won $${winnings}! Streak: ${streak + 1}`,
      });
    } else {
      setStreak(0);
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      updateUserStats("highLow", false, bet);
      playLoseSound();
      toast({
        title: "Wrong!",
        description: "Better luck next time!",
        variant: "destructive",
      });
    }

    setIsPlaying(false);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">High Low</h2>
        <p className="text-sm text-gray-400">Guess if the next card will be higher or lower!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
          {streak > 0 && (
            <span className="text-yellow-500">Streak: {streak}</span>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center gap-8">
        {currentCard && (
          <div className="w-32 h-48 bg-white rounded-lg border-2 border-casino-gold flex items-center justify-center text-4xl">
            {currentCard}
          </div>
        )}
        {nextCard && (
          <div className="w-32 h-48 bg-white rounded-lg border-2 border-casino-gold flex items-center justify-center text-4xl">
            {nextCard}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {!isPlaying ? (
          <>
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
            <Button
              onClick={startGame}
              disabled={!user || bet > (user?.balance || 0)}
              className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
            >
              Start Game
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => makeGuess(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              Higher
            </Button>
            <Button
              onClick={() => makeGuess(false)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              Lower
            </Button>
          </div>
        )}
      </div>

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};