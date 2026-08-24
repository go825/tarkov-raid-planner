import { sql } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const raidPlans = sqliteTable("raid_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  map: text("map").notNull(),
  selectedTaskIds: text("selected_task_ids").notNull().default("[]"),
  routeTaskIds: text("route_task_ids").notNull().default("[]"),
  shareId: text("share_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("raid_plans_user_map_idx").on(table.userId, table.map),
  uniqueIndex("raid_plans_share_id_idx").on(table.shareId),
]);
