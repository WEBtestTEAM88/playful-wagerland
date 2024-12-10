import { FC } from 'react';
import { Button } from "@/components/ui/button";

interface CrystalMazeControlsProps {
  onMove: (dx: number, dy: number) => void;
  isPlaying: boolean;
}

export const CrystalMazeControls: FC<CrystalMazeControlsProps> = ({
  onMove,
  isPlaying,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        onClick={() => onMove(0, -1)}
        disabled={!isPlaying}
        className="col-start-2"
      >
        ↑
      </Button>
      <Button
        onClick={() => onMove(-1, 0)}
        disabled={!isPlaying}
        className="col-start-1"
      >
        ←
      </Button>
      <Button
        onClick={() => onMove(0, 1)}
        disabled={!isPlaying}
        className="col-start-2"
      >
        ↓
      </Button>
      <Button
        onClick={() => onMove(1, 0)}
        disabled={!isPlaying}
        className="col-start-3"
      >
        →
      </Button>
    </div>
  );
};