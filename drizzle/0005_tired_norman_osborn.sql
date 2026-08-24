CREATE TABLE `task_progress` (
	`user_id` text NOT NULL,
	`game_mode` text DEFAULT 'regular' NOT NULL,
	`task_states` text DEFAULT '{}' NOT NULL,
	`objective_states` text DEFAULT '{}' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `game_mode`)
);
