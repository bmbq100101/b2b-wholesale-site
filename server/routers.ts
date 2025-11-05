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
  updateOrderStatus,
} from "./db";
import { rfqInquiries, buyerProfiles, orders } from "../drizzle/schema";

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
});

export type AppRouter = typeof appRouter;
