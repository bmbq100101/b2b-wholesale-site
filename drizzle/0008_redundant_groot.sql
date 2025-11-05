CREATE TABLE `membershipDiscounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tierId` int NOT NULL,
	`productId` int,
	`categoryId` int,
	`discountPercentage` int NOT NULL,
	`discountAmount` int DEFAULT 0,
	`validFrom` timestamp DEFAULT (now()),
	`validUntil` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `membershipDiscounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `membershipHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fromTierId` int,
	`toTierId` int NOT NULL,
	`reason` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `membershipHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `membershipTiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`level` int NOT NULL,
	`description` text,
	`minAnnualPurchase` int NOT NULL DEFAULT 0,
	`discountPercentage` int NOT NULL DEFAULT 0,
	`additionalBenefits` text,
	`color` varchar(20) DEFAULT '#999999',
	`icon` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `membershipTiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `membershipTiers_level_unique` UNIQUE(`level`)
);
--> statement-breakpoint
CREATE TABLE `userMemberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tierId` int NOT NULL,
	`annualPurchaseAmount` int NOT NULL DEFAULT 0,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`upgradedAt` timestamp,
	`expiresAt` timestamp,
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userMemberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `userMemberships_userId_unique` UNIQUE(`userId`)
);
