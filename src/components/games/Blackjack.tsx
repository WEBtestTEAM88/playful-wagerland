import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { playWinSound, playLoseSound } from "@/utils/sounds";

type PlayingCard = {
  suit: string;
  value: string;
  numericValue: number;
};

const SUITS = ["♠", "♣", "♥", "♦"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export const Blackjack = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [gameState, setGameState] = useState<"betting" | "playing" | "dealerTurn" | "finished">("betting");
  const [bet, setBet] = useState(10);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const createDeck = () => {
    const newDeck: PlayingCard[] = [];
    for (const suit of SUITS) {
      for (const value of VALUES) {
        const numericValue = value === "A" ? 11 : ["J", "Q", "K"].includes(value) ? 10 : parseInt(value);
        newDeck.push({ suit, value, numericValue });
      }
    }
    return shuffle(newDeck);
  };

  const shuffle = (array: PlayingCard[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const calculateHand = (hand: PlayingCard[]) => {
    let sum = hand.reduce((total, card) => total + card.numericValue, 0);
    const aces = hand.filter(card => card.value === "A").length;
    
    for (let i = 0; i < aces; i++) {
      if (sum > 21) sum -= 10;
    }
    
    return sum;
  };

  const dealCards = () => {
    if (!user || bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    const newDeck = createDeck();
    const playerCards = [newDeck[0], newDeck[1]];
    const dealerCards = [newDeck[2]];
    
    setDeck(newDeck.slice(3));
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setGameState("playing");
    updateBalance(-bet);
  };

  const hit = () => {
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(deck.slice(1));

    if (calculateHand(newHand) > 21) {
      endGame("bust");
    }
  };

  const stand = async () => {
    setGameState("dealerTurn");
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];

    while (calculateHand(currentDealerHand) < 17) {
      const newCard = currentDeck[0];
      currentDealerHand.push(newCard);
      currentDeck = currentDeck.slice(1);
    }

    setDealerHand(currentDealerHand);
    setDeck(currentDeck);

    const dealerScore = calculateHand(currentDealerHand);
    const playerScore = calculateHand(playerHand);

    if (dealerScore > 21 || playerScore > dealerScore) {
      endGame("win");
    } else if (dealerScore > playerScore) {
      endGame("lose");
    } else {
      endGame("push");
    }
  };

  const endGame = (result: "win" | "lose" | "push" | "bust") => {
    setGameState("finished");

    if (result === "win") {
      const winnings = bet * 2;
      updateBalance(winnings);
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
      updateUserStats("blackjack", true, winnings - bet);
      playWinSound();
      toast({
        title: "You won!",
        description: `You won $${winnings - bet}!`,
      });
    } else if (result === "push") {
      updateBalance(bet);
      toast({
        title: "Push",
        description: "Your bet has been returned.",
      });
    } else {
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      updateUserStats("blackjack", false, bet);
      playLoseSound();
      toast({
        title: result === "bust" ? "Bust!" : "Dealer wins!",
        description: "Better luck next time!",
        variant: "destructive",
      });
    }
  };

  const resetGame = () => {
    setGameState("betting");
    setPlayerHand([]);
    setDealerHand([]);
    setDeck([]);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Blackjack</h2>
        <p className="text-sm text-gray-400">Try to beat the dealer!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      {gameState !== "betting" && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Dealer's Hand ({calculateHand(dealerHand)})</p>
            <div className="flex justify-center gap-2">
              {dealerHand.map((card, index) => (
                <div key={index} className="w-16 h-24 bg-white rounded-lg border-2 border-casino-gold/20 flex items-center justify-center text-xl">
                  <span className={card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-black"}>
                    {card.value}{card.suit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Your Hand ({calculateHand(playerHand)})</p>
            <div className="flex justify-center gap-2">
              {playerHand.map((card, index) => (
                <div key={index} className="w-16 h-24 bg-white rounded-lg border-2 border-casino-gold/20 flex items-center justify-center text-xl">
                  <span className={card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-black"}>
                    {card.value}{card.suit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {gameState === "betting" && (
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
              onClick={dealCards}
              disabled={!user || bet > (user?.balance || 0)}
              className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
            >
              Deal Cards
            </Button>
          </>
        )}

        {gameState === "playing" && (
          <div className="flex gap-2">
            <Button
              onClick={hit}
              className="flex-1 bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
            >
              Hit
            </Button>
            <Button
              onClick={stand}
              className="flex-1 bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
            >
              Stand
            </Button>
          </div>
        )}

        {gameState === "finished" && (
          <Button
            onClick={resetGame}
            className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
          >
            Play Again
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