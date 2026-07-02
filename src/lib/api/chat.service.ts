import { request } from "./auth.service";

export async function sendChatMessage(
  roomId: string,
  gameId: string | null,
  chatType: string,
  message: string
): Promise<any> {
  return request("/chat", {
    method: "POST",
    body: JSON.stringify({ roomId, gameId, chatType, message }),
  });
}
