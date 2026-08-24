CREATE TABLE `player_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`faction` text DEFAULT 'pmc' NOT NULL,
	`key_ids` text DEFAULT '[]' NOT NULL,
	`allow_powered` integer DEFAULT false NOT NULL,
	`allow_conditional_extracts` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
