import { create } from "zustand";

export type ViewType = "landing" | "auth" | "lobby" | "room" | "leaderboard";
export type AuthModeType = "login" | "register";
export type ChatType = "lobby" | "public" | "werewolf" | "dead";

export interface Player {
  id: string; // uuid
  name: string;
  isHost: boolean;
  isReady: boolean;
  isAlive: boolean;
}

export interface RoomState {
  id: string; // uuid
  code: string; // room_code
  name: string; // room_name
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
  ) => void;
  joinRoom: (code: string) => { success: boolean; message?: string };
  leaveRoom: () => void;
  toggleReady: (username: string) => void;
  addMockMessage: (sender: string, text: string, chat_type: ChatType) => void;
  startGame: () => void;
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
    set({
      user: {
        id: "mock-user-id-1",
        username,
        email: `${username.toLowerCase()}@mail.com`,
        token: "mock-jwt-token",
        point: 500, // matches default in Table-Database.md
        coin: 0, // matches default in Table-Database.md
        level: 1,
        exp: 0,
      },
      view: "lobby",
    });
  },

  register: (username, email) => {
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
    set({
      user: null,
      view: "landing",
      room: null,
      messages: [],
    });
  },

  createRoom: (name, maxPlayers, isPrivate, password) => {
    const user = get().user;
    if (!user) return;

    const mockRoomId = "mock-room-uuid";
    const mockCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const hostPlayer: Player = {
      id: user.id,
      name: user.username,
      isHost: true,
      isReady: true,
      isAlive: true,
    };

    const mockPlayers: Player[] = [
      hostPlayer,
      {
        id: "mock-user-id-2",
        name: "Alchemist_99",
        isHost: false,
        isReady: false,
        isAlive: true,
      },
      {
        id: "mock-user-id-3",
        name: "ShadowHunter",
        isHost: false,
        isReady: true,
        isAlive: true,
      },
      {
        id: "mock-user-id-4",
        name: "WolfBane",
        isHost: false,
        isReady: false,
        isAlive: true,
      },
    ];

    set({
      room: {
        id: mockRoomId,
        code: mockCode,
        name: name || `${user.username}'s Den`,
        hostId: user.id,
        hostName: user.username,
        maxPlayers,
        status: "waiting",
        isPrivate,
        password,
        players: mockPlayers,
        totalPlayer: mockPlayers.length,
      },
      messages: [
        {
          sender: "System",
          text: `Room "${name || `${user.username}'s Den`}" (${mockCode}) created. Welcome to the Hunt.`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          chat_type: "lobby",
        },
        {
          sender: "ShadowHunter",
          text: "Yo, ready to find some wolves!",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          chat_type: "lobby",
        },
      ],
      view: "room",
    });
  },

  joinRoom: (code) => {
    const user = get().user;
    if (!user) return { success: false, message: "User not logged in" };

    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      return {
        success: false,
        message: "Room code must be exactly 6 characters",
      };
    }

    const joiningPlayer: Player = {
      id: user.id,
      name: user.username,
      isHost: false,
      isReady: false,
      isAlive: true,
    };

    const mockPlayers: Player[] = [
      {
        id: "mock-user-id-5",
        name: "VampireSlayer",
        isHost: true,
        isReady: true,
        isAlive: true,
      },
      {
        id: "mock-user-id-6",
        name: "Moonlight_101",
        isHost: false,
        isReady: true,
        isAlive: true,
      },
      joiningPlayer,
      {
        id: "mock-user-id-7",
        name: "GhostWhisperer",
        isHost: false,
        isReady: false,
        isAlive: true,
      },
    ];

    set({
      room: {
        id: "mock-joined-room-id",
        code: cleanCode,
        name: "Gallows & Graves",
        hostId: "mock-user-id-5",
        hostName: "VampireSlayer",
        maxPlayers: 8,
        status: "waiting",
        isPrivate: false,
        players: mockPlayers,
        totalPlayer: mockPlayers.length,
      },
      messages: [
        {
          sender: "System",
          text: `Joined Room "Gallows & Graves" (${cleanCode}). Align with your pack.`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          chat_type: "lobby",
        },
        {
          sender: "VampireSlayer",
          text: "Welcome to the room! Mark yourself ready.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          chat_type: "lobby",
        },
      ],
      view: "room",
    });

    return { success: true };
  },

  leaveRoom: () => {
    set({
      room: null,
      messages: [],
      view: "lobby",
    });
  },

  toggleReady: (username) => {
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

    // Add a message about ready state toggle
    const player = updatedPlayers.find((p) => p.name === username);
    if (player) {
      get().addMockMessage(
        "System",
        `${player.name} is ${player.isReady ? "READY" : "NOT READY"}.`,
        room.status === "waiting" ? "lobby" : "public",
      );
    }
  },

  addMockMessage: (sender, text, chat_type) => {
    set((state) => ({
      messages: [
        ...state.messages,
        {
          sender,
          text,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          chat_type,
        },
      ],
    }));
  },

  startGame: () => {
    const room = get().room;
    if (!room) return;
    set({
      room: {
        ...room,
        status: "playing",
      },
    });
    get().addMockMessage(
      "System",
      "Nightfall has arrived. The village falls asleep...",
      "public",
    );
  },
}));
