import { AuthForm } from "@/components/auth/AuthForm";
import { Roulette } from "@/components/games/Roulette";
import { SlotMachine } from "@/components/games/SlotMachine";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Index = () => {
  const { user, logout } = useUser();

  return (
    <div className="min-h-screen bg-casino-black text-casino-white">
      <div className="container mx-auto px-4 py-8">
        {user ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-casino-gold">
                  Welcome, {user.username}
                </h1>
                <p className="text-gray-400">Balance: {user.balance} coins</p>
              </div>
              <div className="flex gap-4">
                {user.username === "admin" && (
                  <Link to="/admin">
                    <Button
                      variant="outline"
                      className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10"
                >
                  Logout
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Roulette />
              <SlotMachine />
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[80vh]">
            <AuthForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;