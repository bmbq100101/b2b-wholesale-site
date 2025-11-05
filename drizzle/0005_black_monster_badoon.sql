CREATE TABLE `inquiryNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inquiryId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`productSku` varchar(100),
	`pageUrl` varchar(500),
	`customerEmail` varchar(255) NOT NULL,
	`customerPhone` varchar(20),
	`emailSent` boolean DEFAULT false,
	`smsSent` boolean DEFAULT false,
	`emailSentAt` timestamp,
	`smsSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiryNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smsConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(50) NOT NULL,
	`apiKey` varchar(500) NOT NULL,
	`apiSecret` varchar(500),
	`phoneNumber` varchar(20) NOT NULL,
	`enabled` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smsConfig_id` PRIMARY KEY(`id`)
);
