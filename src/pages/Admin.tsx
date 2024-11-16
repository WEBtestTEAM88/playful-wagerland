import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Ban, Crown, Coins, Settings } from "lucide-react";

const AdminPanel = () => {
  const { user, users, updateBalance } = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [balanceAmount, setBalanceAmount] = useState<{ [key: string]: number }>({});

  if (!user || user.username !== "admin") {
    navigate("/");
    return null;
  }

  const handleAddBalance = (userId: string) => {
    const amount = balanceAmount[userId];
    if (amount) {
      updateBalance(amount, userId);
      toast({
        title: "Balance updated",
        description: `Modified user's balance by $${amount}`,
      });
      setBalanceAmount(prev => ({ ...prev, [userId]: 0 }));
    }
  };

  const handleBanUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      // Here we would typically call an API to ban the user
      toast({
        title: "User banned",
        description: `${targetUser.username} has been banned from the platform`,
        variant: "destructive",
      });
    }
  };

  const handleResetStats = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      // Reset user stats in the context
      const updatedUsers = users.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            stats: {
              gamesPlayed: 0,
              totalWinnings: 0,
              totalLosses: 0,
              biggestWin: 0,
              gameStats: {}
            }
          };
        }
        return u;
      });
      // Update local storage
      localStorage.setItem('casinoUsers', JSON.stringify(updatedUsers));
      toast({
        title: "Stats reset",
        description: `Statistics for ${targetUser.username} have been reset`,
      });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 bg-casino-black/90 border-casino-gold/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-casino-gold">Admin Panel</h1>
            <p className="text-gray-400">Manage users and monitor platform activity</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-casino-gold">{users.length}</p>
            </div>
            <Crown className="w-8 h-8 text-casino-gold" />
          </div>
        </div>
        
        <div className="mb-6">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-black/20 border-casino-gold/30 text-white"
          />
        </div>

        <div className="rounded-lg overflow-hidden border border-casino-gold/20">
          <Table>
            <TableHeader>
              <TableRow className="bg-black/40 hover:bg-black/40">
                <TableHead className="text-casino-gold">Username</TableHead>
                <TableHead className="text-casino-gold">Balance</TableHead>
                <TableHead className="text-casino-gold">Games Played</TableHead>
                <TableHead className="text-casino-gold">Total Winnings</TableHead>
                <TableHead className="text-casino-gold">Total Losses</TableHead>
                <TableHead className="text-casino-gold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="bg-black/20 hover:bg-black/30"
                >
                  <TableCell className="text-white font-medium">
                    {user.username}
                  </TableCell>
                  <TableCell className="text-white">${user.balance}</TableCell>
                  <TableCell className="text-white">{user.stats.gamesPlayed}</TableCell>
                  <TableCell className="text-green-500">
                    ${user.stats.totalWinnings}
                  </TableCell>
                  <TableCell className="text-red-500">
                    ${user.stats.totalLosses}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        value={balanceAmount[user.id] || ""}
                        onChange={(e) => setBalanceAmount(prev => ({
                          ...prev,
                          [user.id]: Number(e.target.value)
                        }))}
                        className="w-24 bg-black/20 border-casino-gold/30 text-white"
                        placeholder="Amount"
                      />
                      <Button
                        onClick={() => handleAddBalance(user.id)}
                        className="bg-casino-gold hover:bg-casino-gold/90 text-black"
                      >
                        <Coins className="w-4 h-4 mr-1" />
                        Update
                      </Button>
                      <Button
                        onClick={() => handleResetStats(user.id)}
                        variant="outline"
                        className="border-casino-gold/30 text-casino-gold hover:bg-casino-gold/10"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Reset Stats
                      </Button>
                      <Button
                        onClick={() => handleBanUser(user.id)}
                        variant="destructive"
                        className="hover:bg-red-600"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Ban User
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AdminPanel;