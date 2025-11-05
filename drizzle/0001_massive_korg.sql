CREATE TABLE `buyerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255),
	`companyType` varchar(100),
	`country` varchar(100),
	`businessLicense` varchar(255),
	`verificationStatus` enum('pending','verified','rejected') DEFAULT 'pending',
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `buyerProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `buyerProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`image` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `certifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`certificateUrl` varchar(512),
	`expiryDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conditionGrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grade` varchar(10) NOT NULL,
	`description` text,
	`priceMultiplier` varchar(10) NOT NULL,
	CONSTRAINT `conditionGrades_id` PRIMARY KEY(`id`),
	CONSTRAINT `conditionGrades_grade_unique` UNIQUE(`grade`)
);
--> statement-breakpoint
CREATE TABLE `pricingTiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`minQuantity` int NOT NULL,
	`maxQuantity` int,
	`price` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pricingTiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productCertifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`certificationId` int NOT NULL,
	CONSTRAINT `productCertifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`categoryId` int NOT NULL,
	`conditionGrade` varchar(10) NOT NULL,
	`basePrice` int NOT NULL,
	`moq` int NOT NULL DEFAULT 1,
	`stock` int NOT NULL DEFAULT 0,
	`images` text,
	`specifications` text,
	`sku` varchar(100) NOT NULL,
	`weight` varchar(50),
	`dimensions` varchar(100),
	`origin` varchar(100) DEFAULT 'Dongguan, China',
	`featured` int DEFAULT 0,
	`active` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `rfqInquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`companyName` varchar(255),
	`contactName` varchar(255),
	`email` varchar(320),
	`phone` varchar(20),
	`country` varchar(100),
	`message` text,
	`status` enum('pending','quoted','accepted','rejected') DEFAULT 'pending',
	`quotedPrice` int,
	`quotedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rfqInquiries_id` PRIMARY KEY(`id`)
);
