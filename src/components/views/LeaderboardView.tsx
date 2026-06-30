"use client";

import { ChevronLeft, Star, Trophy } from "lucide-react";
import React from "react";
import { useGameStore } from "@/lib/store/useGameStore";
import GlassPanel from "../GlassPanel";

interface RankItem {
  rank: number;
  name: string;
  level: number;
  matches: number;
  wins: number;
  winRate: string;
  points: number;
}

const mockRankings: RankItem[] = [
  {
    rank: 1,
    name: "VampireSlayer",
    level: 15,
    matches: 156,
    wins: 110,
    winRate: "70.5%",
    points: 3450,
  },
  {
    rank: 2,
    name: "AlphaWolf_1",
    level: 12,
    matches: 180,
    wins: 108,
    winRate: "60.0%",
    points: 3120,
  },
  {
    rank: 3,
    name: "SeerOfTruth",
    level: 11,
    matches: 130,
    wins: 82,
    winRate: "63.0%",
    points: 2890,
  },
  {
    rank: 4,
    name: "ShadowHunter",
    level: 9,
    matches: 95,
    wins: 58,
    winRate: "61.0%",
    points: 2150,
  },
  {
    rank: 5,
    name: "GhostWhisperer",
    level: 8,
    matches: 84,
    wins: 49,
    winRate: "58.3%",
    points: 1980,
  },
  {
    rank: 6,
    name: "Moonlight_101",
    level: 7,
    matches: 72,
    wins: 41,
    winRate: "56.9%",
    points: 1720,
  },
  {
    rank: 7,
    name: "WolfBane",
    level: 6,
    matches: 68,
    wins: 38,
    winRate: "55.8%",
    points: 1590,
  },
];

export default function LeaderboardView() {
  const setView = useGameStore((state) => state.setView);

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
              The most fearsome and sharpest minds in the forest
              (view_user_profiles).
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-500/10 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-4 text-center">Rank</th>
                <th className="py-4 px-4">Hunter / Beast</th>
                <th className="py-4 px-4 text-center">Level</th>
                <th className="py-4 px-4 text-center">Matches</th>
                <th className="py-4 px-4 text-center">Win Rate</th>
                <th className="py-4 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {mockRankings.map((item) => {
                const isTop3 = item.rank <= 3;
                const rankColor =
                  item.rank === 1
                    ? "text-werewolf-gold bg-werewolf-gold/10 border-werewolf-gold/20"
                    : item.rank === 2
                      ? "text-zinc-300 bg-zinc-300/10 border-zinc-300/20"
                      : "text-amber-600 bg-amber-600/10 border-amber-600/20";

                return (
                  <tr
                    key={item.rank}
                    className="border-b border-purple-500/5 hover:bg-purple-950/10 transition-colors group"
                  >
                    <td className="py-4 px-4 text-center">
                      {isTop3 ? (
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold ${rankColor}`}
                        >
                          {item.rank}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-sm font-semibold">
                          {item.rank}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold text-white group-hover:text-purple-300 transition-colors">
                      <div className="flex items-center gap-2">
                        {item.rank === 1 && (
                          <Star className="w-4 h-4 text-werewolf-gold fill-current" />
                        )}
                        {item.name}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-zinc-300">
                      <span className="inline-block px-2 py-0.5 rounded bg-purple-950/30 border border-purple-500/15 text-xs text-purple-400 font-bold">
                        Lv {item.level}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-zinc-300 font-mono text-sm">
                      {item.matches}
                    </td>
                    <td className="py-4 px-4 text-center text-zinc-300 font-semibold">
                      {item.winRate}
                    </td>
                    <td className="py-4 px-4 text-right text-purple-300 font-mono font-semibold tracking-wide">
                      {item.points.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
