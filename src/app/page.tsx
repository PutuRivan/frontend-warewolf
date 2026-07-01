"use client";

import AuthView from "@/components/auth/auth-view";
import LandingView from "@/components/home/landing-view";
import LeaderboardView from "@/components/leaderboard/leaderboard-view";
import LobbyView from "@/components/lobby/lobby-view";
import RoomView from "@/components/room/room-view";
import WerewolfBackground from "@/components/layout/werewolf-background";
import { useGameStore } from "@/lib/store/useGameStore";

export default function Home() {
  const view = useGameStore((state) => state.view);

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
