"use client";

import AuthView from "@/components/auth/auth-view";
import LandingView from "@/components/home/landing-view";
import LeaderboardView from "@/components/leaderboard/leaderboard-view";
import LobbyView from "@/components/lobby/lobby-view";
import RoomView from "@/components/room/room-view";
import WerewolfBackground from "@/components/layout/werewolf-background";
import { useGameStore } from "@/lib/store/useGameStore";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const view = useGameStore((state) => state.view);
  const { loading } = useAuth();

  if (loading) {
    return (
      <WerewolfBackground>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
          <p className="font-cinzel text-purple-300/60 text-xs tracking-widest uppercase animate-pulse">
            Calling the Pack...
          </p>
        </div>
      </WerewolfBackground>
    );
  }

  const renderView = () => {
    switch (view) {
      case "landing":
        return <LandingView />;
      case "auth":
        return <AuthView />;
      case "lobby":
        return <LobbyView />;
      case "room":
        return <RoomView />;
      case "leaderboard":
        return <LeaderboardView />;
      default:
        return <LandingView />;
    }
  };

  return <WerewolfBackground>{renderView()}</WerewolfBackground>;
}
