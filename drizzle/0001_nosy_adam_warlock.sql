CREATE TABLE `activity_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`userId` int NOT NULL,
	`moduleId` int NOT NULL,
	`score` int NOT NULL,
	`notes` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`childId` int NOT NULL,
	`clinicName` varchar(512) NOT NULL,
	`clinicAddress` text,
	`appointmentDate` date NOT NULL,
	`preferredTime` varchar(64) NOT NULL,
	`guardianName` varchar(256) NOT NULL,
	`guardianPhone` varchar(32) NOT NULL,
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`notes` text,
	`reminderSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `children` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`age` int NOT NULL,
	`birthdate` date NOT NULL,
	`gender` enum('male','female','other') NOT NULL,
	`isClinicallyDiagnosed` boolean NOT NULL DEFAULT false,
	`diagnosisDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `children_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ageGroup` enum('toddler','early_childhood') NOT NULL,
	`skillCategory` enum('cognitive','social','integrative') NOT NULL,
	`moduleNumber` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`subtitle` varchar(512),
	`description` text,
	`content` text NOT NULL,
	`weeklyTip` text,
	`theoreticalFoundations` text,
	`frequency` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `modules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`type` enum('appointment_booked','appointment_upcoming','appointment_followup','general') NOT NULL DEFAULT 'general',
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `fullName` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `birthdate` date;--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `language` enum('en','fil') DEFAULT 'en' NOT NULL;