import { FC } from 'react';
import { Diamond, Skull, Battery } from 'lucide-react';

interface CrystalMazeGridProps {
  grid: Array<Array<string>>;
  revealed: Array<Array<boolean>>;
  playerPos: { x: number; y: number };
  size: number;
}

export const CrystalMazeGrid: FC<CrystalMazeGridProps> = ({
  grid,
  revealed,
  playerPos,
  size,
}) => {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={`w-10 h-10 flex items-center justify-center rounded ${
              playerPos.x === x && playerPos.y === y
                ? "bg-blue-500"
                : revealed[y][x]
                ? "bg-casino-black/80"
                : "bg-casino-black/30"
            }`}
          >
            {revealed[y][x] && cell === "crystal" && (
              <Diamond className="text-yellow-500" size={20} />
            )}
            {revealed[y][x] && cell === "trap" && (
              <Skull className="text-red-500" size={20} />
            )}
            {playerPos.x === x && playerPos.y === y && "🚀"}
          </div>
        ))
      )}
    </div>
  );
};