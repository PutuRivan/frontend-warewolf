import { request } from "./auth.service";

export async function startGame(roomId: string): Promise<any> {
  return request("/games", {
    method: "POST",
    body: JSON.stringify({ roomId }),
  });
}
