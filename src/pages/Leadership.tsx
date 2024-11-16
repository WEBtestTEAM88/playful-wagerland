import { useUser } from "@/contexts/UserContext";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Medal, Award } from "lucide-react";

const Leadership = () => {
  const { users } = useUser();

  // Sort users by total winnings, excluding admin
  const sortedUsers = [...users]
    .filter(user => user.id !== "admin")
    .sort((a, b) => {
      const aWinnings = a.stats.totalWinnings || 0;
      const bWinnings = b.stats.totalWinnings || 0;
      return bWinnings - aWinnings;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 bg-casino-black border-casino-gold/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-casino-gold">Leadership Board</h1>
            <p className="text-gray-400">Top players and their achievements</p>
          </div>
          <Trophy className="w-8 h-8 text-casino-gold" />
        </div>

        <div className="rounded-lg overflow-hidden border border-casino-gold/20">
          <Table>
            <TableHeader>
              <TableRow className="bg-black/40 hover:bg-black/40">
                <TableHead className="text-casino-gold">Rank</TableHead>
                <TableHead className="text-casino-gold">Player</TableHead>
                <TableHead className="text-casino-gold">Games Played</TableHead>
                <TableHead className="text-casino-gold">Total Winnings</TableHead>
                <TableHead className="text-casino-gold">Biggest Win</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user, index) => (
                <TableRow
                  key={user.id}
                  className="bg-black/20 hover:bg-black/30"
                >
                  <TableCell className="text-white font-medium">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                      {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                      {index === 2 && <Award className="w-4 h-4 text-amber-600" />}
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{user.username}</TableCell>
                  <TableCell className="text-white">{user.stats.gamesPlayed || 0}</TableCell>
                  <TableCell className="text-green-500">${user.stats.totalWinnings || 0}</TableCell>
                  <TableCell className="text-casino-gold">${user.stats.biggestWin || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Leadership;