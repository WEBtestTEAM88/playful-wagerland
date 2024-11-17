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

const Index = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center text-casino-gold mb-8">
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
      </div>
    </div>
  );
};

export default Index;
