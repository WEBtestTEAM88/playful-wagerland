import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ControlsProps {
  isRacing: boolean;
  onMove: (direction: 'left' | 'right') => void;
  bet: number;
  onBetChange: (value: number) => void;
  onStart: () => void;
  disabled: boolean;
}

export const Controls = ({ isRacing, onMove, bet, onBetChange, onStart, disabled }: ControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => onMove('left')}
          disabled={!isRacing}
          className="bg-casino-gold/20 hover:bg-casino-gold/30"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Button
          onClick={() => onMove('right')}
          disabled={!isRacing}
          className="bg-casino-gold/20 hover:bg-casino-gold/30"
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
        <input
          type="number"
          min={1}
          value={bet}
          onChange={(e) => onBetChange(Math.max(1, Number(e.target.value)))}
          disabled={isRacing}
          className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
        />
      </div>

      <Button
        onClick={onStart}
        disabled={disabled}
        className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
      >
        {isRacing ? "Racing..." : "Start Race"}
      </Button>
    </div>
  );
};