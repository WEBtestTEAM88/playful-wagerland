export interface User {
  id: string;
  username: string;
  balance: number;
  createdAt: Date;
  stats: UserStats;
  inventory: InventoryItem[];
}

export interface UserStats {
  gamesPlayed: number;
  totalWinnings: number;
  totalLosses: number;
  biggestWin: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: "LUCKY_COIN" | "BONUS_CARD";
  modifier: number;
}

export interface RouletteGame {
  id: string;
  type: "ROULETTE";
  bet: number;
  selectedNumber: number;
  result: number | null;
  won: boolean;
  timestamp: Date;
}