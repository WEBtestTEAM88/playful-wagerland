import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { playWinSound, playLoseSound } from "@/utils/sounds";
import { BlackjackHand } from "./BlackjackHand";
import { BlackjackControls } from "./BlackjackControls";
import { useBlackjack } from "./useBlackjack";

export const BlackjackGame = () => {
  const { user, updateBalance, updateUserStats } = useUser();
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const {
    playerHand,
    dealerHand,
    gameState,
    bet,
    setBet,
    dealCards,
    hit,
    stand,
    resetGame,
    calculateHand,
  } = useBlackjack({

    onWin: (amount) => {
      playWinSound();
      updateBalance(amount);
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
      updateUserStats(true);
      toast.success(`You won $${amount - bet}!`);
    },
    onLose: (amount) => {
      playLoseSound();
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      updateUserStats(false);
      toast.error("Better luck next time!");
    },

    onPush: (amount) => {
      updateBalance(amount);
      toast.info("Push - Your bet has been returned.");
    }
  });

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Blackjack</h2>
        <p className="text-sm text-gray-400">Try to beat the dealer!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      {gameState !== "betting" && (
        <div className="space-y-4">
          <BlackjackHand
            hand={dealerHand}
            label="Dealer's Hand"
            score={calculateHand(dealerHand)}
          />
          <BlackjackHand
            hand={playerHand}
            label="Your Hand"
            score={calculateHand(playerHand)}
          />
        </div>
      )}

      <BlackjackControls
        gameState={gameState}
        bet={bet}
        onBetChange={setBet}
        onDeal={dealCards}
        onHit={hit}
        onStand={stand}
        onReset={resetGame}
        userBalance={user?.balance || 0}
      />

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};
