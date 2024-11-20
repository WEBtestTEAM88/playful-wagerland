import { Bomb, Flag } from "lucide-react";

interface MinesweeperGridProps {
  grid: Array<"mine" | "empty" | number>;
  revealed: boolean[][];
  flagged: boolean[][];
  isPlaying: boolean;
  size: number;
  onCellClick: (y: number, x: number) => void;
  onCellRightClick: (e: React.MouseEvent, y: number, x: number) => void;
}

export const MinesweeperGrid = ({
  grid,
  revealed,
  flagged,
  isPlaying,
  size,
  onCellClick,
  onCellRightClick,
}: MinesweeperGridProps) => {
  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
      }}
    >
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <button
            key={`${y}-${x}`}
            onClick={() => onCellClick(y, x)}
            onContextMenu={(e) => onCellRightClick(e, y, x)}
            className={`aspect-square rounded-sm flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              revealed[y]?.[x]
                ? cell === "mine"
                  ? "bg-casino-red"
                  : "bg-casino-gold/20"
                : flagged[y]?.[x]
                ? "bg-casino-green"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            disabled={!isPlaying || revealed[y]?.[x]}
          >
            {revealed[y]?.[x] ? (
              cell === "mine" ? (
                <Bomb className="w-4 h-4" />
              ) : cell === 0 ? (
                ""
              ) : (
                cell
              )
            ) : flagged[y]?.[x] ? (
              <Flag className="w-4 h-4" />
            ) : null}
          </button>
        ))
      )}
    </div>
  );
};