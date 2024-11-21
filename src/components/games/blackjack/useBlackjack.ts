import { useState } from "react";
import { toast } from "sonner";

type PlayingCard = {
  suit: string;
  value: string;
  numericValue: number;
};

const SUITS = ["♠", "♣", "♥", "♦"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

interface UseBlackjackProps {
  onWin: (amount: number) => void;
  onLose: (amount: number) => void;
  onPush: (amount: number) => void;
}

export const useBlackjack = ({ onWin, onLose, onPush }: UseBlackjackProps) => {
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [gameState, setGameState] = useState<"betting" | "playing" | "dealerTurn" | "finished">("betting");
  const [bet, setBet] = useState(10);

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
    const newDeck = createDeck();
    const playerCards = [newDeck[0], newDeck[1]];
    const dealerCards = [newDeck[2]];
    
    setDeck(newDeck.slice(3));
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setGameState("playing");
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
      onWin(winnings);
    } else if (result === "push") {
      onPush(bet);
    } else {
      onLose(bet);
    }
  };

  const resetGame = () => {
    setGameState("betting");
    setPlayerHand([]);
    setDealerHand([]);
    setDeck([]);
  };

  return {
    playerHand,
    dealerHand,
    gameState,
    bet,
    setBet,
    dealCards,
    hit,
    stand,
    resetGame,
    calculateHand,
  };
};