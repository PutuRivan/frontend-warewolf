import { create } from "zustand";
import * as authService from "@/lib/api/auth.service";
import * as roomService from "@/lib/api/room.service";
import * as chatService from "@/lib/api/chat.service";
import * as gameService from "@/lib/api/game.service";
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
  status: "waiting" | "playing" | "finished";
  isPrivate: boolean;
  password?: string;
  players: Player[];
  totalPlayer: number;
}

export interface UserState {
  id: string;
  username: string;
  email: string;
  token: string;
  point: number;
  coin: number;
  level: number;
  exp: number;
}

export interface Message {
  sender: string;
  text: string;
  time: string;
  chat_type: ChatType;
}

interface GameStore {
  user: UserState | null;
  view: ViewType;
  authMode: AuthModeType;
  room: RoomState | null;
  messages: Message[];

  // Actions
  setView: (view: ViewType) => void;
  setAuthMode: (mode: AuthModeType) => void;
  login: (username: string) => void;
  register: (username: string, email: string) => void;
  logout: () => void;
  createRoom: (
    name: string,
    maxPlayers: number,
    isPrivate: boolean,
    password?: string,
  ) => Promise<{ success: boolean; message?: string }>;
  joinRoom: (code: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  leaveRoom: () => Promise<void>;
  toggleReady: (username: string) => void;
  addMessage: (sender: string, text: string, chat_type: ChatType, createdAt?: string) => void;
  sendChatMessage: (message: string, chatType: ChatType) => Promise<void>;
  startGame: () => Promise<void>;
  connectSocket: (roomId: string, token: string) => void;
  refreshRoomPlayers: (roomId: string) => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  user: null,
  view: "landing",
  authMode: "login",
  room: null,
  messages: [],

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
    });
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

    s.on("game_started", (payload: any) => {
      console.log("Game started real-time:", payload);
      set((state) => {
        if (!state.room) return {};
        return {
          room: {
            ...state.room,
            status: "playing"
          }
        };
      });
      get().addMessage("System", "Nightfall has arrived. The village falls asleep...", "public");
    });
  },

  refreshRoomPlayers: async (roomId) => {
    try {
      const res = await roomService.getPlayers(roomId);
      const mappedPlayers: Player[] = res.players.map((p) => ({
        id: p.user_id,
        name: p.username,
        isHost: p.is_host,
        isReady: p.is_host, // Host is implicitly ready
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
        isReady: p.is_host,
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
    });
  },

  toggleReady: (username) => {
    // Purely local UI feedback since backend does not track isReady in database
    const room = get().room;
    if (!room) return;

    const updatedPlayers = room.players.map((p) =>
      p.name === username ? { ...p, isReady: !p.isReady } : p,
    );

    set({
      room: {
        ...room,
        players: updatedPlayers,
      },
    });

    const player = updatedPlayers.find((p) => p.name === username);
    if (player) {
      get().addMessage(
        "System",
        `${player.name} is ${player.isReady ? "READY" : "NOT READY"}.`,
        room.status === "waiting" ? "lobby" : "public",
      );
    }
  },

  sendChatMessage: async (message, chatType) => {
    const room = get().room;
    if (!room) return;
    try {
      await chatService.sendChatMessage(room.id, null, chatType, message);
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
}));
