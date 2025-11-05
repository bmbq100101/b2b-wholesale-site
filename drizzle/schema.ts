import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Product Categories
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  image: varchar("image", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Product Condition Grades
export const conditionGrades = mysqlTable("conditionGrades", {
  id: int("id").autoincrement().primaryKey(),
  grade: varchar("grade", { length: 10 }).notNull().unique(), // A, B, C
  description: text("description"),
  priceMultiplier: varchar("priceMultiplier", { length: 10 }).notNull(), // 1.0, 0.8, 0.6
});

export type ConditionGrade = typeof conditionGrades.$inferSelect;
export type InsertConditionGrade = typeof conditionGrades.$inferInsert;

// Products
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  categoryId: int("categoryId").notNull(),
  conditionGrade: varchar("conditionGrade", { length: 10 }).notNull(), // A, B, C
  basePrice: int("basePrice").notNull(), // in cents
  moq: int("moq").notNull().default(1), // Minimum Order Quantity
  stock: int("stock").notNull().default(0),
  images: text("images"), // JSON array of image URLs
  specifications: text("specifications"), // JSON object of specs
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  weight: varchar("weight", { length: 50 }), // e.g., "500g", "2kg"
  dimensions: varchar("dimensions", { length: 100 }), // e.g., "10x20x30cm"
  origin: varchar("origin", { length: 100 }).default("Dongguan, China"),
  featured: int("featured").default(0), // 0 or 1
  active: int("active").default(1), // 0 or 1
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Pricing Tiers (MOQ-based pricing)
export const pricingTiers = mysqlTable("pricingTiers", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  minQuantity: int("minQuantity").notNull(),
  maxQuantity: int("maxQuantity"), // null means unlimited
  price: int("price").notNull(), // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PricingTier = typeof pricingTiers.$inferSelect;
export type InsertPricingTier = typeof pricingTiers.$inferInsert;

// RFQ (Request for Quote) Inquiries
export const rfqInquiries = mysqlTable("rfqInquiries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  companyName: varchar("companyName", { length: 255 }),
  contactName: varchar("contactName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  country: varchar("country", { length: 100 }),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "quoted", "accepted", "rejected"]).default("pending"),
  quotedPrice: int("quotedPrice"), // in cents
  quotedAt: timestamp("quotedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RfqInquiry = typeof rfqInquiries.$inferSelect;
export type InsertRfqInquiry = typeof rfqInquiries.$inferInsert;

// Buyer Profiles (Extended user info for B2B)
export const buyerProfiles = mysqlTable("buyerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  companyName: varchar("companyName", { length: 255 }),
  companyType: varchar("companyType", { length: 100 }), // Distributor, Retailer, etc.
  country: varchar("country", { length: 100 }),
  businessLicense: varchar("businessLicense", { length: 255 }),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected"]).default("pending"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BuyerProfile = typeof buyerProfiles.$inferSelect;
export type InsertBuyerProfile = typeof buyerProfiles.$inferInsert;

// Certifications & Trust Information
export const certifications = mysqlTable("certifications", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // CE, FCC, RoHS, etc.
  description: text("description"),
  certificateUrl: varchar("certificateUrl", { length: 512 }),
  expiryDate: timestamp("expiryDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = typeof certifications.$inferInsert;

// Product Certifications (Many-to-many)
export const productCertifications = mysqlTable("productCertifications", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  certificationId: int("certificationId").notNull(),
});

export type ProductCertification = typeof productCertifications.$inferSelect;
export type InsertProductCertification = typeof productCertifications.$inferInsert;

// Orders (for Stripe payments)
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending"),
  totalAmount: int("totalAmount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD"),
  items: text("items"), // JSON array of order items
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerName: varchar("customerName", { length: 255 }),
  shippingAddress: text("shippingAddress"), // JSON object
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order Items (line items in an order)
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(), // in cents
  totalPrice: int("totalPrice").notNull(), // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Invoices
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().unique(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "paid"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;