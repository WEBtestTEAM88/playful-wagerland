import { Button } from "@/components/ui/button";

interface MinesweeperControlsProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  difficulty: "easy" | "medium" | "hard";
  setDifficulty: (difficulty: "easy" | "medium" | "hard") => void;
  isPlaying: boolean;
  userBalance: number;
  onStartGame: () => void;
}

export const MinesweeperControls = ({
  betAmount,
  setBetAmount,
  difficulty,
  setDifficulty,
  isPlaying,
  userBalance,
  onStartGame,
}: MinesweeperControlsProps) => {
  return (
    <div className="flex flex-col space-y-4 w-full px-2 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
            disabled={isPlaying || betAmount <= 10}
            className="bg-casino-red w-12 h-10"
          >
            -10
          </Button>
          <span className="text-casino-gold px-4 min-w-[100px] text-center">
            Bet: ${betAmount}
          </span>
          <Button
            onClick={() => setBetAmount(betAmount + 10)}
            disabled={isPlaying || userBalance < betAmount + 10}
            className="bg-casino-green w-12 h-10"
          >
            +10
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setDifficulty("easy")}
            disabled={isPlaying}
            className={`w-20 h-10 ${
              difficulty === "easy" ? "bg-casino-gold" : "bg-gray-700"
            }`}
          >
            Easy
          </Button>
          <Button
            onClick={() => setDifficulty("medium")}
            disabled={isPlaying}
            className={`w-20 h-10 ${
              difficulty === "medium" ? "bg-casino-gold" : "bg-gray-700"
            }`}
          >
            Medium
          </Button>
          <Button
            onClick={() => setDifficulty("hard")}
            disabled={isPlaying}
            className={`w-20 h-10 ${
              difficulty === "hard" ? "bg-casino-gold" : "bg-gray-700"
            }`}
          >
            Hard
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={onStartGame}
            disabled={isPlaying}
            className="bg-casino-gold hover:bg-casino-gold/90 text-casino-black w-24 h-10"
          >
            Start Game
          </Button>
        </div>
      </div>
    </div>
  );
};