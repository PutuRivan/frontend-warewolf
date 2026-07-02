import { request } from "./auth.service";

export async function submitVote(gameId: string, targetId: string): Promise<any> {
  return request("/votes", {
    method: "POST",
    body: JSON.stringify({ gameId, targetId }),
  });
}

export async function getMyVote(gameId: string): Promise<any> {
  return request(`/votes/${gameId}/my-vote`);
}

export async function getVotes(gameId: string): Promise<any> {
  return request(`/votes/${gameId}`);
}
