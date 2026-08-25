import type { RoomState } from "../api/room/route";

export type { RoomState } from "../api/room/route";

export async function createRoom() {
  const response = await fetch("/api/room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create" }),
  });
  return readResponse(response);
}

export async function joinRoom(room: string) {
  const response = await fetch("/api/room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "join", room }),
  });
  return readResponse(response);
}

export async function getRoom(room: string) {
  const response = await fetch(`/api/room?room=${encodeURIComponent(room)}`);
  return readResponse(response);
}

export async function updateRoom(room: string, state: RoomState) {
  const response = await fetch("/api/room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", room, state }),
  });
  return readResponse(response);
}

export async function updatePlayerTokens(
  room: string,
  role: string,
  tokens: number,
) {
  const response = await fetch("/api/room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update-player", room, role, tokens }),
  });
  return readResponse(response);
}

async function readResponse(response: Response) {
  const data = (await response.json()) as {
    error?: string;
    room?: string;
    state?: RoomState;
  };
  if (!response.ok || !data.state || !data.room) {
    throw new Error(data.error || "房间服务暂时不可用");
  }
  return data;
}
