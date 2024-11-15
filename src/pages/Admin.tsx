import { useState } from "react";
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

// Mock admin data - replace with real data when implementing backend
const mockUsers = [
  {
    id: "1",
    username: "player1",
    balance: 1000,
    gamesPlayed: 50,
    totalWinnings: 2000,
    totalLosses: 1000,
  },
  {
    id: "2",
    username: "player2",
    balance: 500,
    gamesPlayed: 25,
    totalWinnings: 1000,
    totalLosses: 500,
  },
];

const AdminPanel = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddBalance = (userId: string, amount: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, balance: user.balance + amount }
          : user
      )
    );
    toast({
      title: "Balance updated",
      description: `Added ${amount} coins to user's balance`,
    });
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 bg-white/5 border-none">
        <h1 className="text-3xl font-bold text-casino-gold mb-6">Admin Panel</h1>
        
        <div className="mb-6">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-black/20 border-casino-gold/30"
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
                  <TableCell className="text-white">{user.username}</TableCell>
                  <TableCell className="text-white">{user.balance}</TableCell>
                  <TableCell className="text-white">{user.gamesPlayed}</TableCell>
                  <TableCell className="text-green-500">
                    {user.totalWinnings}
                  </TableCell>
                  <TableCell className="text-red-500">
                    {user.totalLosses}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddBalance(user.id, 100)}
                        className="bg-casino-gold hover:bg-casino-gold/90 text-black"
                      >
                        Add 100
                      </Button>
                      <Button
                        onClick={() => handleAddBalance(user.id, -100)}
                        variant="destructive"
                      >
                        Remove 100
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