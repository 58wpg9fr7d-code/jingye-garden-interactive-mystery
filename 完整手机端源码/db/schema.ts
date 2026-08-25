import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jingyeRooms = sqliteTable("jingye_rooms", {
  roomCode: text("room_code").primaryKey(),
  stateJson: text("state_json").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
