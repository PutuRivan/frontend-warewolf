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
