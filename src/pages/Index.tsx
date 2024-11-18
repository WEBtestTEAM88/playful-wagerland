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
import { Pool } from "@/components/games/Pool";
import { Bingo } from "@/components/games/Bingo";
import { VideoPoker } from "@/components/games/VideoPoker";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, logout, declareBankruptcy } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-casino-black flex items-center justify-center px-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-casino-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-casino-gold animate-fade-in">
            Welcome to the Casino
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-casino-gold">
              Welcome, {user.username}! Balance: ${user.balance}
            </span>
            <Button
              onClick={declareBankruptcy}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Declare Bankruptcy
            </Button>
            <Button 
              onClick={logout}
              className="bg-casino-red hover:bg-casino-red/90 text-white"
            >
              Logout
            </Button>
          </div>
        </div>
        
        
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SlotMachine />
          <Roulette />
          <CardFlip />
          <DiamondMine />
          <LuckyDice />
          <Blackjack />
          <WheelOfFortune />
          <HighLow />
          <RockPaperScissors />
          <Pool />
          <Bingo />
          <VideoPoker />
        </div>
      </div>
    </div>
  );
};

export default Index;