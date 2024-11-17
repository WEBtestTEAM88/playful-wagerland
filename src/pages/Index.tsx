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

const Index = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen bg-casino-black">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-casino-black">
      <h1 className="text-4xl font-bold text-center text-casino-gold mb-8 animate-fade-in">
        Welcome to the Casino
      </h1>
      
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
      </div>
    </div>
  );
};

export default Index;