"use client";

import { ChevronLeft, Star, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/store/useGameStore";
import GlassPanel from "@/components/ui/glass-panel";
import { getLeaderboard, type LeaderboardUser } from "@/lib/api/user.service";

export default function LeaderboardView() {
  const setView = useGameStore((state) => state.setView);
  const [rankings, setRankings] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await getLeaderboard(1, 20);
        setRankings(response.leaderboard || []);
      } catch (err: any) {
        setError(err.message || "Gagal memuat papan peringkat.");
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="w-full max-w-3xl animate-fade-in relative z-20 space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => setView("lobby")}
        className="flex items-center gap-1.5 text-zinc-400 hover:text-purple-400 transition-colors text-sm group cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Return to Lobby
      </button>

      <GlassPanel className="p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-purple-500/10 pb-4">
          <div className="w-10 h-10 rounded-lg bg-werewolf-gold/10 border border-werewolf-gold/30 flex items-center justify-center text-werewolf-gold">
            <Trophy className="w-5 h-5 text-werewolf-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-cinzel font-bold text-white tracking-wider">
              PACK RANKINGS
            </h2>
            <p className="text-xs text-zinc-500 font-sans">
              The most fearsome and active minds in the forest.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-8 h-8 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono animate-pulse">
              Consulting the Spirits...
            </p>
          </div>
        ) : error ? (
          <div className="bg-werewolf-red/10 border border-werewolf-red/20 text-werewolf-red text-xs py-4 px-6 rounded-xl text-center">
            ⚠️ {error}
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12 text-xs text-zinc-500 uppercase tracking-widest font-mono">
            No active players found in the forest.
          </div>
        ) : (
          /* Leaderboard Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-500/10 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-4 text-center">Rank</th>
                  <th className="py-4 px-4">Hunter / Beast</th>
                  <th className="py-4 px-4 text-center">Level</th>
                  <th className="py-4 px-4 text-right">Experience (XP)</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((item, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  const rankColor =
                    rank === 1
                      ? "text-werewolf-gold bg-werewolf-gold/10 border-werewolf-gold/20"
                      : rank === 2
                        ? "text-zinc-300 bg-zinc-300/10 border-zinc-300/20"
                        : "text-amber-600 bg-amber-600/10 border-amber-600/20";

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-purple-500/5 hover:bg-purple-950/10 transition-colors group"
                    >
                      <td className="py-4 px-4 text-center">
                        {isTop3 ? (
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold ${rankColor}`}
                          >
                            {rank}
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-sm font-semibold">
                            {rank}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-white group-hover:text-purple-300 transition-colors">
                        <div className="flex items-center gap-2">
                          {rank === 1 && (
                            <Star className="w-4 h-4 text-werewolf-gold fill-current" />
                          )}
                          <span>{item.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-zinc-300">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-purple-950/30 border border-purple-500/15 text-xs text-purple-400 font-bold">
                          Lv {item.level}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-purple-300 font-mono font-semibold tracking-wide">
                        {item.exp} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
