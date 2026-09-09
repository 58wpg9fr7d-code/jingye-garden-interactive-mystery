type PlayerRole = "向沉" | "胡谋" | "章貘" | "朱渴焰" | "牛守拙";

export type RoomState = {
  unlockedAct: number;
  actOneScriptStage: number;
  actTwoScriptStage: number;
  actThreeScriptStage: number;
  currentGame: number;
  tokensByRole: Record<PlayerRole, number>;
  updatedAt: number;
};

const initialState = (): RoomState => ({
  unlockedAct: 0,
  actOneScriptStage: 0,
  actTwoScriptStage: 0,
  actThreeScriptStage: 0,
  currentGame: 0,
  tokensByRole: {
    向沉: 100,
    胡谋: 100,
    章貘: 100,
    朱渴焰: 150,
    牛守拙: 90,
  },
  updatedAt: Date.now(),
});

type RoomRecord = { code: string; state: RoomState };

const localRooms = new Map<string, RoomRecord>();
const schemaSql = `CREATE TABLE IF NOT EXISTS jingye_rooms (
  room_code TEXT PRIMARY KEY,
  state_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
)`;

async function database(): Promise<D1Database | null> {
  try {
    const workerRuntime = (await import("cloudflare:workers")) as unknown as {
      env?: { DB?: D1Database };
    };
    return workerRuntime.env?.DB ?? null;
  } catch {
    // The local Node preview does not provide the Cloudflare module.
    // Fall back to the in-memory room store; deployed Workers still use D1.
    return null;
  }
}

async function ensureSchema(db: D1Database) {
  await db.prepare(schemaSql).run();
}

function makeCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function readRoom(code: string): Promise<RoomRecord | null> {
  const db = await database();
  if (!db) return localRooms.get(code) ?? null;
  await ensureSchema(db);
  const row = await db
    .prepare("SELECT room_code, state_json FROM jingye_rooms WHERE room_code = ?")
    .bind(code)
    .first<{ room_code: string; state_json: string }>();
  if (!row) return null;
  return { code: row.room_code, state: JSON.parse(row.state_json) as RoomState };
}

async function writeRoom(record: RoomRecord) {
  const db = await database();
  if (!db) {
    localRooms.set(record.code, record);
    return;
  }
  await ensureSchema(db);
  await db
    .prepare(
      "INSERT INTO jingye_rooms (room_code, state_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(room_code) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at",
    )
    .bind(record.code, JSON.stringify(record.state), record.state.updatedAt)
    .run();
}

function response(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("room")?.trim().toUpperCase();
  if (!code) return response({ error: "缺少房间码" }, 400);
  const room = await readRoom(code);
  if (!room) return response({ error: "房间不存在或已失效" }, 404);
  return response({ room: room.code, state: room.state });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: "create" | "join" | "update" | "update-player";
    room?: string;
    role?: PlayerRole;
    state?: RoomState;
    tokens?: number;
  };

  if (body.action === "create") {
    let code = makeCode();
    while (await readRoom(code)) code = makeCode();
    const state = initialState();
    await writeRoom({ code, state });
    return response({ room: code, state }, 201);
  }

  const code = body.room?.trim().toUpperCase();
  if (!code) return response({ error: "缺少房间码" }, 400);
  const room = await readRoom(code);
  if (!room) return response({ error: "房间不存在或已失效" }, 404);

  if (body.action === "join") return response({ room: code, state: room.state });

  if (body.action === "update" && body.state) {
    const state = { ...body.state, updatedAt: Date.now() };
    await writeRoom({ code, state });
    return response({ room: code, state });
  }

  if (body.action === "update-player" && body.role && typeof body.tokens === "number") {
    const state: RoomState = {
      ...room.state,
      tokensByRole: {
        ...room.state.tokensByRole,
        [body.role]: Math.max(0, Math.round(body.tokens)),
      },
      updatedAt: Date.now(),
    };
    await writeRoom({ code, state });
    return response({ room: code, state });
  }

  return response({ error: "无法识别的房间操作" }, 400);
}
