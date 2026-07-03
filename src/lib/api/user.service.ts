import { request } from "./auth.service";

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar: string | null;
  level: number;
  exp: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  page: number;
  limit: number;
}

export async function getLeaderboard(page = 1, limit = 10): Promise<LeaderboardResponse> {
  return request(`/users/leaderboard?page=${page}&limit=${limit}`);
}

export async function updateProfile(username: string): Promise<any> {
  return request("/users/profile", {
    method: "PUT",
    body: JSON.stringify({ username }),
  });
}

export async function updateAvatar(avatar: string): Promise<any> {
  return request("/users/avatar", {
    method: "PUT",
    body: JSON.stringify({ avatar }),
  });
}
