import { useUser } from "@/contexts/UserContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { SlotMachine } from "@/components/games/SlotMachine";
import { Roulette } from "@/components/games/Roulette";
import { CardFlip } from "@/components/games/CardFlip";
import { DiamondMine } from "@/components/games/DiamondMine";
import { LuckyDice } from "@/components/games/LuckyDice";
import { Blackjack } from "@/components/games/Blackjack";
import { WheelOfFortune } from "@/components/games/WheelOfFortune";
import { HighLow } from "@/components/games/HighLow";
import { RockPaperScissors } from "@/components/games/RockPaperScissors";
import { DoubleOrNothing } from "@/components/games/DoubleOrNothing";
import { Bingo } from "@/components/games/Bingo";
import { VideoPoker } from "@/components/games/VideoPoker";
import { Trivia } from "@/components/games/Trivia";
import { FishHunter } from "@/components/games/FishHunter";
import { HorseRacing } from "@/components/games/HorseRacing";
import { Button } from "@/components/ui/button";
import { ScratchCards } from "@/components/games/ScratchCards";
import { TreasureHunt } from "@/components/games/TreasureHunt";
import { Minesweeper } from "@/components/games/Minesweeper";
import { MemoryMatch } from "@/components/games/MemoryMatch";

const Index = () => {
  const { user, logout, declareBankruptcy } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-casino-black flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-casino-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-casino-gold animate-fade-in text-center sm:text-left">
            Welcome to the Casino
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-casino-gold text-center">
              Welcome, {user.username}! Balance: ${user.balance}
            </span>
            <div className="flex gap-2">
              <Button
                onClick={declareBankruptcy}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Bankruptcy
              </Button>
              <Button 
                onClick={logout}
                className="bg-casino-red hover:bg-casino-red/90 text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <SlotMachine />
<Roulette />
<WheelOfFortune />
<Blackjack />
<VideoPoker />
<CardFlip />
<LuckyDice />
<Bingo />
<HighLow />
<DiamondMine />
<RockPaperScissors />
<Trivia />
<FishHunter />
<TreasureHunt />
<Minesweeper />
<ScratchCards />
<HorseRacing />
<MemoryMatch />
<DoubleOrNothing />
        </div>
      </div>
    </div>
  );
};
/*
         <SlotMachine />
          <Roulette />
          <CardFlip />
          <DiamondMine />
          <LuckyDice />
          <Blackjack />
          <WheelOfFortune />
          <HighLow />
          <RockPaperScissors />
          <DoubleOrNothing />
          <Bingo />
          <VideoPoker />
          <Trivia />
          <FishHunter />
          <HorseRacing />
          <ScratchCards />
          <TreasureHunt />
          <Minesweeper />
          <MemoryMatch />
*/

export default Index;
