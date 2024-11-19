import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types/casino";
import { toast } from "@/components/ui/use-toast";
import { saveUser, loadUsers, loadCurrentUser, persistUsers } from "@/utils/userStorage";

interface UserContextType {
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
  updateBalance: (amount: number, userId?: string) => void;
  users: User[];
  updateUserStats: (gameType: string, won: boolean, amount: number) => void;
  declareBankruptcy: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(loadCurrentUser());
  const [users, setUsers] = useState<User[]>(loadUsers());

  const login = async (username: string) => {
    if (username === "admin") {
      const adminUser = {
        id: "admin",
        username: "admin",
        balance: 999999,
        createdAt: new Date(),
        stats: {
          gamesPlayed: 0,
          totalWinnings: 0,
          totalLosses: 0,
          biggestWin: 0,
          gameStats: {}
        },
        inventory: [],
      };
      setUser(adminUser);
      saveUser(adminUser);
      toast({
        title: "Welcome Admin!",
        description: "Logged in as administrator",
      });
      return;
    }

    let foundUser = users.find(u => u.username === username);
    if (!foundUser) {
      foundUser = {
        id: crypto.randomUUID(),
        username,
        balance: 1000,
        createdAt: new Date(),
        stats: {
          gamesPlayed: 0,
          totalWinnings: 0,
          totalLosses: 0,
          biggestWin: 0,
          gameStats: {}
        },
        inventory: [],
      };
      setUsers(prev => [...prev, foundUser!]);
    }
    setUser(foundUser);
    saveUser(foundUser);
    toast({
      title: "Welcome!",
      description: "Successfully logged in to your casino account.",
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: "Goodbye!",
      description: "You have been logged out successfully.",
    });
  };

  const updateBalance = (amount: number, userId?: string) => {
    if (user && user.id !== "admin") {
      const targetId = userId || user.id;
      setUsers(prev => prev.map(u => {
        if (u.id === targetId) {
          const updatedUser = {
            ...u,
            balance: Math.max(0, u.balance + amount)
          };
          if (targetId === user.id) {
            setUser(updatedUser);
            saveUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      }));
    }
  };

  const updateUserStats = (gameType: string, won: boolean, amount: number) => {
    if (user && user.id !== "admin") {
      const updatedUser = {
        ...user,
        stats: {
          ...user.stats,
          gamesPlayed: (user.stats.gamesPlayed || 0) + 1,
          totalWinnings: (user.stats.totalWinnings || 0) + (won ? amount : 0),
          totalLosses: (user.stats.totalLosses || 0) + (won ? 0 : amount),
          biggestWin: won ? Math.max(user.stats.biggestWin || 0, amount) : (user.stats.biggestWin || 0),
          gameStats: {
            ...user.stats.gameStats,
            [gameType]: {
              wins: (user.stats.gameStats[gameType]?.wins || 0) + (won ? 1 : 0),
              losses: (user.stats.gameStats[gameType]?.losses || 0) + (won ? 0 : 1),
              totalWinnings: (user.stats.gameStats[gameType]?.totalWinnings || 0) + (won ? amount : 0),
              totalLosses: (user.stats.gameStats[gameType]?.totalLosses || 0) + (won ? 0 : amount)
            }
          }
        }
      };
      setUser(updatedUser);
      saveUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    }
  };

  const declareBankruptcy = () => {
    if (user && user.id !== "admin") {
      const updatedUser = {
        ...user,
        balance: 1000
      };
      setUser(updatedUser);
      saveUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      toast({
        title: "Bankruptcy Declared",
        description: "Your balance has been reset to $1,000",
      });
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      users, 
      login, 
      logout, 
      updateBalance,
      updateUserStats,
      declareBankruptcy 
    }}>
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
