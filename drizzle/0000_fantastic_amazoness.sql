CREATE TABLE `raid_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`map` text NOT NULL,
	`selected_task_ids` text DEFAULT '[]' NOT NULL,
	`route_task_ids` text DEFAULT '[]' NOT NULL,
	`share_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `raid_plans_user_map_idx` ON `raid_plans` (`user_id`,`map`);--> statement-breakpoint
CREATE UNIQUE INDEX `raid_plans_share_id_idx` ON `raid_plans` (`share_id`);