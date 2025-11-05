import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import z from "zod";
import { eq } from "drizzle-orm";
import {
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductBySlug,
  getAllCategories,
  getPricingTiers,
  getRfqInquiriesByUser,
  getBuyerProfile,
  getCertifications,
  getDb,
  getOrderById,
  getOrderItems,
  getUserOrders,
  createOrder,
  createOrderItem,
  updateOrderStatus,
  createQuote,
  getQuoteById,
  getQuotesByRfqId,
  updateQuoteStatus,
  createQuoteItem,
  getQuoteItems,
  addQuoteHistory,
  getQuoteHistory,
} from "./db";
import { rfqInquiries, buyerProfiles, orders, quotes } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Product routes
  products: router({
    list: publicProcedure.query(async () => {
      return getAllProducts(50);
    }),
    featured: publicProcedure.query(async () => {
      return getFeaturedProducts(6);
    }),
    byCategory: publicProcedure.input(z.number()).query(async ({ input: categoryId }) => {
      return getProductsByCategory(categoryId);
    }),
    bySlug: publicProcedure.input(z.string()).query(async ({ input: slug }) => {
      return getProductBySlug(slug);
    }),
  }),

  // Category routes
  categories: router({
    list: publicProcedure.query(async () => {
      return getAllCategories();
    }),
  }),

  // Pricing routes
  pricing: router({
    tiers: publicProcedure.input(z.number()).query(async ({ input: productId }) => {
      return getPricingTiers(productId);
    }),
  }),

  // RFQ routes
  rfq: router({
    submit: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        companyName: z.string().optional(),
        contactName: z.string().optional(),
        phone: z.string().optional(),
        country: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(rfqInquiries).values({
          userId: ctx.user.id,
          productId: input.productId,
          quantity: input.quantity,
          companyName: input.companyName,
          contactName: input.contactName,
          email: ctx.user.email || "",
          phone: input.phone,
          country: input.country,
          message: input.message,
        });
        return result;
      }),
    myInquiries: protectedProcedure.query(async ({ ctx }) => {
      return getRfqInquiriesByUser(ctx.user.id);
    }),
  }),

  // Buyer profile routes
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getBuyerProfile(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({
        companyName: z.string().optional(),
        companyType: z.string().optional(),
        country: z.string().optional(),
        businessLicense: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const existing = await getBuyerProfile(ctx.user.id);
        if (existing) {
          await db.update(buyerProfiles).set(input).where(eq(buyerProfiles.userId, ctx.user.id));
        } else {
          await db.insert(buyerProfiles).values({
            userId: ctx.user.id,
            ...input,
          });
        }
        return getBuyerProfile(ctx.user.id);
      }),
  }),

  // Certifications
  certifications: router({
    list: publicProcedure.query(async () => {
      return getCertifications();
    }),
  }),

  // Payment routes
  payments: router({
    createCheckoutSession: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().min(1),
          unitPrice: z.number().min(0),
        })),
        shippingAddress: z.object({
          country: z.string(),
          city: z.string().optional(),
          postalCode: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
        
        try {
          // Calculate total
          const totalAmount = input.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
          
          // Create order in database first
          const order = await createOrder({
            userId: ctx.user.id,
            status: "pending",
            totalAmount: Math.round(totalAmount * 100), // Convert to cents
            currency: "USD",
            items: JSON.stringify(input.items),
            customerEmail: ctx.user.email || "",
            customerName: ctx.user.name || "",
            shippingAddress: input.shippingAddress ? JSON.stringify(input.shippingAddress) : undefined,
          });

          if (!order) {
            throw new Error("Failed to create order");
          }

          // Create Stripe checkout session
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: input.items.map(item => ({
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Product Order - Qty: ${item.quantity}`,
                },
                unit_amount: Math.round(item.unitPrice * 100),
              },
              quantity: item.quantity,
            })),
            mode: "payment",
            success_url: `${ctx.req.headers.origin}/orders/${order.id}?status=success`,
            cancel_url: `${ctx.req.headers.origin}/checkout?status=cancelled`,
            customer_email: ctx.user.email || undefined,
            client_reference_id: ctx.user.id.toString(),
            metadata: {
              user_id: ctx.user.id.toString(),
              order_id: order.id.toString(),
              customer_email: ctx.user.email || "",
              customer_name: ctx.user.name || "",
            },
            allow_promotion_codes: true,
          });

          // Update order with Stripe session ID
          const db = await getDb();
          if (db) {
            await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id));
          }

          return {
            sessionId: session.id,
            sessionUrl: session.url,
            orderId: order.id,
          };
        } catch (error) {
          console.error("[Stripe] Error creating checkout session:", error);
          throw new Error("Failed to create checkout session");
        }
      }),

    getOrderDetails: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input: orderId }) => {
        const order = await getOrderById(orderId);
        
        if (!order || order.userId !== ctx.user.id) {
          throw new Error("Order not found or unauthorized");
        }

        const items = await getOrderItems(orderId);
        return { order, items };
      }),

    getUserOrders: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserOrders(ctx.user.id);
      }),
  }),

  // Advanced RFQ and Quote Management
  quotes: router({
    createQuote: protectedProcedure
      .input(z.object({
        rfqInquiryId: z.number(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().min(1),
          unitPrice: z.number().min(0),
          discount: z.number().min(0).max(100).optional(),
          notes: z.string().optional(),
        })),
        validDays: z.number().default(30),
        notes: z.string().optional(),
        terms: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Calculate total amount
          let totalAmount = 0;
          const quoteNumber = `QT-${Date.now()}`;
          const validUntil = new Date();
          validUntil.setDate(validUntil.getDate() + input.validDays);

          // Create quote
          const quote = await createQuote({
            rfqInquiryId: input.rfqInquiryId,
            quoteNumber,
            status: "draft",
            totalAmount: 0, // Will update after items
            currency: "USD",
            validUntil,
            notes: input.notes,
            terms: input.terms,
            createdBy: ctx.user.id,
          });

          if (!quote) throw new Error("Failed to create quote");

          // Create quote items
          for (const item of input.items) {
            const itemTotal = item.unitPrice * item.quantity * (1 - (item.discount || 0) / 100);
            totalAmount += itemTotal;

            await createQuoteItem({
              quoteId: quote.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: Math.round(item.unitPrice * 100),
              totalPrice: Math.round(itemTotal * 100),
              discount: item.discount || 0,
              notes: item.notes,
            });
          }

          // Update quote with total amount
          const db = await getDb();
          if (db) {
            await db.update(quotes).set({ totalAmount: Math.round(totalAmount * 100) }).where(eq(quotes.id, quote.id));
            
            // Add history entry
            await addQuoteHistory({
              quoteId: quote.id,
              action: "created",
              changedBy: ctx.user.id,
              notes: "Quote created",
            });
          }

          return quote;
        } catch (error) {
          console.error("[Quote] Error creating quote:", error);
          throw new Error("Failed to create quote");
        }
      }),

    getQuote: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input: quoteId }) => {
        const quote = await getQuoteById(quoteId);
        
        if (!quote) throw new Error("Quote not found");

        const items = await getQuoteItems(quoteId);
        const history = await getQuoteHistory(quoteId);
        
        return { quote, items, history };
      }),

    getRfqQuotes: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input: rfqInquiryId }) => {
        return getQuotesByRfqId(rfqInquiryId);
      }),

    updateQuoteStatus: protectedProcedure
      .input(z.object({
        quoteId: z.number(),
        status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await updateQuoteStatus(input.quoteId, input.status);
          
          // Add history entry
          await addQuoteHistory({
            quoteId: input.quoteId,
            action: input.status,
            changedBy: ctx.user.id,
            notes: input.notes,
          });

          return { success: true };
        } catch (error) {
          console.error("[Quote] Error updating status:", error);
          throw new Error("Failed to update quote status");
        }
      }),

    convertQuoteToOrder: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input: quoteId }) => {
        try {
          const quote = await getQuoteById(quoteId);
          if (!quote) throw new Error("Quote not found");

          const quoteItems = await getQuoteItems(quoteId);
          
          // Create order from quote
          const order = await createOrder({
            userId: ctx.user.id,
            status: "pending",
            totalAmount: quote.totalAmount,
            currency: quote.currency,
            items: JSON.stringify(quoteItems),
            customerEmail: ctx.user.email || "",
            customerName: ctx.user.name || "",
            notes: `Converted from quote ${quote.quoteNumber}`,
          });

          if (!order) throw new Error("Failed to create order");

          // Create order items
          for (const item of quoteItems) {
            await createOrderItem({
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            });
          }

          return { orderId: order.id, orderNumber: `ORD-${order.id}` };
        } catch (error) {
          console.error("[Quote] Error converting to order:", error);
          throw new Error("Failed to convert quote to order");
        }
      }),
  }),

  // Live Chat
  chat: router({
    startSession: protectedProcedure
      .input(z.object({
        topic: z.string().default("General Inquiry"),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createChatSession, getAvailableSupportAgent, assignChatToAgent } = await import("./db");
        
        try {
          // Create chat session
          const session = await createChatSession({
            userId: ctx.user.id,
            status: "waiting",
            topic: input.topic,
          });

          if (!session) throw new Error("Failed to create chat session");

          // Try to assign to available agent
          const agent = await getAvailableSupportAgent();
          if (agent) {
            await assignChatToAgent(session.id, agent.id);
          }

          return session;
        } catch (error) {
          console.error("[Chat] Error starting session:", error);
          throw new Error("Failed to start chat session");
        }
      }),

    getSession: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input: sessionId }) => {
        const { getChatSession, getChatMessages } = await import("./db");
        
        const session = await getChatSession(sessionId);
        if (!session || session.userId !== ctx.user.id) {
          throw new Error("Session not found or unauthorized");
        }

        const messages = await getChatMessages(sessionId);
        return { session, messages };
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        message: z.string().min(1).max(5000),
        attachmentUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createChatMessage } = await import("./db");
        
        try {
          const message = await createChatMessage({
            sessionId: input.sessionId,
            senderId: ctx.user.id,
            senderType: "customer",
            message: input.message,
            attachmentUrl: input.attachmentUrl,
          });

          return message;
        } catch (error) {
          console.error("[Chat] Error sending message:", error);
          throw new Error("Failed to send message");
        }
      }),

    getMessages: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input: sessionId }) => {
        const { getChatSession, getChatMessages, markMessagesAsRead } = await import("./db");
        
        const session = await getChatSession(sessionId);
        if (!session || session.userId !== ctx.user.id) {
          throw new Error("Session not found or unauthorized");
        }

        const messages = await getChatMessages(sessionId);
        
        // Mark messages as read
        await markMessagesAsRead(sessionId, ctx.user.id);

        return messages;
      }),

    closeSession: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input: sessionId }) => {
        const { getChatSession, closeChatSession, releaseChatFromAgent, getChatMessages, getUserEmail, getSupportAgentName } = await import("./db");
        const { sendChatTranscriptEmail } = await import("./email-service");
        
        try {
          const session = await getChatSession(sessionId);
          if (!session || session.userId !== ctx.user.id) {
            throw new Error("Session not found or unauthorized");
          }

          if (session.supportAgentId) {
            await releaseChatFromAgent(sessionId, session.supportAgentId);
          }

          await closeChatSession(sessionId);

          // Send email transcript
          try {
            const messages = await getChatMessages(sessionId);
            const userEmail = await getUserEmail(ctx.user.id);
            const agentName = session.supportAgentId ? await getSupportAgentName(session.supportAgentId) : undefined;

            if (userEmail && messages.length > 0) {
              await sendChatTranscriptEmail({
                userName: (ctx.user.name || "Customer") as string,
                userEmail: userEmail || undefined,
                topic: session.topic || "General Inquiry",
                startTime: session.startedAt,
                endTime: session.closedAt || new Date(),
                messages,
                agentName,
              });
            }
          } catch (emailError) {
            console.error("[Chat] Failed to send transcript email:", emailError);
          }

          return { success: true };
        } catch (error) {
          console.error("[Chat] Error closing session:", error);
          throw new Error("Failed to close chat session");
        }
      }),

    getUserSession: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserActiveChatSession } = await import("./db");
        return getUserActiveChatSession(ctx.user.id);
      }),
  }),

  // Inquiry Notifications
  inquiries: router({
    sendInquiryNotification: protectedProcedure
      .input(z.object({
        inquiryId: z.number(),
        productId: z.number(),
        productName: z.string(),
        productSku: z.string().optional(),
        pageUrl: z.string().optional(),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        sendEmail: z.boolean().default(true),
        sendSMS: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createInquiryNotification, updateInquiryNotificationEmailStatus, updateInquiryNotificationSMSStatus } = await import("./db");
        const { sendInquiryEmail, sendInquirySMS } = await import("./inquiry-notification-service");

        try {
          // Create notification record
          const notification = await createInquiryNotification({
            inquiryId: input.inquiryId,
            productId: input.productId,
            productName: input.productName,
            productSku: input.productSku,
            pageUrl: input.pageUrl,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
          });

          if (!notification) {
            throw new Error("Failed to create notification record");
          }

          // Send email if requested
          if (input.sendEmail) {
            const emailSent = await sendInquiryEmail({
              customerName: ctx.user.name || "Valued Customer",
              customerEmail: input.customerEmail,
              productName: input.productName,
              productSku: input.productSku,
              pageUrl: input.pageUrl,
            });

            if (emailSent) {
              await updateInquiryNotificationEmailStatus(notification.id, true);
            }
          }

          // Send SMS if requested and phone provided
          if (input.sendSMS && input.customerPhone) {
            const smsSent = await sendInquirySMS({
              customerPhone: input.customerPhone,
              productName: input.productName,
              productSku: input.productSku,
            });

            if (smsSent) {
              await updateInquiryNotificationSMSStatus(notification.id, true);
            }
          }

          return {
            success: true,
            notificationId: notification.id,
            emailSent: notification.emailSent,
            smsSent: notification.smsSent,
          };
        } catch (error) {
          console.error("[Inquiry] Error sending notification:", error);
          throw new Error("Failed to send inquiry notification");
        }
      }),
  }),

  // Bulk Product Upload
  bulkUpload: router({
    uploadCSV: protectedProcedure
      .input(z.object({
        csvContent: z.string(),
        categoryId: z.number(),
        conditionGrade: z.string().refine((val) => ["A", "B", "C"].includes(val)),
      }))
      .mutation(async ({ ctx, input }) => {
        const { parseCSVContent, validateProductData, convertToInsertProduct } = await import("./bulk-upload-service");
        const { createProduct } = await import("./db");

        try {
          const products = parseCSVContent(input.csvContent);
          const result = {
            success: 0,
            failed: 0,
            errors: [] as Array<{ row: number; error: string }>,
            products: [] as Array<{ id: number; name: string; sku: string }>,
          };

          for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const rowNumber = i + 2; // +2 because of 0-index and header row

            // Validate product data
            const validationError = validateProductData(product, rowNumber);
            if (validationError) {
              result.failed++;
              result.errors.push({ row: rowNumber, error: validationError });
              continue;
            }

            try {
              // Convert and insert product
              const insertData = convertToInsertProduct(product, input.categoryId, input.conditionGrade);
              const createdProduct = await createProduct(insertData);

              if (createdProduct) {
                result.success++;
                result.products.push({
                  id: createdProduct.id,
                  name: createdProduct.name,
                  sku: createdProduct.sku,
                });
              } else {
                result.failed++;
                result.errors.push({ row: rowNumber, error: "Failed to create product in database" });
              }
            } catch (error) {
              result.failed++;
              result.errors.push({
                row: rowNumber,
                error: `Database error: ${error instanceof Error ? error.message : "Unknown error"}`,
              });
            }
          }

          return result;
        } catch (error) {
          console.error("[Bulk Upload] Error processing CSV:", error);
          throw new Error(`Failed to process CSV: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }),

    getCSVTemplate: publicProcedure.query(async () => {
      const { generateCSVTemplate } = await import("./bulk-upload-service");
      return generateCSVTemplate();
    }),

    validateCSVFile: publicProcedure
      .input(z.object({
        fileName: z.string(),
        fileSize: z.number(),
      }))
      .query(async ({ input }) => {
        const { validateCSVFile } = await import("./bulk-upload-service");
        
        const file = new File([], input.fileName);
        Object.defineProperty(file, "size", { value: input.fileSize });
        
        const error = validateCSVFile(file);
        return { valid: !error, error };
      }),
  }),

  // FAQ Management
  faq: router({
    getCategories: publicProcedure.query(async () => {
      const { getFaqCategories } = await import("./db");
      return getFaqCategories();
    }),

    getItemsByCategory: publicProcedure
      .input(z.number())
      .query(async ({ input: categoryId }) => {
        const { getFaqItemsByCategory } = await import("./db");
        return getFaqItemsByCategory(categoryId);
      }),

    getItemById: publicProcedure
      .input(z.number())
      .query(async ({ input: itemId }) => {
        const { getFaqItemById, updateFaqItemViews } = await import("./db");
        const item = await getFaqItemById(itemId);
        if (item) {
          await updateFaqItemViews(itemId);
        }
        return item;
      }),

    search: publicProcedure
      .input(z.string().min(2))
      .query(async ({ input: query }) => {
        const { searchFaqItems } = await import("./db");
        return searchFaqItems(query);
      }),

    markHelpful: publicProcedure
      .input(z.object({
        itemId: z.number(),
        helpful: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const { updateFaqItemHelpful } = await import("./db");
        await updateFaqItemHelpful(input.itemId, input.helpful);
        return { success: true };
      }),

    createCategory: protectedProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createFaqCategory } = await import("./db");
        
        const category = await createFaqCategory({
          name: input.name,
          slug: input.slug,
          description: input.description,
        });

        return category || { error: "Failed to create category" };
      }),

    createItem: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        question: z.string(),
        answer: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createFaqItem } = await import("./db");
        
        const item = await createFaqItem({
          categoryId: input.categoryId,
          question: input.question,
          answer: input.answer,
        });

        return item || { error: "Failed to create FAQ item" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
