import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types/casino";
import { toast } from "@/components/ui/use-toast";

interface UserContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    // TODO: Implement actual authentication
    const mockUser: User = {
      id: "1",
      username,
      balance: 1000,
      createdAt: new Date(),
      stats: {
        gamesPlayed: 0,
        totalWinnings: 0,
        totalLosses: 0,
        biggestWin: 0,
      },
      inventory: [],
    };
    setUser(mockUser);
    toast({
      title: "Welcome back!",
      description: "Successfully logged in to your casino account.",
    });
  };

  const register = async (username: string, password: string) => {
    // TODO: Implement actual registration
    const mockUser: User = {
      id: "1",
      username,
      balance: 1000,
      createdAt: new Date(),
      stats: {
        gamesPlayed: 0,
        totalWinnings: 0,
        totalLosses: 0,
        biggestWin: 0,
      },
      inventory: [],
    };
    setUser(mockUser);
    toast({
      title: "Welcome to the Casino!",
      description: "Your account has been created successfully.",
    });
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Goodbye!",
      description: "You have been logged out successfully.",
    });
  };

  const updateBalance = (amount: number) => {
    if (user) {
      setUser({
        ...user,
        balance: user.balance + amount,
      });
    }
  };

  return (
    <UserContext.Provider value={{ user, login, register, logout, updateBalance }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};