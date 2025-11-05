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
} from "./db";
import { rfqInquiries, buyerProfiles } from "../drizzle/schema";

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
});

export type AppRouter = typeof appRouter;
