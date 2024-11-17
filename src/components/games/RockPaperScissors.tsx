import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Scissors, Hand, Square } from "lucide-react";

type Choice = "rock" | "paper" | "scissors";

export const RockPaperScissors = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [bet, setBet] = useState(10);
  const [result, setResult] = useState<string | null>(null);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  const choices: Choice[] = ["rock", "paper", "scissors"];

  const getIcon = (choice: Choice) => {
    switch (choice) {
      case "rock": return <Square className="w-8 h-8" />;
      case "paper": return <Hand className="w-8 h-8" />;
      case "scissors": return <Scissors className="w-8 h-8" />;
    }
  };

  const play = (choice: Choice) => {
    if (!user) return;
    if (bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    setIsPlaying(true);
    setPlayerChoice(choice);
    
    // Only deduct balance if it's not a draw
    updateBalance(-bet);

    // Simulate computer thinking
    setTimeout(() => {
      const computerChoice = choices[Math.floor(Math.random() * 3)];
      setComputerChoice(computerChoice);

      // Determine winner
      if (choice === computerChoice) {
        setResult("Draw!");
        updateBalance(bet); // Return bet on draw
        setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
      } else if (
        (choice === "rock" && computerChoice === "scissors") ||
        (choice === "paper" && computerChoice === "rock") ||
        (choice === "scissors" && computerChoice === "paper")
      ) {
        setResult("You win!");
        const winnings = bet * 2;
        updateBalance(winnings);
        updateUserStats("rockPaperScissors", true, winnings - bet);
        setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
        toast({
          title: "Congratulations!",
          description: `You won $${winnings - bet}!`,
        });
      } else {
        setResult("You lose!");
        updateUserStats("rockPaperScissors", false, bet);
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      }
      setIsPlaying(false);
    }, 1000);
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Rock Paper Scissors</h2>
        <p className="text-sm text-gray-400">Choose your weapon!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-casino-green">Wins: {stats.wins}</span>
          <span className="text-casino-red">Losses: {stats.losses}</span>
          <span className="text-casino-gold">Draws: {stats.draws}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        {choices.map((choice) => (
          <Button
            key={choice}
            onClick={() => play(choice)}
            disabled={isPlaying || !user}
            className="bg-casino-gold hover:bg-casino-gold/90 text-casino-black p-6"
          >
            {getIcon(choice)}
          </Button>
        ))}
      </div>

      {(playerChoice || computerChoice) && (
        <div className="flex justify-center items-center gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">You</p>
            {playerChoice && (
              <div className="text-casino-gold">{getIcon(playerChoice)}</div>
            )}
          </div>
          <div className="text-2xl text-casino-gold">VS</div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Computer</p>
            {computerChoice && (
              <div className="text-casino-gold">{getIcon(computerChoice)}</div>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="text-center text-xl font-bold text-casino-gold">
          {result}
        </div>
      )}

      <div>
        <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
        <Input
          type="number"
          min={1}
          value={bet}
          onChange={(e) => setBet(Number(e.target.value))}
          className="bg-casino-black/50 border-casino-gold/30 text-casino-white"
        />
      </div>

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: {user.balance} coins
        </div>
      )}
    </Card>
  );
};
