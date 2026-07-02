"use client";

import {
  ArrowRight,
  Award,
  Coins,
  Key,
  Lock as LockIcon,
  LogIn,
  Mail,
  Plus,
  User,
  UserPlus,
  Unlock,
  Users,
  Trophy,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useGameStore } from "@/lib/store/useGameStore";
import GlassPanel from "@/components/ui/glass-panel";
import { useAuth } from "@/hooks/use-auth";

export default function LobbyView() {
  const user = useGameStore((state) => state.user);
  const { logout } = useAuth();
  const createRoom = useGameStore((state) => state.createRoom);
  const joinRoom = useGameStore((state) => state.joinRoom);
  const setView = useGameStore((state) => state.setView);

  // Join Room State
  const [roomCode, setRoomCode] = useState("");
  const [joinError, setJoinError] = useState("");

  // Create Room Configuration State
  const [roomName, setRoomName] = useState(
    user ? `${user.username}'s Den` : "Spooky Den",
  );
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [createError, setCreateError] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setJoinError("");

    if (!roomCode.trim()) {
      setJoinError("Please enter a room code");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await joinRoom(roomCode.trim(), isPrivate ? roomPassword.trim() : undefined);
      if (!res.success) {
        setJoinError(res.message || "Failed to join room");
      }
    } catch (err: any) {
      setJoinError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setCreateError("");

    if (!roomName.trim()) {
      setCreateError("Room name cannot be empty");
      return;
    }
    if (isPrivate && !roomPassword.trim()) {
      setCreateError("Please specify a password for private rooms");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createRoom(
        roomName.trim(),
        maxPlayers,
        isPrivate,
        isPrivate ? roomPassword.trim() : undefined,
      );
      if (!res.success) {
        setCreateError(res.message || "Failed to create room");
      }
    } catch (err: any) {
      setCreateError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in relative z-20 space-y-6">
      {/* Lobby Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-cinzel font-bold text-white tracking-wider flex items-center gap-2">
            <span>🐺</span> THE DARK FOREST
          </h1>
          <p className="text-zinc-400 text-sm">
            Welcome back,{" "}
            <span className="text-purple-400 font-semibold">
              {user?.username}
            </span>
            . Align your strategy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView("leaderboard")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-werewolf-gold/20 bg-werewolf-gold/5 text-werewolf-gold hover:bg-werewolf-gold/10 hover:border-werewolf-gold/40 text-sm font-semibold transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-werewolf-gold animate-bounce" />
            Rankings
          </button>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700/50 bg-zinc-800/10 text-zinc-400 hover:text-white hover:bg-zinc-800/40 hover:border-zinc-500/50 text-sm font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Leave Forest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Panel: Profile & Database Stats */}
        <GlassPanel className="md:col-span-1 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-950 border border-purple-400/40 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(168,85,247,0.3)] select-none">
                🐺
              </div>
              <div>
                <h3 className="font-bold text-white text-lg tracking-wide">
                  {user?.username}
                </h3>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-400 font-semibold tracking-wider uppercase">
                  Level {user?.level}
                </span>
              </div>
            </div>

            {/* Database Aligned Points & Coins */}
            <div className="border-t border-purple-500/10 pt-4 space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                Player Vault (DB Info)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-spooky-black/40 border border-purple-500/10 rounded-lg p-3 flex flex-col items-center">
                  <Award className="w-4 h-4 text-purple-400 mb-1" />
                  <div className="text-zinc-500 text-[9px] uppercase font-bold">
                    Points
                  </div>
                  <div className="text-base font-bold text-white font-cinzel">
                    {user?.point}
                  </div>
                </div>
                <div className="bg-spooky-black/40 border border-purple-500/10 rounded-lg p-3 flex flex-col items-center">
                  <Coins className="w-4 h-4 text-werewolf-gold mb-1" />
                  <div className="text-zinc-500 text-[9px] uppercase font-bold">
                    Coins
                  </div>
                  <div className="text-base font-bold text-werewolf-gold font-cinzel">
                    {user?.coin}
                  </div>
                </div>
              </div>

              {/* Experience progress bar */}
              <div className="bg-spooky-black/40 border border-purple-500/10 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-400">
                  <span>Experience (XP)</span>
                  <span>{user?.exp ? (user.exp % 200) : 0} / 200 XP</span>
                </div>
                <div className="w-full h-1.5 bg-spooky-black/80 rounded-full overflow-hidden border border-purple-500/5">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${user?.exp ? ((user.exp % 200) / 200) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-purple-500/10 pt-4 space-y-2">
              <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                Role Affinity
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 flex items-center gap-1">
                    🧙‍♂️ Seer
                  </span>
                  <span className="text-white font-semibold">High</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 flex items-center gap-1">
                    🐺 Werewolf
                  </span>
                  <span className="text-white font-semibold">Medium</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 flex items-center gap-1">
                    🛡️ Bodyguard
                  </span>
                  <span className="text-white font-semibold">Low</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-950/20 border border-purple-500/10 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-purple-300/80">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              Beware! Trust no one. The wolf may look like your closest ally.
            </span>
          </div>
        </GlassPanel>

        {/* Right Panel: Lobby Actions (Create Room & Join Room) */}
        <div className="md:col-span-2 grid grid-cols-1 gap-6">
          {/* Create Room Card */}
          <GlassPanel
            hoverGlow
            className="flex flex-col justify-between p-8 bg-gradient-to-br from-spooky-purple/40 to-spooky-indigo/40 border-purple-500/30"
          >
            {!showConfig ? (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center text-purple-400">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-xl text-white tracking-wide">
                    HOST NEW MATCH
                  </h3>
                  <p className="text-zinc-400 text-sm mt-1">
                    Create a new game lobby, configure settings, and invite your
                    pack.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfig(true)}
                  className="
                    mt-6 w-full py-3.5 rounded-xl font-cinzel font-bold tracking-widest text-white text-sm
                    bg-gradient-to-r from-purple-800 to-indigo-950 border border-purple-500/40
                    hover:from-purple-700 hover:to-indigo-900 hover:border-purple-300
                    shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]
                    transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer
                  "
                >
                  <Users className="w-4 h-4" />
                  CONFIGURE ROOM
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="flex items-center justify-between border-b border-purple-500/10 pb-3 mb-2">
                  <h3 className="font-cinzel font-bold text-lg text-white">
                    ROOM CONFIGURATION
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowConfig(false)}
                    className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {createError && (
                  <div className="bg-werewolf-red/10 border border-werewolf-red/30 text-werewolf-red text-xs p-2.5 rounded-lg text-center font-medium animate-pulse">
                    ⚠️ {createError}
                  </div>
                )}

                {/* Room Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="room-name-input"
                    className="text-xs text-zinc-400 uppercase font-semibold tracking-wider"
                  >
                    Room Name
                  </label>
                  <input
                    id="room-name-input"
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter Room Name"
                    className="
                      w-full bg-spooky-black/80 border border-purple-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600
                      focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                    "
                  />
                </div>

                {/* Max Players & Privacy Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Max Players */}
                  <div className="space-y-1">
                    <label
                      htmlFor="max-players-select"
                      className="text-xs text-zinc-400 uppercase font-semibold tracking-wider"
                    >
                      Max Players
                    </label>
                    <select
                      id="max-players-select"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      className="
                        w-full bg-spooky-black/80 border border-purple-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600
                        focus:outline-none focus:border-purple-500 focus:ring-1
                      "
                    >
                      {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                        <option
                          key={num}
                          value={num}
                          className="bg-spooky-black"
                        >
                          {num} Players
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Private Room Toggle */}
                  <div className="space-y-1">
                    <label
                      htmlFor="privacy-toggle"
                      className="text-xs text-zinc-400 uppercase font-semibold tracking-wider block"
                    >
                      Room Privacy
                    </label>
                    <button
                      id="privacy-toggle"
                      type="button"
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl border transition-all duration-200 cursor-pointer
                        ${
                          isPrivate
                            ? "bg-purple-950/20 border-purple-500/40 text-purple-300"
                            : "bg-spooky-black/80 border-purple-500/10 text-zinc-400 hover:border-purple-500/20"
                        }
                      `}
                    >
                      <span className="font-semibold">
                        {isPrivate ? "Private Room" : "Public Room"}
                      </span>
                      {isPrivate ? (
                        <LockIcon className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Unlock className="w-4 h-4 text-zinc-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password field (if Private) */}
                {isPrivate && (
                  <div className="space-y-1 animate-slide-down">
                    <label
                      htmlFor="room-password-input"
                      className="text-xs text-zinc-400 uppercase font-semibold tracking-wider"
                    >
                      Room Password
                    </label>
                    <input
                      id="room-password-input"
                      type="password"
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      placeholder="Enter Room Password"
                      className="
                        w-full bg-spooky-black/80 border border-purple-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600
                        focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                      "
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="
                    w-full py-3.5 rounded-xl font-cinzel font-bold tracking-widest text-white text-sm
                    bg-gradient-to-r from-purple-800 to-indigo-950 border border-purple-500/40
                    hover:from-purple-700 hover:to-indigo-900 hover:border-purple-300
                    transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer
                  "
                >
                  <Plus className="w-4 h-4" />
                  CREATE ROOM
                </button>
              </form>
            )}
          </GlassPanel>

          {/* Join Room Card */}
          <GlassPanel hoverGlow className="p-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-werewolf-red/10 border border-werewolf-red/30 flex items-center justify-center text-werewolf-red">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-xl text-white tracking-wide">
                  ENTER EXISTING LOBBY
                </h3>
                <p className="text-zinc-400 text-sm mt-1">
                  Already have a room code? Put it down below and join the lobby
                  instantly.
                </p>
              </div>
            </div>

            <form onSubmit={handleJoin} className="mt-6 space-y-4">
              {joinError && (
                <div className="bg-werewolf-red/10 border border-werewolf-red/30 text-werewolf-red text-xs p-2.5 rounded-lg text-center font-medium animate-pulse">
                  ⚠️ {joinError}
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <label htmlFor="room-code-input" className="sr-only">
                  Room Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="room-code-input"
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="ROOM CODE (e.g. A3F9Z2)"
                    maxLength={6}
                    className="
                      flex-1 bg-spooky-black/80 border border-purple-500/20 rounded-xl px-4 py-3.5 text-center text-sm font-mono tracking-widest text-white placeholder-zinc-600 uppercase
                      focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                      transition-all duration-200
                    "
                  />
                  <button
                    type="submit"
                    className="
                      px-6 rounded-xl font-semibold text-white bg-purple-500/10 border border-purple-500/35 hover:bg-purple-500/20 hover:border-purple-400
                      transition-all duration-200 flex items-center justify-center gap-1 active:scale-[0.95] cursor-pointer
                    "
                  >
                    Join
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </GlassPanel>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-sm w-full animate-scale-up animate-duration-200">
            <GlassPanel className="border-werewolf-red/35 py-8 px-6 space-y-6 text-center bg-gradient-to-b from-spooky-black to-werewolf-red/5">
              <div className="w-14 h-14 rounded-full bg-werewolf-red/10 border border-werewolf-red/35 flex items-center justify-center mx-auto text-werewolf-red animate-pulse">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-cinzel font-bold text-xl text-white tracking-wider">
                  LEAVE THE FOREST?
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Are you sure you want to return to the outskirts? Your active session will be ended.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-zinc-700/80 bg-zinc-800/20 text-zinc-400 hover:text-white hover:bg-zinc-800/40 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                  }}
                  className="flex-1 py-3 rounded-xl border border-werewolf-red/30 bg-werewolf-red/10 text-werewolf-red hover:bg-werewolf-red/20 hover:border-werewolf-red/50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Exit
                </button>
              </div>
            </GlassPanel>
          </div>
        </div>
      )}
    </div>
  );
}
