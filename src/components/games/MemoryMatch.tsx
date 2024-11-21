import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";

const DIFFICULTY_SETTINGS = {
  easy: { pairs: 6, jackpot: 100 },
  medium: { pairs: 8, jackpot: 250 },
  hard: { pairs: 12, jackpot: 500 },
};

type Difficulty = keyof typeof DIFFICULTY_SETTINGS;

interface MemoryCard {
  id: number;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatch = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [betAmount, setBetAmount] = useState(10);
  const [moves, setMoves] = useState(0);

  const initializeGame = () => {
    if (!user || user.balance < betAmount) {
      toast.error("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    const { pairs } = DIFFICULTY_SETTINGS[difficulty];
    const values = Array(pairs).fill(0).map((_, i) => i + 1);
    const cardPairs = [...values, ...values];
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((value, id) => ({
        id,
        value,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setIsPlaying(true);
  };

  const handleCardClick = (cardId: number) => {
    if (!isPlaying || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    setFlippedCards([...flippedCards, cardId]);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves(moves + 1);
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard?.value === secondCard?.value) {
        const newCards = cards.map(c =>
          c.id === first || c.id === second ? { ...c, isMatched: true } : c
        );
        setCards(newCards);
        setFlippedCards([]);

        // Check for win
        if (newCards.every(c => c.isMatched)) {
          setIsPlaying(false);
          const { jackpot } = DIFFICULTY_SETTINGS[difficulty];
          const baseWin = jackpot;
          const movesBonus = Math.max(0, jackpot - (moves * 10));
          const totalWin = baseWin + movesBonus;
          
          updateBalance(totalWin);
          updateUserStats("memorymatch", true, totalWin - betAmount);
          playWinSound();
          toast.success(`You won $${totalWin}! (Bonus for fewer moves: $${movesBonus})`);
        }
      } else {
        setTimeout(() => {
          setCards(cards.map(c =>
            c.id === first || c.id === second ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards]);

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <CardHeader>
        <CardTitle className="text-center text-casino-gold">Memory Match</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
                disabled={isPlaying || betAmount <= 10}
                className="bg-casino-red w-12 h-10"
              >
                -10
              </Button>
              <span className="text-casino-gold px-4 min-w-[100px] text-center">
                Bet: ${betAmount}
              </span>
              <Button
                onClick={() => setBetAmount(betAmount + 10)}
                disabled={isPlaying || (user?.balance || 0) < betAmount + 10}
                className="bg-casino-green w-12 h-10"
              >
                +10
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setDifficulty("easy")}
                disabled={isPlaying}
                className={`w-24 h-10 ${
                  difficulty === "easy" ? "bg-casino-gold" : "bg-gray-700"
                }`}
              >
                Easy
              </Button>
              <Button
                onClick={() => setDifficulty("medium")}
                disabled={isPlaying}
                className={`w-24 h-10 ${
                  difficulty === "medium" ? "bg-casino-gold" : "bg-gray-700"
                }`}
              >
                Medium
              </Button>
              <Button
                onClick={() => setDifficulty("hard")}
                disabled={isPlaying}
                className={`w-24 h-10 ${
                  difficulty === "hard" ? "bg-casino-gold" : "bg-gray-700"
                }`}
              >
                Hard
              </Button>
            </div>
            </div>
            <div className="flex justify-center">
            <Button
              onClick={initializeGame}
              disabled={isPlaying}
              className="bg-casino-gold hover:bg-casino-gold/90 text-casino-black w-24 h-10 "
            >
              Start Game
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={!isPlaying || card.isFlipped || card.isMatched}
              className={`aspect-square rounded-md flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                card.isFlipped || card.isMatched
                  ? "bg-casino-gold text-black"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {(card.isFlipped || card.isMatched) && card.value}
            </button>
          ))}
        </div>
        {isPlaying && (
          <div className="text-center text-casino-gold">Moves: {moves}</div>
        )}
        {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
      </CardContent>
    </Card>
  );
};
