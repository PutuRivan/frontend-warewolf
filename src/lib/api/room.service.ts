import { request } from "./auth.service";

export interface Player {
  id: string; // connection id
  user_id: string;
  username: string;
  avatar: string | null;
  level: number;
  is_host: boolean;
  is_alive: boolean;
  is_ready: boolean;
  joined_at: string;
}

export interface Room {
  id: string;
  room_code: string;
  host_id: string;
  room_name: string;
  max_players: number;
  status: "waiting" | "playing" | "finished";
  is_private: boolean;
  created_at: string;
}

export interface CreateRoomResponse {
  message: string;
  room: Room;
}

export interface JoinRoomResponse {
  message: string;
  room: Room;
}

export interface RoomDetailResponse {
  room: Room;
  players: Player[];
}

export interface PlayersResponse {
  players: Player[];
}

export async function createRoom(
  roomName: string,
  maxPlayers = 8,
  isPrivate = false,
  password?: string
): Promise<CreateRoomResponse> {
  return request("/rooms", {
    method: "POST",
    body: JSON.stringify({ roomName, maxPlayers, isPrivate, password }),
  });
}

export async function joinRoom(
  roomCode: string,
  password?: string
): Promise<JoinRoomResponse> {
  return request("/rooms/join", {
    method: "POST",
    body: JSON.stringify({ roomCode, password }),
  });
}

export async function leaveRoom(roomId: string): Promise<{ message: string; newHostId: string | null }> {
  return request(`/rooms/${roomId}/leave`, {
    method: "POST",
  });
}

export async function getRoomDetail(roomId: string): Promise<RoomDetailResponse> {
  return request(`/rooms/${roomId}`);
}

export async function getPlayers(roomId: string): Promise<PlayersResponse> {
  return request(`/rooms/${roomId}/players`);
}

export async function getActiveRoom(): Promise<RoomDetailResponse> {
  return request("/rooms/active");
}

export async function toggleReady(roomId: string): Promise<{ message: string; isReady: boolean }> {
  return request(`/rooms/${roomId}/ready`, {
    method: "PUT",
  });
}
