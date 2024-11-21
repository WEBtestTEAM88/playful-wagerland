import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { playWinSound, playLoseSound } from "@/utils/sounds";

type PokerCard = {
  suit: string;
  value: string;
  held: boolean;
  numericValue: number;  // Add this line to include numericValue
};

const SUITS = ["♠", "♣", "♥", "♦"];
const VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export const VideoPoker = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [cards, setCards] = useState<PokerCard[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canDraw, setCanDraw] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const createDeck = () => {
    const deck: PokerCard[] = [];
    for (const suit of SUITS) {
      for (const value of VALUES) {
        const numericValue = value === "A" ? 11 : ["J", "Q", "K"].includes(value) ? 10 : parseInt(value);
        deck.push({ suit, value, held: false, numericValue });
      }
    }
    return shuffle(deck);
  };

  const shuffle = (deck: PokerCard[]) => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  const deal = () => {
    if (!user) return;
    if (bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    const deck = createDeck();
    setCards(deck.slice(0, 5).map(card => ({ ...card, held: false })));
    setIsPlaying(true);
    setCanDraw(true);
    updateBalance(-bet);
  };

  const toggleHold = (index: number) => {
    if (!canDraw) return;
    setCards(prev => prev.map((card, i) => 
      i === index ? { ...card, held: !card.held } : card
    ));
  };

  const draw = () => {
    const deck = createDeck();
    let newCards = [...cards];
    let deckIndex = 0;

    // Replace non-held cards
    for (let i = 0; i < 5; i++) {
      if (!newCards[i].held) {
        while (deckIndex < deck.length) {
          const newCard = deck[deckIndex];
          if (!newCards.some(c => c.suit === newCard.suit && c.value === newCard.value)) {
            newCards[i] = { ...newCard, held: false };
            deckIndex++;
            break;
          }
          deckIndex++;
        }
      }
    }

    setCards(newCards);
    setCanDraw(false);

    // Evaluate hand and pay out
    const handRank = evaluateHand(newCards);
    let winnings = 0;

    switch (handRank) {
      case "Royal Flush":
        winnings = bet * 800;
        break;
      case "Straight Flush":
        winnings = bet * 50;
        break;
      case "Four of a Kind":
        winnings = bet * 25;
        break;
      case "Full House":
        winnings = bet * 9;
        break;
      case "Flush":
        winnings = bet * 6;
        break;
      case "Straight":
        winnings = bet * 4;
        break;
      case "Three of a Kind":
        winnings = bet * 3;
        break;
      case "Two Pair":
        winnings = bet * 2;
        break;
      case "Jacks or Better":
        winnings = bet;
        break;
    }

    if (winnings > 0) {
      updateBalance(winnings);
      updateUserStats(true);
      playWinSound();
      toast({
        title: handRank + "!",
        description: `You won $${winnings}!`,
      });
    } else {
      updateUserStats(false);
      playLoseSound();
      toast({
        title: "No Win",
        description: "Better luck next time!",
        variant: "destructive",
      });
    }

    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
  };

  const evaluateHand = (hand: PokerCard[]): string => {
    const values = hand.map(card => VALUES.indexOf(card.value));
    const suits = hand.map(card => card.suit);
    const valueCounts = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });

    const isFlush = suits.every(suit => suit === suits[0]);
    const isStraight = values.sort((a, b) => a - b).every((val, i, arr) => 
      i === 0 || val === arr[i - 1] + 1
    );

    if (isFlush && isStraight && Math.max(...values) === 12) return "Royal Flush";
    if (isFlush && isStraight) return "Straight Flush";
    if (Object.values(valueCounts).includes(4)) return "Four of a Kind";
    if (Object.values(valueCounts).includes(3) && Object.values(valueCounts).includes(2)) return "Full House";
    if (isFlush) return "Flush";
    if (isStraight) return "Straight";
    if (Object.values(valueCounts).includes(3)) return "Three of a Kind";
    if (Object.values(valueCounts).filter(count => count === 2).length === 2) return "Two Pair";
    if (Object.entries(valueCounts).some(([value, count]) => 
      count === 2 && (VALUES[parseInt(value)] === "J" || VALUES[parseInt(value)] === "Q" || 
                      VALUES[parseInt(value)] === "K" || VALUES[parseInt(value)] === "A")
    )) return "Jacks or Better";
    return "No Win";
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Video Poker</h2>
        <p className="text-sm text-gray-400">Hold cards and draw for the best hand!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => toggleHold(index)}
            className={`w-16 h-24 bg-white rounded-lg border-2 ${
              card.held ? "border-casino-gold" : "border-gray-300"
            } flex flex-col items-center justify-center cursor-pointer relative`}
          >
            <span className={card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-black"}>
              {card.value}
              {card.suit}
            </span>
            {card.held && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-casino-gold text-black px-2 rounded">
                HELD
              </div>
            )}
          </div>
        ))}
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

        {!isPlaying ? (
          <Button
            onClick={deal}
            disabled={!user || bet > (user?.balance || 0)}
            className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
          >
            Deal
          </Button>
        ) : (
          <Button
            onClick={draw}
            disabled={!canDraw}
            className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
          >
            Draw
          </Button>
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
