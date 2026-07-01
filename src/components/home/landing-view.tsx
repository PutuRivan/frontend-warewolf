"use client";

import { useGameStore } from "@/lib/store/useGameStore";
import GlassPanel from "@/components/ui/glass-panel";

export default function LandingView() {
  const setView = useGameStore((state) => state.setView);

  return (
    <div className="flex flex-col items-center justify-center max-w-lg w-full text-center space-y-8 animate-fade-in">
      <div className="space-y-2 select-none">
        <h1 className="font-cinzel text-5xl md:text-7xl font-bold tracking-[0.2em] text-white animate-pulse-glow">
          WAREWOLF
        </h1>
        <h2 className="font-sans text-xs md:text-sm tracking-[0.6em] text-werewolf-red uppercase font-semibold">
          NIGHTFALL
        </h2>
      </div>

      {/* Spooky Howling Wolf SVG Silhouette */}
      <div className="w-48 h-48 flex items-center justify-center text-purple-400/80 drop-shadow-[0_0_15px_rgba(192,132,252,0.3)]">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full fill-current animate-pulse duration-[3s]"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Howling Wolf Logo"
        >
          <title>Howling Wolf Logo</title>
          {/* Howling wolf shape */}
          <path d="M50 90 C 50 90, 52 82, 50 75 C 48 68, 43 65, 43 55 C 43 45, 52 40, 50 32 C 48 24, 40 18, 40 18 C 40 18, 45 20, 48 24 C 51 28, 53 30, 56 31 C 59 32, 62 28, 64 25 C 66 22, 65 15, 65 15 C 65 15, 68 20, 68 25 C 68 30, 65 33, 62 36 C 59 39, 58 45, 60 52 C 62 59, 68 62, 70 70 C 72 78, 68 85, 68 85 C 68 85, 65 90, 50 90 Z" />
          {/* Moon backdrop ring inside the wolf SVG */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            fill="none"
            className="opacity-30"
          />
        </svg>
      </div>

      <GlassPanel className="w-full flex flex-col items-center justify-center p-8 space-y-6">
        <p className="text-zinc-400 text-sm md:text-base max-w-sm">
          A distributed multiplayer game of deception, shadows, and survival.
          Who will survive the night?
        </p>

        <button
          type="button"
          onClick={() => setView("auth")}
          className="
            relative w-full py-4 px-8 rounded-xl font-cinzel tracking-widest font-bold text-white text-lg overflow-hidden
            bg-gradient-to-r from-purple-800 to-purple-950 border border-purple-500/50
            hover:from-purple-700 hover:to-purple-900 hover:border-purple-400
            shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]
            transition-all duration-300 transform active:scale-95 group cursor-pointer
          "
        >
          <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          ENTER THE FOREST
        </button>

        <span className="text-[10px] text-werewolf-red/60 uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5 animate-pulse">
          <span>☠</span> Beware the full moon <span>☠</span>
        </span>
      </GlassPanel>
    </div>
  );
}
