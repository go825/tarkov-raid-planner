CREATE TABLE `plan_members` (
	`plan_id` text NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`ready` integer DEFAULT false NOT NULL,
	`joined_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`plan_id`, `user_id`),
	FOREIGN KEY (`plan_id`) REFERENCES `raid_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `raid_plans` ADD `owner_name` text DEFAULT 'Owner' NOT NULL;--> statement-breakpoint
ALTER TABLE `raid_plans` ADD `revision` integer DEFAULT 1 NOT NULL;