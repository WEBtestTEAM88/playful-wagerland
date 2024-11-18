import { FC } from 'react';
import { Button } from "@/components/ui/button";

interface BlackjackControlsProps {
  gameState: "betting" | "playing" | "dealerTurn" | "finished";
  onDeal: () => void;
  onHit: () => void;
  onStand: () => void;
  onPlayAgain: () => void;
  bet: number;
  onBetChange: (value: number) => void;
  isDisabled: boolean;
}

export const BlackjackControls: FC<BlackjackControlsProps> = ({
  gameState,
  onDeal,
  onHit,
  onStand,
  onPlayAgain,
  bet,
  onBetChange,
  isDisabled
}) => {
  return (
    <div className="space-y-4">
      {gameState === "betting" && (
        <>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
            <input
              type="number"
              min={1}
              value={bet}
              onChange={(e) => onBetChange(Number(e.target.value))}
              className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
            />
          </div>
          <Button
            onClick={onDeal}
            disabled={isDisabled}
            className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
          >
            Deal Cards
          </Button>
        </>
      )}

      {gameState === "playing" && (
        <div className="flex gap-2">
          <Button
            onClick={onHit}
            className="flex-1 bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
          >
            Hit
          </Button>
          <Button
            onClick={onStand}
            className="flex-1 bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
          >
            Stand
          </Button>
        </div>
      )}

      {gameState === "finished" && (
        <Button
          onClick={onPlayAgain}
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
        >
          Play Again
        </Button>
      )}
    </div>
  );
};