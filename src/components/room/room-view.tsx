"use client";

import {
  CheckCircle2,
  Lock as LockIcon,
  LogOut,
  MessageSquare,
  Play,
  Send,
  Shield,
  Skull,
  Unlock,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { type ChatType, useGameStore } from "@/lib/store/useGameStore";
import GlassPanel from "@/components/ui/glass-panel";

interface Role {
  name: string;
  desc: string;
  color: string;
}

export default function RoomView() {
  const user = useGameStore((state) => state.user);
  const room = useGameStore((state) => state.room);
  const messages = useGameStore((state) => state.messages);
  const leaveRoom = useGameStore((state) => state.leaveRoom);
  const toggleReady = useGameStore((state) => state.toggleReady);
  const sendChatMessage = useGameStore((state) => state.sendChatMessage);
  const startGame = useGameStore((state) => state.startGame);

  const [chatInput, setChatInput] = useState("");
  const [roleReveal, setRoleReveal] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<Role | null>(null);
  const [activeChatTab, setActiveChatTab] = useState<ChatType>("lobby");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    const messageCount = messages.length;
    if (messageCount >= 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Sync active chat tab when room status changes to playing
  useEffect(() => {
    if (room?.status === "playing") {
      setActiveChatTab("public");
    } else {
      setActiveChatTab("lobby");
    }
  }, [room?.status]);

  if (!room || !user) return null;

  const isHost = room.hostId === user.id;
  const myPlayer = room.players.find((p) => p.name === user.username);
  const isAllReady = room.players.length >= 4;
  const isGamePlaying = room.status === "playing";

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim(), activeChatTab);
    setChatInput("");
  };

  const handleStartGame = () => {
    const roles: Role[] = [
      {
        name: "WEREWOLF 🐺",
        desc: "Awake at night. Kill a villager each night phase. Coordinate with other wolves in your secret Werewolf Chat tab.",
        color: "text-red-500 text-shadow-red-glow border-red-500/30",
      },
      {
        name: "SEER 🧙‍♂️",
        desc: "Awake at night. Reveal the true identity of one player per round. Guide the village.",
        color: "text-cyan-400 text-shadow-glow border-cyan-500/30",
      },
      {
        name: "BODYGUARD 🛡️",
        desc: "Awake at night. Select one player to protect from death. You cannot protect yourself twice in a row.",
        color: "text-amber-500 border-amber-500/30",
      },
      {
        name: "VILLAGER 🧑‍🌾",
        desc: "Find the werewolves during the day. Vote out suspects. Trust your intuition.",
        color: "text-zinc-300 border-zinc-500/20",
      },
    ];
    // For demo purposes, let's pick Werewolf sometimes to showcase the werewolf tab, or pick randomly
    const randomRole = roles[Math.floor(Math.random() * roles.length)];

    setMyRole(randomRole);
    setRoleReveal(JSON.stringify(randomRole));
    startGame();
  };

  // Filter messages based on selected channel
  const visibleMessages = messages.filter(
    (msg) => msg.chat_type === activeChatTab,
  );
  const isWerewolf = myRole?.name.includes("WEREWOLF");

  return (
    <div className="w-full max-w-5xl animate-fade-in relative z-20 space-y-6">
      {/* Room Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-purple-400 tracking-[0.3em] font-semibold uppercase">
              ROOM MATCHMAKING
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[9px] font-bold text-purple-300 uppercase tracking-wider">
              {room.isPrivate ? (
                <>
                  <LockIcon className="w-2.5 h-2.5" /> Private
                </>
              ) : (
                <>
                  <Unlock className="w-2.5 h-2.5" /> Public
                </>
              )}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[9px] font-semibold text-zinc-400">
              {room.players.length} / {room.maxPlayers} Players Max
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-cinzel font-bold text-white tracking-wider flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span>{room.name}</span>
            <span className="text-purple-400 bg-purple-950/30 border border-purple-500/20 px-2.5 py-0.5 rounded-xl text-shadow-glow font-mono text-xl">
              {room.code}
            </span>
          </h1>
        </div>

        <button
          type="button"
          onClick={leaveRoom}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-werewolf-red/20 bg-werewolf-red/5 text-werewolf-red hover:bg-werewolf-red/10 hover:border-werewolf-red/40 text-sm font-semibold transition-all cursor-pointer self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" />
          Leave Lobby
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Player List */}
        <GlassPanel className="md:col-span-1 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/10 pb-3">
              <h3 className="font-cinzel font-bold text-lg text-white">
                PLAYERS ({room.players.length}/{room.maxPlayers})
              </h3>
              <span className="text-xs text-zinc-500 font-sans">
                Min. 4 to start
              </span>
            </div>

            <div className="space-y-3">
              {room.players.map((p) => {
                const isMe = p.name === user.username;
                return (
                  <div
                    key={p.id}
                    className={`
                      flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200
                      ${isMe ? "bg-purple-950/15 border-purple-500/30" : "bg-spooky-black/40 border-purple-500/5"}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">👤</span>
                      <div>
                        <span
                          className={`text-sm font-semibold ${isMe ? "text-purple-300" : "text-white"}`}
                        >
                          {p.name} {isMe && "(You)"}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {p.isHost && (
                            <span className="flex items-center gap-0.5 text-[9px] text-werewolf-gold font-bold uppercase tracking-wider">
                              <Shield className="w-2.5 h-2.5" /> Host
                            </span>
                          )}
                          {isGamePlaying && (
                            <span
                              className={`flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider ${p.isAlive ? "text-emerald-400" : "text-zinc-600"}`}
                            >
                              • {p.isAlive ? "Alive" : "Dead"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {p.isHost ? (
                        <span className="text-xs text-purple-400 font-semibold tracking-wider uppercase px-2.5 py-1 bg-purple-500/5 rounded-full border border-purple-500/10">
                          Host
                        </span>
                      ) : p.isReady ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Ready
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-zinc-500 font-semibold">
                          <XCircle className="w-4 h-4 text-zinc-600" />
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Player controls */}
          <div className="border-t border-purple-500/10 pt-4 space-y-3">
            {myRole && (
              <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-3.5 space-y-2 mb-2 text-center">
                <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
                  Your Active Role
                </span>
                <div
                  className={`font-cinzel text-lg font-bold ${myRole.color.split(" ")[0]}`}
                >
                  {myRole.name}
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                  {myRole.desc}
                </p>
              </div>
            )}

            {!isHost ? (
              <button
                type="button"
                disabled={isGamePlaying}
                onClick={() => toggleReady(user.username)}
                className={`
                  w-full py-3.5 rounded-xl font-cinzel font-bold tracking-widest text-sm transition-all duration-300 cursor-pointer
                  ${
                    isGamePlaying
                      ? "bg-zinc-800/10 border border-zinc-700/20 text-zinc-600 cursor-not-allowed"
                      : myPlayer?.isReady
                        ? "bg-emerald-950/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40"
                        : "bg-gradient-to-r from-purple-800 to-purple-950 border border-purple-500/35 text-white hover:from-purple-700"
                  }
                `}
              >
                {isGamePlaying
                  ? "GAME IN PROGRESS"
                  : myPlayer?.isReady
                    ? "SET NOT READY"
                    : "MARK READY"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartGame}
                disabled={!isAllReady || isGamePlaying}
                className={`
                  w-full py-3.5 rounded-xl font-cinzel font-bold tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
                  ${
                    isGamePlaying
                      ? "bg-zinc-800/10 border border-zinc-700/20 text-zinc-600 cursor-not-allowed"
                      : isAllReady
                        ? "bg-gradient-to-r from-werewolf-red/80 to-werewolf-crimson border border-werewolf-red/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:from-werewolf-red hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-[0.98]"
                        : "bg-zinc-800/20 border border-zinc-700/30 text-zinc-500 cursor-not-allowed"
                  }
                `}
              >
                <Play className="w-4 h-4" />
                {isGamePlaying ? "GAME STARTED" : "START THE GAME"}
              </button>
            )}
            {isHost && !isAllReady && !isGamePlaying && (
              <p className="text-[10px] text-zinc-500 text-center uppercase tracking-wider font-semibold animate-pulse">
                Waiting for all players to be ready
              </p>
            )}
          </div>
        </GlassPanel>

        {/* Right Column: Chat Box with Channel Tabs */}
        <GlassPanel className="md:col-span-2 flex flex-col h-[520px]">
          {/* Header & Tabs */}
          <div className="border-b border-purple-500/10 pb-3 mb-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-cinzel font-bold text-lg text-white tracking-wide">
                  CHAT CHANNEL
                </h3>
                <p className="text-xs text-zinc-500">
                  Plan your strategy. Do not trust the silent ones.
                </p>
              </div>
            </div>

            {/* Spooky Chat Tab Switcher (public, werewolf, dead, etc.) */}
            <div className="flex gap-2">
              {!isGamePlaying ? (
                <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-purple-500/15 py-1 px-3.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />{" "}
                  Pre-Game Lobby Channel
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveChatTab("public")}
                    className={`
                      flex items-center gap-1.5 py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider border cursor-pointer transition-all duration-200
                      ${
                        activeChatTab === "public"
                          ? "bg-purple-950/20 border-purple-500 text-white text-shadow-glow"
                          : "bg-transparent border-purple-500/10 text-zinc-500 hover:text-zinc-300"
                      }
                    `}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Public Discussion
                  </button>

                  {/* Secret werewolf channel (only for wolves) */}
                  {isWerewolf && (
                    <button
                      type="button"
                      onClick={() => setActiveChatTab("werewolf")}
                      className={`
                        flex items-center gap-1.5 py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider border cursor-pointer transition-all duration-200
                        ${
                          activeChatTab === "werewolf"
                            ? "bg-red-950/20 border-red-500 text-red-400 text-shadow-red-glow animate-pulse"
                            : "bg-transparent border-red-500/10 text-zinc-500 hover:text-red-400/70"
                        }
                      `}
                    >
                      <Skull className="w-3.5 h-3.5" /> Werewolf Pack
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar">
            {visibleMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-600 font-mono tracking-widest uppercase">
                {activeChatTab === "werewolf"
                  ? "🐺 Pack channel is quiet. Plan your night action..."
                  : "🍂 Silence falls upon the forest..."}
              </div>
            ) : (
              visibleMessages.map((msg) => {
                const isSystem = msg.sender === "System";
                const isMe = msg.sender === user.username;

                if (isSystem) {
                  return (
                    <div
                      key={`${msg.sender}-${msg.time}-${msg.text.substring(0, 15)}`}
                      className="flex justify-center"
                    >
                      <span className="bg-purple-950/20 border border-purple-500/10 text-purple-300/80 text-[11px] px-3.5 py-1.5 rounded-full font-mono">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${msg.sender}-${msg.time}-${msg.text.substring(0, 15)}`}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-1">
                      <span
                        className={`font-semibold ${isMe ? "text-purple-400" : "text-zinc-400"}`}
                      >
                        {msg.sender}
                      </span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>
                    <div
                      className={`
                        max-w-[75%] rounded-xl px-4 py-2.5 text-sm border
                        ${
                          isMe
                            ? activeChatTab === "werewolf"
                              ? "bg-red-950/20 border-red-500/30 text-white rounded-tr-none"
                              : "bg-purple-600/15 border-purple-500/30 text-white rounded-tr-none"
                            : activeChatTab === "werewolf"
                              ? "bg-spooky-black/60 border-red-500/10 text-red-200/90 rounded-tl-none"
                              : "bg-spooky-black/60 border-purple-500/5 text-zinc-300 rounded-tl-none"
                        }
                      `}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendChat}
            className="flex flex-col space-y-2 border-t border-purple-500/10 pt-4"
          >
            <label htmlFor="chat-input" className="sr-only">
              Chat Message
            </label>
            <div className="flex gap-2">
              <input
                id="chat-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  activeChatTab === "werewolf"
                    ? "Whisper to other wolves..."
                    : "Send message to room..."
                }
                className="
                  flex-1 bg-spooky-black/80 border border-purple-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600
                  focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                  transition-all duration-200
                "
              />
              <button
                type="submit"
                className={`
                  px-5 rounded-xl border transition-all duration-200 text-white flex items-center justify-center active:scale-[0.95] cursor-pointer
                  ${
                    activeChatTab === "werewolf"
                      ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-400"
                      : "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400"
                  }
                `}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </GlassPanel>
      </div>

      {/* Role Reveal Overlay Modal */}
      {roleReveal &&
        (() => {
          const role = JSON.parse(roleReveal);
          return (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="max-w-md w-full text-center space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] text-purple-400 tracking-[0.4em] font-bold uppercase animate-pulse">
                    Nightfall Has Begun
                  </span>
                  <h2 className="text-3xl font-cinzel font-bold text-white tracking-widest">
                    YOUR IDENTITY
                  </h2>
                </div>

                {/* Role Card */}
                <GlassPanel
                  className={`border-2 py-12 px-6 space-y-6 bg-gradient-to-b from-spooky-black to-purple-950/40 relative overflow-hidden ${role.color}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.1)_0%,_transparent_70%)] pointer-events-none" />

                  <h3
                    className={`text-3xl font-cinzel font-black tracking-widest ${role.color.split(" ")[0]}`}
                  >
                    {role.name}
                  </h3>

                  <p className="text-zinc-300 text-sm max-w-xs mx-auto leading-relaxed">
                    {role.desc}
                  </p>

                  <div className="pt-4">
                    <span className="inline-block px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-xs font-semibold uppercase tracking-wider font-mono">
                      System Ready
                    </span>
                  </div>
                </GlassPanel>

                <button
                  type="button"
                  onClick={() => setRoleReveal(null)}
                  className="
                  px-8 py-3 rounded-xl font-cinzel font-bold tracking-widest text-white text-xs border border-zinc-700/80 bg-zinc-800/40 hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-300 cursor-pointer
                "
                >
                  RETURN TO LOBBY
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
