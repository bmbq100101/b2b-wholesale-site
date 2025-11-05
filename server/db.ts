import { eq, ne, lt, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser,
  InsertProduct,
  users,
  categories, 
  products, 
  pricingTiers, 
  rfqInquiries, 
  buyerProfiles,
  certifications,
  orders,
  orderItems,
  invoices,
  type User,
  type Product,
  type Category,
  type PricingTier,
  type RfqInquiry,
  type BuyerProfile,
  type Certification,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Invoice,
  type InsertInvoice
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Product queries
export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(and(eq(products.categoryId, categoryId), eq(products.active, 1)));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(and(eq(products.featured, 1), eq(products.active, 1))).limit(limit);
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

export async function getAllProducts(limit?: number): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(products).where(eq(products.active, 1));
  if (limit) {
    return query.limit(limit);
  }
  return query;
}

// RFQ queries
export async function getRfqInquiriesByUser(userId: number): Promise<RfqInquiry[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rfqInquiries).where(eq(rfqInquiries.userId, userId));
}

export async function getPricingTiers(productId: number): Promise<PricingTier[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pricingTiers).where(eq(pricingTiers.productId, productId));
}

// Buyer profile queries
export async function getBuyerProfile(userId: number): Promise<BuyerProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(buyerProfiles).where(eq(buyerProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCertifications(): Promise<Certification[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certifications);
}

// Order queries
export async function createOrder(order: InsertOrder): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.insert(orders).values(order);
    const result = await db.select().from(orders).where(eq(orders.userId, order.userId)).orderBy(orders.id).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create order:", error);
    return undefined;
  }
}

export async function getOrderById(orderId: number): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByStripeSessionId(sessionId: string): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status: status as any, updatedAt: new Date() }).where(eq(orders.id, orderId));
}

export async function updateOrderByStripeSessionId(sessionId: string, updates: Partial<Order>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set(updates).where(eq(orders.stripeSessionId, sessionId));
}

// Order Items queries
export async function createOrderItem(item: InsertOrderItem): Promise<OrderItem | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.insert(orderItems).values(item);
    const result = await db.select().from(orderItems).where(eq(orderItems.orderId, item.orderId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create order item:", error);
    return undefined;
  }
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}


// Quote queries
export async function createQuote(quote: InsertQuote): Promise<Quote | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.insert(quotes).values(quote);
    const result = await db.select().from(quotes).where(eq(quotes.rfqInquiryId, quote.rfqInquiryId)).orderBy(quotes.id).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create quote:", error);
    return undefined;
  }
}

export async function getQuoteById(quoteId: number): Promise<Quote | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuotesByRfqId(rfqInquiryId: number): Promise<Quote[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quotes).where(eq(quotes.rfqInquiryId, rfqInquiryId));
}

export async function updateQuoteStatus(quoteId: number, status: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(quotes).set({ status: status as any, updatedAt: new Date() }).where(eq(quotes.id, quoteId));
}

// Quote Items queries
export async function createQuoteItem(item: InsertQuoteItem): Promise<QuoteItem | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.insert(quoteItems).values(item);
    const result = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, item.quoteId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create quote item:", error);
    return undefined;
  }
}

export async function getQuoteItems(quoteId: number): Promise<QuoteItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));
}

export async function updateQuoteItem(itemId: number, updates: Partial<QuoteItem>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(quoteItems).set(updates).where(eq(quoteItems.id, itemId));
}

// Quote History queries
export async function addQuoteHistory(history: InsertQuoteHistory): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(quoteHistory).values(history);
}

export async function getQuoteHistory(quoteId: number): Promise<QuoteHistory[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quoteHistory).where(eq(quoteHistory.quoteId, quoteId));
}

import {
  quotes,
  quoteItems,
  quoteHistory,
  type Quote,
  type InsertQuote,
  type QuoteItem,
  type InsertQuoteItem,
  type QuoteHistory,
  type InsertQuoteHistory
} from "../drizzle/schema";


// Chat Session queries
export async function createChatSession(session: InsertChatSession): Promise<ChatSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.insert(chatSessions).values(session);
    const result = await db.select().from(chatSessions).where(eq(chatSessions.userId, session.userId)).orderBy(chatSessions.id).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create chat session:", error);
    return undefined;
  }
}

export async function getChatSession(sessionId: number): Promise<ChatSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(chatSessions).where(eq(chatSessions.id, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserActiveChatSession(userId: number): Promise<ChatSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(chatSessions).where(eq(chatSessions.userId, userId)).orderBy(chatSessions.id).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateChatSessionStatus(sessionId: number, status: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(chatSessions).set({ status: status as any, updatedAt: new Date() }).where(eq(chatSessions.id, sessionId));
}

export async function closeChatSession(sessionId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(chatSessions).set({ status: "closed", closedAt: new Date(), updatedAt: new Date() }).where(eq(chatSessions.id, sessionId));
}

// Chat Message queries
export async function createChatMessage(message: InsertChatMessage): Promise<ChatMessage | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.insert(chatMessages).values(message);
    const result = await db.select().from(chatMessages).where(eq(chatMessages.sessionId, message.sessionId)).orderBy(chatMessages.id).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create chat message:", error);
    return undefined;
  }
}

export async function getChatMessages(sessionId: number): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.id);
}

export async function markMessagesAsRead(sessionId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(chatMessages).set({ isRead: true }).where(
    and(eq(chatMessages.sessionId, sessionId), ne(chatMessages.senderId, userId))
  );
}

// Support Agent queries
export async function getSupportAgents(): Promise<SupportAgent[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportAgents).where(eq(supportAgents.status, "online"));
}

export async function getAvailableSupportAgent(): Promise<SupportAgent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(supportAgents)
    .where(and(eq(supportAgents.status, "online"), lt(supportAgents.currentChats, supportAgents.maxChats)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function assignChatToAgent(sessionId: number, agentId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(chatSessions).set({ supportAgentId: agentId, status: "active" }).where(eq(chatSessions.id, sessionId));
  await db.update(supportAgents).set({ currentChats: sql`currentChats + 1` }).where(eq(supportAgents.id, agentId));
}

export async function releaseChatFromAgent(sessionId: number, agentId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(supportAgents).set({ currentChats: sql`GREATEST(0, currentChats - 1)` }).where(eq(supportAgents.id, agentId));
}

import {
  chatSessions,
  chatMessages,
  supportAgents,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type SupportAgent,
} from "../drizzle/schema";


// Get user email by ID
export async function getUserEmail(userId: number): Promise<string | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0].email || undefined : undefined;
}

// Get support agent name by ID
export async function getSupportAgentName(agentId: number): Promise<string | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(supportAgents).where(eq(supportAgents.id, agentId)).limit(1);
  return result.length > 0 ? result[0].name : undefined;
}


// Inquiry Notification queries
export async function createInquiryNotification(notification: InsertInquiryNotification): Promise<InquiryNotification | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.insert(inquiryNotifications).values(notification);
    const result = await db.select().from(inquiryNotifications).where(eq(inquiryNotifications.inquiryId, notification.inquiryId)).orderBy(inquiryNotifications.id).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create inquiry notification:", error);
    return undefined;
  }
}

export async function updateInquiryNotificationEmailStatus(notificationId: number, sent: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(inquiryNotifications).set({ emailSent: sent, emailSentAt: sent ? new Date() : undefined }).where(eq(inquiryNotifications.id, notificationId));
}

export async function updateInquiryNotificationSMSStatus(notificationId: number, sent: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(inquiryNotifications).set({ smsSent: sent, smsSentAt: sent ? new Date() : undefined }).where(eq(inquiryNotifications.id, notificationId));
}

import {
  inquiryNotifications,
  type InquiryNotification,
  type InsertInquiryNotification,
} from "../drizzle/schema";


// Create product
export async function createProduct(product: InsertProduct): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.insert(products).values(product);
    const result = await db.select().from(products).where(eq(products.sku, product.sku)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create product:", error);
    return undefined;
  }
}




// FAQ Queries
export async function getFaqCategories(): Promise<FaqCategory[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(faqCategories).where(eq(faqCategories.isActive, true)).orderBy(faqCategories.order);
}

export async function getFaqItemsByCategory(categoryId: number): Promise<FaqItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(faqItems).where(and(eq(faqItems.categoryId, categoryId), eq(faqItems.isActive, true))).orderBy(faqItems.order);
}

export async function searchFaqItems(searchQuery: string): Promise<FaqItem[]> {
  const db = await getDb();
  if (!db) return [];
  
  const query = `%${searchQuery}%`;
  return db.select().from(faqItems).where(and(eq(faqItems.isActive, true), sql`MATCH(question, answer) AGAINST(${searchQuery} IN BOOLEAN MODE)`));
}

export async function getFaqItemById(id: number): Promise<FaqItem | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(faqItems).where(eq(faqItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateFaqItemViews(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(faqItems).set({ views: sql`views + 1` }).where(eq(faqItems.id, id));
}

export async function updateFaqItemHelpful(id: number, helpful: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  if (helpful) {
    await db.update(faqItems).set({ helpful: sql`helpful + 1` }).where(eq(faqItems.id, id));
  } else {
    await db.update(faqItems).set({ notHelpful: sql`notHelpful + 1` }).where(eq(faqItems.id, id));
  }
}

export async function createFaqCategory(category: InsertFaqCategory): Promise<FaqCategory | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.insert(faqCategories).values(category);
    const result = await db.select().from(faqCategories).where(eq(faqCategories.slug, category.slug)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create FAQ category:", error);
    return undefined;
  }
}

export async function createFaqItem(item: InsertFaqItem): Promise<FaqItem | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.insert(faqItems).values(item);
    const result = await db.select().from(faqItems).where(eq(faqItems.question, item.question)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to create FAQ item:", error);
    return undefined;
  }
}

import {
  faqCategories,
  faqItems,
  faqSearchIndex,
  type FaqCategory,
  type FaqItem,
  type InsertFaqCategory,
  type InsertFaqItem,
} from "../drizzle/schema";
