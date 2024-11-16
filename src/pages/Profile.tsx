import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Settings, Key, Image } from "lucide-react";

const Profile = () => {
  const { user, updateBalance } = useUser();
  const [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  if (!user) return null;

  const handlePasswordChange = () => {
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    // Implementation for password change would go here
    toast({
      title: "Success",
      description: "Password has been updated",
    });
    setNewPassword("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-casino-black border-casino-gold/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-casino-gold"
                />
              ) : (
                <User className="w-24 h-24 text-casino-gold" />
              )}
              <label className="absolute bottom-0 right-0 p-1 bg-casino-gold rounded-full cursor-pointer">
                <Image className="w-4 h-4 text-black" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-casino-gold">{user.username}</h2>
              <p className="text-gray-400">Balance: ${user.balance}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">New Password</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/20 border-casino-gold/30 text-white"
                  placeholder="Enter new password"
                />
                <Button
                  onClick={handlePasswordChange}
                  className="bg-casino-gold hover:bg-casino-gold/90 text-black"
                >
                  <Key className="w-4 h-4 mr-1" />
                  Update
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-casino-black border-casino-gold/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-casino-gold">Game Statistics</h2>
            <Settings className="w-6 h-6 text-casino-gold" />
          </div>

          <div className="rounded-lg overflow-hidden border border-casino-gold/20">
            <Table>
              <TableHeader>
                <TableRow className="bg-black/40 hover:bg-black/40">
                  <TableHead className="text-casino-gold">Game</TableHead>
                  <TableHead className="text-casino-gold">Wins</TableHead>
                  <TableHead className="text-casino-gold">Losses</TableHead>
                  <TableHead className="text-casino-gold">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(user.stats.gameStats).map(([game, stats]) => (
                  <TableRow key={game} className="bg-black/20 hover:bg-black/30">
                    <TableCell className="text-white">{game}</TableCell>
                    <TableCell className="text-green-500">{stats.wins}</TableCell>
                    <TableCell className="text-red-500">{stats.losses}</TableCell>
                    <TableCell className={stats.totalWinnings - stats.totalLosses > 0 ? "text-green-500" : "text-red-500"}>
                      ${stats.totalWinnings - stats.totalLosses}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;