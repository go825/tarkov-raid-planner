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
  checklistState: text("checklist_state").notNull().default("{}"),
  assignments: text("assignments").notNull().default("{}"),
  taskOwners: text("task_owners").notNull().default("{}"),
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

export const playerProfiles = sqliteTable("player_profiles", {
  userId: text("user_id").primaryKey(),
  faction: text("faction").notNull().default("pmc"),
  playerLevel: integer("player_level").notNull().default(1),
  keyIds: text("key_ids").notNull().default("[]"),
  allowPowered: integer("allow_powered", {mode:"boolean"}).notNull().default(false),
  allowConditionalExtracts: integer("allow_conditional_extracts", {mode:"boolean"}).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const taskProgress = sqliteTable("task_progress", {
  userId: text("user_id").notNull(),
  gameMode: text("game_mode").notNull().default("regular"),
  taskStates: text("task_states").notNull().default("{}"),
  objectiveStates: text("objective_states").notNull().default("{}"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [primaryKey({columns:[table.userId,table.gameMode]})]);
