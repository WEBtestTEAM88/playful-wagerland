import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(username, password);
    } else {
      await register(username, password);
    }
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6 bg-white/5 backdrop-blur-lg border border-casino-gold/20">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-casino-gold">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-gray-400">
          {isLogin
            ? "Enter your credentials to continue"
            : "Register to start playing"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-casino-black/50 border-casino-gold/30 text-casino-white"
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-casino-black/50 border-casino-gold/30 text-casino-white"
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-casino-gold hover:bg-casino-gold/90 text-casino-black"
        >
          {isLogin ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-casino-gold hover:underline"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </Card>
  );
};