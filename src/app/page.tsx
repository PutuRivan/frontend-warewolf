"use client";

import AuthView from "@/components/views/AuthView";
import LandingView from "@/components/views/LandingView";
import LeaderboardView from "@/components/views/LeaderboardView";
import LobbyView from "@/components/views/LobbyView";
import RoomView from "@/components/views/RoomView";
import WerewolfBackground from "@/components/WerewolfBackground";
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
