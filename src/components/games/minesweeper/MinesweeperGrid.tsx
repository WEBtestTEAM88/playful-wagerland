import React from "react";

type CellContent = number | "mine" | "empty";

interface MinesweeperGridProps {
  grid: CellContent[][];
  revealed: boolean[][];
  flagged: boolean[][];
  isPlaying: boolean;
  size: number;
  onCellClick: (y: number, x: number) => void;
  onCellRightClick: (e: React.MouseEvent, y: number, x: number) => void;
}

export const MinesweeperGrid: React.FC<MinesweeperGridProps> = ({
  grid,
  revealed,
  flagged,
  isPlaying,
  size,
  onCellClick,
  onCellRightClick,
}) => {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <button
            key={`${y}-${x}`}
            onClick={() => onCellClick(y, x)}
            onContextMenu={(e) => onCellRightClick(e, y, x)}
            disabled={!isPlaying || revealed[y][x]}
            className={`aspect-square rounded-sm flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 ${
              revealed[y][x]
                ? cell === "mine"
                  ? "bg-casino-red text-white"
                  : "bg-casino-gold text-black"
                : flagged[y][x]
                ? "bg-casino-green text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {revealed[y][x] && cell !== "mine" && cell !== "empty" && cell}
            {revealed[y][x] && cell === "mine" && "💣"}
            {!revealed[y][x] && flagged[y][x] && "🚩"}
          </button>
        ))
      )}
    </div>
  );
};