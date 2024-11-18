import { FC } from 'react';

interface PlayingCard {
  suit: string;
  value: string;
  numericValue: number;
}

interface BlackjackCardProps {
  card: PlayingCard;
}

export const BlackjackCard: FC<BlackjackCardProps> = ({ card }) => {
  return (
    <div className="w-16 h-24 bg-white rounded-lg border-2 border-casino-gold/20 flex items-center justify-center text-xl">
      <span className={card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-black"}>
        {card.value}{card.suit}
      </span>
    </div>
  );
};