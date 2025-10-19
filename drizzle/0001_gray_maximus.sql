CREATE TABLE `scenarios` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`data` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scenarios_id` PRIMARY KEY(`id`)
);
