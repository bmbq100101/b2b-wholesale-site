CREATE TABLE `proformaInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`piNumber` varchar(50) NOT NULL,
	`sampleRequestId` int NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`totalAmount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`issueDate` timestamp NOT NULL DEFAULT (now()),
	`dueDate` timestamp,
	`status` enum('draft','issued','accepted','rejected','paid') NOT NULL DEFAULT 'issued',
	`paymentTerms` varchar(100),
	`deliveryTerms` varchar(100),
	`notes` text,
	`pdfUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proformaInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `proformaInvoices_piNumber_unique` UNIQUE(`piNumber`)
);
--> statement-breakpoint
CREATE TABLE `sampleRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`status` enum('pending','approved','shipped','delivered','rejected') NOT NULL DEFAULT 'pending',
	`requestDate` timestamp NOT NULL DEFAULT (now()),
	`approvalDate` timestamp,
	`shippingDate` timestamp,
	`deliveryDate` timestamp,
	`trackingNumber` varchar(100),
	`notes` text,
	`piNumber` varchar(50),
	`shippingAddress` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sampleRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shippingLabels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`labelNumber` varchar(50) NOT NULL,
	`sampleRequestId` int NOT NULL,
	`trackingNumber` varchar(100) NOT NULL,
	`carrier` varchar(50) NOT NULL,
	`shippingMethod` varchar(50) NOT NULL,
	`weight` int,
	`dimensions` varchar(100),
	`estimatedDelivery` timestamp,
	`actualDelivery` timestamp,
	`cost` int,
	`pdfUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shippingLabels_id` PRIMARY KEY(`id`),
	CONSTRAINT `shippingLabels_labelNumber_unique` UNIQUE(`labelNumber`)
);
