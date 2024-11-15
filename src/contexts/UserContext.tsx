import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types/casino";
import { toast } from "@/components/ui/use-toast";

interface UserContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (amount: number) => void;
  users: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Load users from localStorage or use default if none exist
const getInitialUsers = (): User[] => {
  const savedUsers = localStorage.getItem('casinoUsers');
  return savedUsers ? JSON.parse(savedUsers) : [];
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(getInitialUsers);

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('casinoUsers', JSON.stringify(users));
  }, [users]);

  const login = async (username: string, password: string) => {
    if (username === "admin" && password === "admin") {
      const adminUser: User = {
        id: "admin",
        username: "admin",
        balance: 999999,
        createdAt: new Date(),
        stats: {
          gamesPlayed: 0,
          totalWinnings: 0,
          totalLosses: 0,
          biggestWin: 0,
        },
        inventory: [],
      };
      setUser(adminUser);
      toast({
        title: "Welcome Admin!",
        description: "Logged in as administrator",
      });
      return;
    }

    const foundUser = users.find(u => u.username === username);
    if (foundUser) {
      setUser(foundUser);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your casino account.",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  const register = async (username: string, password: string) => {
    if (users.some(u => u.username === username)) {
      toast({
        title: "Error",
        description: "Username already exists",
        variant: "destructive",
      });
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
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

    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
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
    if (user && user.id !== "admin") {
      const updatedUser = {
        ...user,
        balance: user.balance + amount,
      };
      setUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    }
  };

  return (
    <UserContext.Provider value={{ user, users, login, register, logout, updateBalance }}>
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