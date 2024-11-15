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

const AdminPanel = () => {
  const { user, users } = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not admin
  if (!user || user.username !== "admin") {
    navigate("/");
    return null;
  }

  const handleAddBalance = (userId: string, amount: number) => {
    // Balance updates are handled by UserContext
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
                  <TableCell className="text-white">{user.stats.gamesPlayed}</TableCell>
                  <TableCell className="text-green-500">
                    {user.stats.totalWinnings}
                  </TableCell>
                  <TableCell className="text-red-500">
                    {user.stats.totalLosses}
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