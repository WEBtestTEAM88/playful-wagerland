export interface User {
  id: string;
  username: string;
  balance: number;
  createdAt: Date;
  stats: BasicStats;
  inventory: InventoryItem[];
}

export interface BasicStats {
  wins: number;
  losses: number;
  streak: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: "LUCKY_COIN" | "BONUS_CARD";
  modifier: number;
}