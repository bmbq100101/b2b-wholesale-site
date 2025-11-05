import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

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

// Quotes (for bulk order pricing)
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  rfqInquiryId: int("rfqInquiryId").notNull(),
  quoteNumber: varchar("quoteNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["draft", "sent", "accepted", "rejected", "expired"]).default("draft"),
  totalAmount: int("totalAmount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD"),
  validUntil: timestamp("validUntil"),
  notes: text("notes"),
  terms: text("terms"), // Payment terms, delivery terms, etc.
  createdBy: int("createdBy").notNull(), // Admin user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

// Quote Items (line items in a quote)
export const quoteItems = mysqlTable("quoteItems", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(), // in cents
  totalPrice: int("totalPrice").notNull(), // in cents
  discount: int("discount").default(0), // discount percentage
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = typeof quoteItems.$inferInsert;

// Quote History (track quote versions and changes)
export const quoteHistory = mysqlTable("quoteHistory", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull(),
  action: varchar("action", { length: 50 }).notNull(), // created, updated, sent, accepted, rejected
  changedBy: int("changedBy").notNull(),
  previousData: text("previousData"), // JSON of previous values
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuoteHistory = typeof quoteHistory.$inferSelect;
export type InsertQuoteHistory = typeof quoteHistory.$inferInsert;


// Live Chat System
export const chatSessions = mysqlTable("chatSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  supportAgentId: int("supportAgentId"),
  status: mysqlEnum("status", ["active", "closed", "waiting"]).default("waiting"),
  topic: varchar("topic", { length: 255 }).default("General Inquiry"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

// Chat Messages
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  senderId: int("senderId").notNull(),
  senderType: mysqlEnum("senderType", ["customer", "agent"]).notNull(),
  message: text("message").notNull(),
  attachmentUrl: varchar("attachmentUrl", { length: 500 }),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Support Agents
export const supportAgents = mysqlTable("supportAgents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["online", "offline", "busy"]).default("offline"),
  maxChats: int("maxChats").default(5),
  currentChats: int("currentChats").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportAgent = typeof supportAgents.$inferSelect;
export type InsertSupportAgent = typeof supportAgents.$inferInsert;


// Inquiry Notifications System
export const inquiryNotifications = mysqlTable("inquiryNotifications", {
  id: int("id").autoincrement().primaryKey(),
  inquiryId: int("inquiryId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productSku: varchar("productSku", { length: 100 }),
  pageUrl: varchar("pageUrl", { length: 500 }),
  customerEmail: varchar("customerEmail", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }),
  emailSent: boolean("emailSent").default(false),
  smsSent: boolean("smsSent").default(false),
  emailSentAt: timestamp("emailSentAt"),
  smsSentAt: timestamp("smsSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InquiryNotification = typeof inquiryNotifications.$inferSelect;
export type InsertInquiryNotification = typeof inquiryNotifications.$inferInsert;

// SMS Configuration
export const smsConfig = mysqlTable("smsConfig", {
  id: int("id").autoincrement().primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(), // twilio, aws-sns, etc
  apiKey: varchar("apiKey", { length: 500 }).notNull(),
  apiSecret: varchar("apiSecret", { length: 500 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SmsConfig = typeof smsConfig.$inferSelect;
export type InsertSmsConfig = typeof smsConfig.$inferInsert;


// FAQ Categories
export const faqCategories = mysqlTable("faqCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  order: int("order").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FaqCategory = typeof faqCategories.$inferSelect;
export type InsertFaqCategory = typeof faqCategories.$inferInsert;

// FAQ Items
export const faqItems = mysqlTable("faqItems", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  order: int("order").default(0),
  views: int("views").default(0),
  helpful: int("helpful").default(0), // Count of helpful votes
  notHelpful: int("notHelpful").default(0), // Count of not helpful votes
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FaqItem = typeof faqItems.$inferSelect;
export type InsertFaqItem = typeof faqItems.$inferInsert;

// FAQ Search Index (for full-text search)
export const faqSearchIndex = mysqlTable("faqSearchIndex", {
  id: int("id").autoincrement().primaryKey(),
  faqItemId: int("faqItemId").notNull(),
  searchText: text("searchText"), // Denormalized search text
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FaqSearchIndex = typeof faqSearchIndex.$inferSelect;
export type InsertFaqSearchIndex = typeof faqSearchIndex.$inferInsert;


// Sample Request System
export const sampleRequests = mysqlTable("sampleRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull().default(1),
  status: mysqlEnum("status", ["pending", "approved", "shipped", "delivered", "rejected"]).default("pending").notNull(),
  requestDate: timestamp("requestDate").defaultNow().notNull(),
  approvalDate: timestamp("approvalDate"),
  shippingDate: timestamp("shippingDate"),
  deliveryDate: timestamp("deliveryDate"),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  notes: text("notes"),
  piNumber: varchar("piNumber", { length: 50 }), // Proforma Invoice number
  shippingAddress: text("shippingAddress"), // JSON
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SampleRequest = typeof sampleRequests.$inferSelect;
export type InsertSampleRequest = typeof sampleRequests.$inferInsert;

// Proforma Invoice (PI) - Auto-generated for sample requests
export const proformaInvoices = mysqlTable("proformaInvoices", {
  id: int("id").autoincrement().primaryKey(),
  piNumber: varchar("piNumber", { length: 50 }).notNull().unique(),
  sampleRequestId: int("sampleRequestId").notNull(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(), // in cents
  totalAmount: int("totalAmount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  issueDate: timestamp("issueDate").defaultNow().notNull(),
  dueDate: timestamp("dueDate"),
  status: mysqlEnum("status", ["draft", "issued", "accepted", "rejected", "paid"]).default("issued").notNull(),
  paymentTerms: varchar("paymentTerms", { length: 100 }),
  deliveryTerms: varchar("deliveryTerms", { length: 100 }),
  notes: text("notes"),
  pdfUrl: varchar("pdfUrl", { length: 500 }), // URL to generated PDF
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProformaInvoice = typeof proformaInvoices.$inferSelect;
export type InsertProformaInvoice = typeof proformaInvoices.$inferInsert;

// Shipping Labels - Auto-generated for shipped samples
export const shippingLabels = mysqlTable("shippingLabels", {
  id: int("id").autoincrement().primaryKey(),
  labelNumber: varchar("labelNumber", { length: 50 }).notNull().unique(),
  sampleRequestId: int("sampleRequestId").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 100 }).notNull(),
  carrier: varchar("carrier", { length: 50 }).notNull(), // DHL, FedEx, UPS, etc.
  shippingMethod: varchar("shippingMethod", { length: 50 }).notNull(), // Express, Standard, etc.
  weight: int("weight"), // in grams
  dimensions: varchar("dimensions", { length: 100 }), // LxWxH
  estimatedDelivery: timestamp("estimatedDelivery"),
  actualDelivery: timestamp("actualDelivery"),
  cost: int("cost"), // in cents
  pdfUrl: varchar("pdfUrl", { length: 500 }), // URL to generated PDF
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShippingLabel = typeof shippingLabels.$inferSelect;
export type InsertShippingLabel = typeof shippingLabels.$inferInsert;


// Membership Tiers (会员等级)
export const membershipTiers = mysqlTable("membershipTiers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // 普通会员, 银牌, 金牌, 钻石
  level: int("level").notNull().unique(), // 1, 2, 3, 4 (higher = better)
  description: text("description"),
  minAnnualPurchase: int("minAnnualPurchase").notNull().default(0), // in cents, minimum annual purchase to qualify
  discountPercentage: int("discountPercentage").notNull().default(0), // 0-100, discount on all products
  additionalBenefits: text("additionalBenefits"), // JSON array of benefits
  color: varchar("color", { length: 20 }).default("#999999"), // For UI display
  icon: varchar("icon", { length: 100 }), // Icon name or URL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MembershipTier = typeof membershipTiers.$inferSelect;
export type InsertMembershipTier = typeof membershipTiers.$inferInsert;

// User Memberships (用户会员信息)
export const userMemberships = mysqlTable("userMemberships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  tierId: int("tierId").notNull(), // Foreign key to membershipTiers
  annualPurchaseAmount: int("annualPurchaseAmount").notNull().default(0), // in cents
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  upgradedAt: timestamp("upgradedAt"),
  expiresAt: timestamp("expiresAt"), // Membership expiry date
  isActive: int("isActive").default(1), // 0 or 1
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserMembership = typeof userMemberships.$inferSelect;
export type InsertUserMembership = typeof userMemberships.$inferInsert;

// Membership Discounts (会员等级价格折扣)
export const membershipDiscounts = mysqlTable("membershipDiscounts", {
  id: int("id").autoincrement().primaryKey(),
  tierId: int("tierId").notNull(), // Foreign key to membershipTiers
  productId: int("productId"), // null means applies to all products
  categoryId: int("categoryId"), // null means applies to all categories
  discountPercentage: int("discountPercentage").notNull(), // 0-100
  discountAmount: int("discountAmount").default(0), // in cents, fixed discount
  validFrom: timestamp("validFrom").defaultNow(),
  validUntil: timestamp("validUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MembershipDiscount = typeof membershipDiscounts.$inferSelect;
export type InsertMembershipDiscount = typeof membershipDiscounts.$inferInsert;

// Membership History (会员升级历史)
export const membershipHistory = mysqlTable("membershipHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fromTierId: int("fromTierId"), // null if first membership
  toTierId: int("toTierId").notNull(),
  reason: varchar("reason", { length: 255 }), // "automatic_upgrade", "manual_upgrade", "downgrade", etc.
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MembershipHistory = typeof membershipHistory.$inferSelect;
export type InsertMembershipHistory = typeof membershipHistory.$inferInsert;
