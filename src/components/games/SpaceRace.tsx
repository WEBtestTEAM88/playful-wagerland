import { Card } from "@/components/ui/card";
import { GameArea } from "./space-race/GameArea";
import { Controls } from "./space-race/Controls";
import { useSpaceRace } from "./space-race/useSpaceRace";

export const SpaceRace = () => {
  const {
    bet,
    setBet,
    isRacing,
    progress,
    position,
    obstacles,
    stats,
    moveRocket,
    startRace,
    user
  } = useSpaceRace();

  return (
    <Card className="p-6 space-y-6 bg-casino-black/90 border-casino-gold/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-casino-gold mb-2">Space Race</h2>
        <p className="text-sm text-gray-400">
          Navigate through the asteroid field using arrow keys or buttons! Reach the finish line for 3x your bet!
        </p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-green-500">Wins: {stats.wins}</span>
          <span className="text-red-500">Losses: {stats.losses}</span>
        </div>
      </div>

      <GameArea
        progress={progress}
        position={position}
        obstacles={obstacles}
        isRacing={isRacing}
      />

      <Controls
        isRacing={isRacing}
        onMove={moveRocket}
        bet={bet}
        onBetChange={setBet}
        onStart={startRace}
        disabled={isRacing || !user || bet > (user?.balance || 0)}
      />

      {user && (
        <div className="text-center text-sm text-gray-400">
          Balance: ${user.balance}
        </div>
      )}
    </Card>
  );
};