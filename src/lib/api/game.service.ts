import { request } from "./auth.service";

export async function startGame(roomId: string): Promise<any> {
  return request("/games", {
    method: "POST",
    body: JSON.stringify({ roomId }),
  });
}

export async function getGameState(gameId: string): Promise<any> {
  return request(`/games/${gameId}`);
}

export async function getPlayers(gameId: string): Promise<any> {
  return request(`/games/${gameId}/players`);
}

export async function getMyRole(gameId: string): Promise<any> {
  return request(`/games/${gameId}/my-role`);
}

export async function submitNightAction(
  gameId: string,
  targetId: string,
  actionType: string
): Promise<any> {
  return request(`/games/${gameId}/night-action`, {
    method: "POST",
    body: JSON.stringify({ targetId, actionType }),
  });
}

export async function getGameResults(gameId: string): Promise<any> {
  return request(`/games/${gameId}/results`);
}

export async function getActiveGame(roomId: string): Promise<any> {
  return request(`/games/active/room/${roomId}`);
}
