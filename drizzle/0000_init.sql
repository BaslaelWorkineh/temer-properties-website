CREATE TABLE `admin_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`last_login_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference` text NOT NULL,
	`property_id` integer,
	`project_id` integer,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`visit_date` text NOT NULL,
	`time_slot` text NOT NULL,
	`visit_type` text DEFAULT 'in_person' NOT NULL,
	`party_size` integer DEFAULT 1 NOT NULL,
	`message` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_notes` text,
	`source` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_reference_unique` ON `bookings` (`reference`);--> statement-breakpoint
CREATE INDEX `bookings_slot_idx` ON `bookings` (`visit_date`,`time_slot`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`company` text,
	`interest` text DEFAULT 'other' NOT NULL,
	`message` text,
	`property_id` integer,
	`project_id` integer,
	`status` text DEFAULT 'new' NOT NULL,
	`admin_notes` text,
	`source` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `inquiries_status_idx` ON `inquiries` (`status`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`city` text DEFAULT 'Addis Ababa' NOT NULL,
	`summary` text,
	`description` text,
	`highlights` text DEFAULT '[]' NOT NULL,
	`faqs` text DEFAULT '[]' NOT NULL,
	`image` text,
	`latitude` real,
	`longitude` real,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `locations_slug_unique` ON `locations` (`slug`);--> statement-breakpoint
CREATE INDEX `locations_published_idx` ON `locations` (`is_published`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text DEFAULT '' NOT NULL,
	`cover_image` text,
	`author_name` text DEFAULT 'Temer Properties' NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`seo_title` text,
	`seo_description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_published_idx` ON `posts` (`is_published`,`published_at`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`location_id` integer,
	`status` text DEFAULT 'under_construction' NOT NULL,
	`category` text,
	`summary` text,
	`description` text,
	`total_units` integer,
	`floors` integer,
	`unit_types` text DEFAULT '[]' NOT NULL,
	`amenities` text DEFAULT '[]' NOT NULL,
	`payment_plan` text,
	`completion` text,
	`address` text,
	`latitude` real,
	`longitude` real,
	`images` text DEFAULT '[]' NOT NULL,
	`video_url` text,
	`faqs` text DEFAULT '[]' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `projects_location_idx` ON `projects` (`location_id`);--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE TABLE `properties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`type` text DEFAULT 'apartment' NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`project_id` integer,
	`location_id` integer,
	`price` integer,
	`promo` text,
	`bedrooms` integer,
	`bathrooms` integer,
	`area_sqm` real,
	`floor` integer,
	`completion` text,
	`summary` text,
	`description` text,
	`features` text DEFAULT '[]' NOT NULL,
	`payment_plan` text,
	`images` text DEFAULT '[]' NOT NULL,
	`video_url` text,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `properties_slug_unique` ON `properties` (`slug`);--> statement-breakpoint
CREATE INDEX `properties_published_idx` ON `properties` (`is_published`,`status`);--> statement-breakpoint
CREATE INDEX `properties_type_idx` ON `properties` (`type`);--> statement-breakpoint
CREATE INDEX `properties_location_idx` ON `properties` (`location_id`);--> statement-breakpoint
CREATE INDEX `properties_project_idx` ON `properties` (`project_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);