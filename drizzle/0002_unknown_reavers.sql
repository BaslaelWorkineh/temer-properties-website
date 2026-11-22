ALTER TABLE `locations` ADD `translations` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `translations` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `translations` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `translations` text DEFAULT '{}' NOT NULL;