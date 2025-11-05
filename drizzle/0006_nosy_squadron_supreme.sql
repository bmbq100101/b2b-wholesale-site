CREATE TABLE `faqCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`order` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faqCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `faqCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `faqItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`question` varchar(500) NOT NULL,
	`answer` text NOT NULL,
	`order` int DEFAULT 0,
	`views` int DEFAULT 0,
	`helpful` int DEFAULT 0,
	`notHelpful` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faqItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqSearchIndex` (
	`id` int AUTO_INCREMENT NOT NULL,
	`faqItemId` int NOT NULL,
	`searchText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `faqSearchIndex_id` PRIMARY KEY(`id`)
);
