import { FC } from 'react';
import { BlackjackCard } from './BlackjackCard';

interface PlayingCard {
  suit: string;
  value: string;
  numericValue: number;
}

interface BlackjackHandProps {
  hand: PlayingCard[];
  label: string;
  score: number;
}

export const BlackjackHand: FC<BlackjackHandProps> = ({ hand, label, score }) => {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-400 mb-2">{label} ({score})</p>
      <div className="flex justify-center gap-2">
        {hand.map((card, index) => (
          <BlackjackCard key={index} card={card} />
        ))}
      </div>
    </div>
  );
};