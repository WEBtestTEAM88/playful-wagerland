import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { useQuery } from "@tanstack/react-query";

const fetchQuestions = async () => {
  const response = await fetch("https://opentdb.com/api.php?amount=5&type=boolean");
  const data = await response.json();
  return data.results.map((q: any) => ({
    ...q,
    question: decodeHTMLEntities(q.question)
  }));
};

// Helper function to decode HTML entities
const decodeHTMLEntities = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

export const Trivia = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<"betting" | "playing" | "finished">("betting");
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const { data: questions, isLoading, refetch } = useQuery({
    queryKey: ["triviaQuestions"],
    queryFn: fetchQuestions,
    enabled: false
  });

  const startGame = async () => {
    if (!user || bet > user.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      });
      return;
    }

    updateBalance(-bet);
    await refetch();
    setGameState("playing");
    setCurrentQuestion(0);
  };

  const handleAnswer = (answer: string) => {
    if (!questions) return;

    const isCorrect = answer === questions[currentQuestion].correct_answer;
    
    if (isCorrect) {
      const winnings = bet * 2;
      updateBalance(winnings);
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
      updateUserStats("trivia", true, winnings - bet);
      playWinSound();
      toast({
        title: "Correct!",
        description: `You won $${winnings - bet}!`,
      });
    } else {
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      updateUserStats("trivia", false, bet);
      playLoseSound();
      toast({
        title: "Wrong!",
        description: "Better luck next time!",
        variant: "destructive",
      });
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setGameState("finished");
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Trivia Challenge</h2>
        <p className="text-sm text-gray-400">Test your knowledge!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      {gameState === "betting" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Bet Amount</label>
            <input
              type="number"
              min={1}
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              className="w-full bg-casino-black/50 border-casino-gold/30 text-casino-white rounded-md p-2"
            />
          </div>
          <Button
            onClick={startGame}
            disabled={!user || bet > (user?.balance || 0)}
            className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
          >
            Start Game
          </Button>
        </div>
      )}

      {gameState === "playing" && questions && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Question {currentQuestion + 1} of {questions.length}</p>
            <p className="text-lg text-casino-white mb-4">{questions[currentQuestion].question}</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => handleAnswer("True")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                True
              </Button>
              <Button
                onClick={() => handleAnswer("False")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                False
              </Button>
            </div>
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <Button
          onClick={() => setGameState("betting")}
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
        >
          Play Again
        </Button>
      )}

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};