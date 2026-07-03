import { create } from "zustand";
import * as authService from "@/lib/api/auth.service";
import * as roomService from "@/lib/api/room.service";
import * as chatService from "@/lib/api/chat.service";
import * as gameService from "@/lib/api/game.service";
import * as voteService from "@/lib/api/vote.service";
import * as userService from "@/lib/api/user.service";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export type ViewType = "landing" | "auth" | "lobby" | "room" | "leaderboard";
export type AuthModeType = "login" | "register";
export type ChatType = "lobby" | "public" | "werewolf" | "dead";

export interface Player {
  id: string; // user_id
  name: string; // username
  isHost: boolean;
  isReady: boolean;
  isAlive: boolean;
}

export interface RoomState {
  id: string;
  code: string;
  name: string;
  hostId: string;
  hostName: string;
  maxPlayers: number;
  status: string;
  isPrivate: boolean;
  players: Player[];
  totalPlayer: number;
}

export interface Message {
  sender: string;
  text: string;
  time: string;
  chat_type: ChatType | "system";
}

export interface GameRole {
  roleName: string;
  team: string;
  teammates?: { userId: string; username: string }[];
}

export interface GamePlayState {
  id: string;
  day: number;
  phase: "night" | "discussion" | "voting" | "finished";
  phaseEndTime: number | null;
  myRole: GameRole | null;
  submittedAction: boolean;
  votes: { targetId: string; voterId: string; voterUsername: string }[];
  results: any[] | null;
  players: { userId: string; username: string; avatar: string | null; isAlive: boolean; roleName?: string; team?: string }[];
}

export interface UserState {
  id: string;
  username: string;
  email: string;
  token: string;
  avatar?: string | null;
  point: number;
  coin: number;
  level: number;
  exp: number;
}

export interface GameStore {
  user: UserState | null;
  room: RoomState | null;
  messages: Message[];
  view: ViewType;
  authMode: AuthModeType;
  game: GamePlayState | null;

  // Actions
  setView: (view: ViewType) => void;
  setAuthMode: (mode: AuthModeType) => void;
  login: (username: string) => void;
  register: (username: string, email: string) => void;
  logout: () => void;
  updateProfile: (username: string) => Promise<{ success: boolean; message?: string }>;
  updateAvatar: (avatar: string) => Promise<{ success: boolean; message?: string }>;
  createRoom: (
    name: string,
    maxPlayers: number,
    isPrivate: boolean,
    password?: string,
  ) => Promise<{ success: boolean; message?: string }>;
  joinRoom: (code: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  leaveRoom: () => Promise<void>;
  toggleReady: () => void;
  addMessage: (sender: string, text: string, chat_type: ChatType, createdAt?: string) => void;
  sendChatMessage: (message: string, chatType: ChatType) => Promise<void>;
  startGame: () => Promise<void>;
  connectSocket: (roomId: string, token: string) => void;
  refreshRoomPlayers: (roomId: string) => Promise<void>;
  fetchGameState: (gameId: string) => Promise<void>;
  fetchActiveGame: (roomId: string) => Promise<void>;
  fetchMyRole: (gameId: string) => Promise<void>;
  submitNightAction: (targetId: string, actionType: string) => Promise<void>;
  submitVote: (targetId: string) => Promise<void>;
  fetchGameResults: (gameId: string) => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  user: null,
  view: "landing",
  authMode: "login",
  room: null,
  messages: [],
  game: null,

  setView: (view) => set({ view }),
  setAuthMode: (authMode) => set({ authMode }),

  login: (username) => {
    // Left for compatibility with local mock, normally handled by AuthProvider
    set({
      user: {
        id: "mock-user-id-1",
        username,
        email: `${username.toLowerCase()}@mail.com`,
        token: "mock-jwt-token",
        point: 500,
        coin: 0,
        level: 1,
        exp: 0,
      },
      view: "lobby",
    });
  },

  register: (username, email) => {
    // Left for compatibility with local mock
    set({
      user: {
        id: "mock-user-id-1",
        username,
        email,
        token: "mock-jwt-token",
        point: 500,
        coin: 0,
        level: 1,
        exp: 0,
      },
      view: "lobby",
    });
  },

  logout: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    set({
      user: null,
      view: "landing",
      room: null,
      messages: [],
      game: null,
    });
  },

  updateProfile: async (username) => {
    try {
      const res = await userService.updateProfile(username);
      set((state) => {
        if (!state.user) return {};
        return {
          user: {
            ...state.user,
            username: res.user.username,
          },
        };
      });
      return { success: true };
    } catch (err: any) {
      console.error("updateProfile store failed:", err);
      return { success: false, message: err.message || "Failed to update profile" };
    }
  },

  updateAvatar: async (avatar) => {
    try {
      const res = await userService.updateAvatar(avatar);
      set((state) => {
        if (!state.user) return {};
        return {
          user: {
            ...state.user,
            avatar: res.user.avatar,
          },
        };
      });
      return { success: true };
    } catch (err: any) {
      console.error("updateAvatar store failed:", err);
      return { success: false, message: err.message || "Failed to update avatar" };
    }
  },

  connectSocket: (roomId, token) => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3007";
    const s = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
      forceNew: true,
    });
    socket = s;

    const handleJoin = () => {
      console.log("Connected to socket-service, emitting join_room with roomId:", roomId);
      s.emit("join_room", { roomId });
    };

    if (s.connected) {
      handleJoin();
    } else {
      s.on("connect", handleJoin);
    }

    s.on("user_joined", async (payload: any) => {
      console.log("Player joined real-time:", payload);
      const username = payload.data?.username || "A player";
      get().addMessage("System", `${username} has joined the den.`, "lobby");
      await get().refreshRoomPlayers(roomId);
    });

    s.on("user_left", async (payload: any) => {
      console.log("Player left real-time:", payload);
      const username = payload.data?.username || "A player";
      get().addMessage("System", `${username} has left the den.`, "lobby");
      await get().refreshRoomPlayers(roomId);
    });

    s.on("new_chat", (payload: any) => {
      console.log("Received new chat message:", payload);
      const { senderUsername, message, chatType, createdAt } = payload.data || {};
      get().addMessage(
        senderUsername || "System",
        message || "",
        chatType || "lobby",
        createdAt
      );
    });

    s.on("game_started", async (payload: any) => {
      console.log("Game started real-time:", payload);
      const gameId = payload.data?.gameId;
      set((state) => {
        if (!state.room) return {};
        return {
          room: {
            ...state.room,
            status: "playing"
          },
          game: {
            id: gameId || "",
            day: 1,
            phase: "night",
            phaseEndTime: Date.now() + 30 * 1000,
            myRole: null,
            submittedAction: false,
            votes: [],
            results: null,
            players: [],
          }
        };
      });
      get().addMessage("System", "Nightfall has arrived. The village falls asleep...", "public");

      if (gameId) {
        console.log("Emitting join_game on game_started for gameId:", gameId);
        s.emit("join_game", { gameId, channels: [] });

        await get().fetchGameState(gameId);
        await get().fetchMyRole(gameId);
      }
    });

    s.on("role_assigned", async (payload: any) => {
      console.log("Role assigned real-time:", payload);
      const gameId = get().game?.id;
      if (gameId) {
        await get().fetchMyRole(gameId);
      }
    });

    s.on("phase_changed", async (payload: any) => {
      console.log("Phase changed real-time:", payload);
      const { gameId, phase, currentDay, phaseEndTime } = payload.data || {};
      
      set((state) => {
        if (!state.game) return {};
        return {
          game: {
            ...state.game,
            id: gameId || state.game.id,
            day: currentDay || state.game.day,
            phase: phase || state.game.phase,
            phaseEndTime: phaseEndTime || state.game.phaseEndTime,
            submittedAction: false,
            votes: [],
          }
        };
      });

      const phaseText = phase === "night" 
        ? "Night has arrived. The village falls asleep." 
        : phase === "voting" 
          ? "Voting time. Select who is the werewolf." 
          : "Discussion time. Find the werewolf.";
      
      get().addMessage("System", phaseText, "public");

      if (gameId) {
        await get().fetchGameState(gameId);
      }
    });

    s.on("player_died", async (payload: any) => {
      console.log("Player died real-time:", payload);
      const { deaths } = payload.data || {};
      if (deaths && deaths.length > 0) {
        for (const dead of deaths) {
          const username = dead.username || "A player";
          get().addMessage("System", `${username} was found dead.`, "public");
        }
      }
      const gameId = get().game?.id;
      if (gameId) {
        await get().fetchGameState(gameId);
      }
    });

    s.on("winner", async (payload: any) => {
      console.log("Game finished real-time:", payload);
      const { gameId, winner } = payload.data || {};
      
      set((state) => {
        if (!state.game) return {};
        return {
          game: {
            ...state.game,
            phase: "finished",
          },
          room: state.room ? { ...state.room, status: "finished" } : null
        };
      });

      get().addMessage("System", `Game Over! The winners are: ${winner.toUpperCase()}`, "public");

      if (gameId) {
        await get().fetchGameResults(gameId);
      }
    });

    s.on("vote_update", (payload: any) => {
      console.log("Vote update real-time:", payload);
      const { votes } = payload.data || {};
      if (votes) {
        set((state) => {
          if (!state.game) return {};
          const mappedVotes = votes.map((v: any) => ({
            targetId: v.target_id,
            voterId: v.voter_id,
            voterUsername: v.voter_username || "A player",
          }));
          return {
            game: {
              ...state.game,
              votes: mappedVotes,
            }
          };
        });
      }
    });

    s.on("player_ready", (payload: any) => {
      console.log("Player ready real-time:", payload);
      const { userId, username, isReady } = payload.data || {};
      console.log("player_ready userId:", userId, "isReady:", isReady);
      if (!userId) {
        console.warn("player_ready: userId is missing, skipping");
        return;
      }
      set((state) => {
        if (!state.room) {
          console.warn("player_ready: state.room is null");
          return {};
        }
        console.log("player_ready: current players:", state.room.players.map(p => ({ id: p.id, name: p.name, isReady: p.isReady })));
        const updatedPlayers = state.room.players.map((p) =>
          p.id === userId ? { ...p, isReady } : p
        );
        const matched = updatedPlayers.some((p, i) => p !== state.room!.players[i]);
        console.log("player_ready: any player updated?", matched);
        return { room: { ...state.room, players: updatedPlayers } };
      });
      get().addMessage(
        "System",
        `${username || "A player"} is ${isReady ? "READY" : "NOT READY"}.`,
        "lobby"
      );
    });
  },

  refreshRoomPlayers: async (roomId) => {
    try {
      const res = await roomService.getPlayers(roomId);
      const mappedPlayers: Player[] = res.players.map((p) => ({
        id: p.user_id,
        name: p.username,
        isHost: p.is_host,
        isReady: p.is_ready || p.is_host,
        isAlive: p.is_alive,
      }));

      // Update room host info if it changed
      const host = mappedPlayers.find((p) => p.isHost);
      const hostName = host ? host.name : "Host";
      const hostId = host ? host.id : "";

      set((state) => {
        if (!state.room) return {};
        return {
          room: {
            ...state.room,
            players: mappedPlayers,
            totalPlayer: mappedPlayers.length,
            hostId,
            hostName,
          }
        };
      });
    } catch (err) {
      console.error("Failed to refresh players:", err);
    }
  },

  createRoom: async (name, maxPlayers, isPrivate, password) => {
    const user = get().user;
    if (!user) return { success: false, message: "User not logged in" };

    try {
      const response = await roomService.createRoom(
        name || `${user.username}'s Den`,
        maxPlayers,
        isPrivate,
        password
      );

      const roomData = response.room;

      const hostPlayer: Player = {
        id: user.id,
        name: user.username,
        isHost: true,
        isReady: true,
        isAlive: true,
      };

      set({
        room: {
          id: roomData.id,
          code: roomData.room_code,
          name: roomData.room_name,
          hostId: roomData.host_id,
          hostName: user.username,
          maxPlayers: roomData.max_players,
          status: roomData.status,
          isPrivate: roomData.is_private,
          players: [hostPlayer],
          totalPlayer: 1,
        },
        messages: [],
        view: "room",
        game: null,
      });

      const token = authService.getAccessToken();
      if (token) {
        get().connectSocket(roomData.id, token);
      }

      get().addMessage("System", `Room "${roomData.room_name}" created. Welcome to the Hunt.`, "lobby");

      return { success: true };
    } catch (err: any) {
      console.error("Create Room failed:", err);
      return { success: false, message: err.message || "Failed to create room" };
    }
  },

  joinRoom: async (code, password) => {
    const user = get().user;
    if (!user) return { success: false, message: "User not logged in" };

    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      return {
        success: false,
        message: "Room code must be exactly 6 characters",
      };
    }

    try {
      const response = await roomService.joinRoom(cleanCode, password);
      const roomData = response.room;

      // Fetch details to get players list
      const detailResponse = await roomService.getRoomDetail(roomData.id);
      const mappedPlayers: Player[] = detailResponse.players.map((p) => ({
        id: p.user_id,
        name: p.username,
        isHost: p.is_host,
        isReady: p.is_ready || p.is_host,
        isAlive: p.is_alive,
      }));

      const host = mappedPlayers.find((p) => p.isHost);
      const hostName = host ? host.name : "Host";

      set({
        room: {
          id: roomData.id,
          code: roomData.room_code,
          name: roomData.room_name,
          hostId: roomData.host_id,
          hostName,
          maxPlayers: roomData.max_players,
          status: roomData.status,
          isPrivate: roomData.is_private,
          players: mappedPlayers,
          totalPlayer: mappedPlayers.length,
        },
        messages: [],
        view: "room",
        game: null,
      });

      const token = authService.getAccessToken();
      if (token) {
        get().connectSocket(roomData.id, token);
      }

      get().addMessage("System", `Joined Room "${roomData.room_name}" (${cleanCode}). Align with your pack.`, "lobby");

      return { success: true };
    } catch (err: any) {
      console.error("Join Room failed:", err);
      return { success: false, message: err.message || "Failed to join room" };
    }
  },

  leaveRoom: async () => {
    const room = get().room;
    if (room) {
      try {
        await roomService.leaveRoom(room.id);
      } catch (err) {
        console.error("Leave room API failed:", err);
      }
    }

    if (socket) {
      socket.disconnect();
      socket = null;
    }

    set({
      room: null,
      messages: [],
      view: "lobby",
      game: null,
    });
  },

  toggleReady: async () => {
    const room = get().room;
    const user = get().user;
    if (!room || !user) return;

    // Optimistic update — flip ready state immediately for self
    const prevPlayers = room.players;
    const myCurrentReady = room.players.find((p) => p.id === user.id)?.isReady ?? false;
    set((state) => {
      if (!state.room) return {};
      return {
        room: {
          ...state.room,
          players: state.room.players.map((p) =>
            p.id === user.id ? { ...p, isReady: !myCurrentReady } : p
          ),
        },
      };
    });

    try {
      await roomService.toggleReady(room.id);
      // Real-time update for other players will arrive via socket player_ready event
    } catch (err) {
      console.error("Toggle ready failed:", err);
      // Rollback on error
      set((state) => {
        if (!state.room) return {};
        return { room: { ...state.room, players: prevPlayers } };
      });
    }
  },

  sendChatMessage: async (message, chatType) => {
    const room = get().room;
    if (!room) return;
    const game = get().game;
    const gameId = game ? game.id : null;
    try {
      await chatService.sendChatMessage(room.id, gameId, chatType, message);
    } catch (err) {
      console.error("Failed to send chat message:", err);
    }
  },

  addMessage: (sender, text, chat_type, createdAt) => {
    set((state) => ({
      messages: [
        ...state.messages,
        {
          sender,
          text,
          time: new Date(createdAt || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          chat_type,
        },
      ],
    }));
  },

  startGame: async () => {
    const room = get().room;
    if (!room) return;
    try {
      await gameService.startGame(room.id);
    } catch (err: any) {
      console.error("Start Game failed:", err);
      get().addMessage("System", `Gagal memulai game: ${err.message || "Server Error"}`, "lobby");
    }
  },

  fetchGameState: async (gameId) => {
    try {
      const stateResponse = await gameService.getGameState(gameId);
      const playersResponse = await gameService.getPlayers(gameId);

      set((state) => {
        if (!state.game) return {};
        
        const mappedPlayers = playersResponse.players.map((p: any) => ({
          userId: p.userId,
          username: p.username,
          avatar: p.avatar,
          isAlive: p.isAlive,
          roleName: p.roleName,
          team: p.team,
        }));

        return {
          game: {
            ...state.game,
            day: stateResponse.game.current_day,
            phase: stateResponse.game.phase,
            phaseEndTime: stateResponse.phaseEndTime,
            players: mappedPlayers,
          }
        };
      });
    } catch (err) {
      console.error("Failed to fetch game state:", err);
    }
  },

  fetchMyRole: async (gameId) => {
    try {
      const response = await gameService.getMyRole(gameId);
      set((state) => {
        if (!state.game) return {};
        return {
          game: {
            ...state.game,
            myRole: response.role,
          }
        };
      });

      // Join game socket channels (especially werewolf channel)
      if (socket) {
        const channels: string[] = [];
        if (response.role?.roleName === "Werewolf") {
          channels.push("werewolf");
        }
        console.log("Emitting join_game with channels:", channels);
        socket.emit("join_game", { gameId, channels });
      }
    } catch (err) {
      console.error("Failed to fetch my role:", err);
    }
  },

  fetchActiveGame: async (roomId) => {
    try {
      const response = await gameService.getActiveGame(roomId);
      const gameId = response.gameId;
      if (gameId) {
        set((state) => {
          if (state.game) return {};
          return {
            game: {
              id: gameId,
              day: response.game?.current_day || 1,
              phase: response.game?.phase || "night",
              phaseEndTime: null,
              myRole: null,
              submittedAction: false,
              votes: [],
              results: null,
              players: [],
            }
          };
        });

        if (socket) {
          console.log("Emitting join_game on active game recovery for gameId:", gameId);
          socket.emit("join_game", { gameId, channels: [] });
        }

        await get().fetchGameState(gameId);
        await get().fetchMyRole(gameId);
      }
    } catch (err) {
      console.error("Failed to fetch active game:", err);
    }
  },

  submitNightAction: async (targetId, actionType) => {
    const game = get().game;
    if (!game) return;

    try {
      await gameService.submitNightAction(game.id, targetId, actionType);
      set((state) => {
        if (!state.game) return {};
        return {
          game: {
            ...state.game,
            submittedAction: true,
          }
        };
      });
      get().addMessage("System", `Aksi malam telah disubmit.`, "public");
    } catch (err: any) {
      console.error("Failed to submit night action:", err);
      get().addMessage("System", `Aksi gagal: ${err.message || "Server Error"}`, "public");
    }
  },

  submitVote: async (targetId) => {
    const game = get().game;
    if (!game) return;

    try {
      await voteService.submitVote(game.id, targetId);
      set((state) => {
        if (!state.game) return {};
        return {
          game: {
            ...state.game,
            submittedAction: true,
          }
        };
      });
      get().addMessage("System", `Vote telah disubmit.`, "public");
    } catch (err: any) {
      console.error("Failed to submit vote:", err);
      get().addMessage("System", `Vote gagal: ${err.message || "Server Error"}`, "public");
    }
  },

  fetchGameResults: async (gameId) => {
    try {
      const response = await gameService.getGameResults(gameId);
      set((state) => {
        if (!state.game) return {};
        return {
          game: {
            ...state.game,
            results: response.results,
          }
        };
      });
    } catch (err) {
      console.error("Failed to fetch game results:", err);
    }
  },
}));
