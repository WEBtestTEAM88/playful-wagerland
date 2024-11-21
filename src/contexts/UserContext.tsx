import React, { createContext, useContext, useState } from "react";
import { User } from "../types/casino";
import { toast } from "@/components/ui/use-toast";
import { saveUser, loadUsers, loadCurrentUser } from "@/utils/userStorage";

interface UserContextType {
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
  updateBalance: (amount: number, userId?: string) => void;
  users: User[];
  updateUserStats: (won: boolean) => void;
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
          wins: 0,
          losses: 0,
          streak: 0
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
          wins: 0,
          losses: 0,
          streak: 0
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

  const updateUserStats = (won: boolean) => {
    if (user && user.id !== "admin") {
      const updatedUser = {
        ...user,
        stats: {
          wins: user.stats.wins + (won ? 1 : 0),
          losses: user.stats.losses + (won ? 0 : 1),
          streak: won ? user.stats.streak + 1 : 0
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