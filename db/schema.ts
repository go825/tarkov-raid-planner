import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const raidPlans = sqliteTable("raid_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  map: text("map").notNull(),
  selectedTaskIds: text("selected_task_ids").notNull().default("[]"),
  routeTaskIds: text("route_task_ids").notNull().default("[]"),
  shareId: text("share_id").notNull(),
  ownerName: text("owner_name").notNull().default("Owner"),
  ownerReady: integer("owner_ready", {mode:"boolean"}).notNull().default(false),
  revision: integer("revision").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("raid_plans_user_map_idx").on(table.userId, table.map),
  uniqueIndex("raid_plans_share_id_idx").on(table.shareId),
]);

export const planMembers = sqliteTable("plan_members", {
  planId: text("plan_id").notNull().references(() => raidPlans.id, {onDelete:"cascade"}),
  userId: text("user_id").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("MEMBER"),
  ready: integer("ready", {mode:"boolean"}).notNull().default(false),
  joinedAt: text("joined_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [primaryKey({columns:[table.planId,table.userId]})]);
