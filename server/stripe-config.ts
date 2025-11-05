/**
 * Stripe configuration and product definitions
 * This file contains all product/price definitions for easy access
 */

export const stripeProducts = {
  // B2B Wholesale Products - these would typically be created in Stripe Dashboard
  // For now, we define the structure for bulk order pricing
  
  bulkOrder: {
    name: "Bulk Product Order",
    description: "Custom bulk order from our catalog",
    // Price is determined dynamically based on selected products and quantities
  },

  // Example: subscription-based services (optional for future use)
  premiumSupplier: {
    name: "Premium Supplier Account",
    description: "Unlock exclusive pricing and priority support",
    monthlyPriceInCents: 9999, // $99.99/month
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "", // Set in environment
  },
};

/**
 * Calculate total price for a bulk order
 * @param items Array of {productId, quantity, unitPrice}
 * @returns Total price in cents
 */
export function calculateOrderTotal(items: Array<{ unitPrice: number; quantity: number }>): number {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

/**
 * Format price for Stripe (convert to cents if needed)
 */
export function formatPriceForStripe(priceInCents: number): number {
  return Math.round(priceInCents);
}

/**
 * Format price for display
 */
export function formatPriceForDisplay(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}
