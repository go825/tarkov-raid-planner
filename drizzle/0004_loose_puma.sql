ALTER TABLE `player_profiles` ADD `player_level` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `raid_plans` ADD `checklist_state` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `raid_plans` ADD `assignments` text DEFAULT '{}' NOT NULL;