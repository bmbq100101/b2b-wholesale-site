/**
 * Multi-Region Payment Gateway Service
 * Supports different payment methods based on customer region
 */

export type PaymentRegion = "americas" | "europe" | "middle_east" | "asia_pacific";
export type PaymentMethod = "stripe" | "paypal" | "checkout" | "mercado_pago" | "cod" | "bank_transfer";

export interface PaymentConfig {
  region: PaymentRegion;
  supportedMethods: PaymentMethod[];
  primaryMethod: PaymentMethod;
  currency: string;
  countries: string[];
}

export const REGION_PAYMENT_CONFIG: Record<PaymentRegion, PaymentConfig> = {
  americas: {
    region: "americas",
    supportedMethods: ["stripe", "paypal", "mercado_pago"],
    primaryMethod: "stripe",
    currency: "USD",
    countries: ["US", "CA", "MX", "BR", "AR", "CL", "CO", "PE"],
  },
  europe: {
    region: "europe",
    supportedMethods: ["stripe", "paypal"],
    primaryMethod: "stripe",
    currency: "EUR",
    countries: ["GB", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "CH", "SE", "NO", "DK", "PL"],
  },
  middle_east: {
    region: "middle_east",
    supportedMethods: ["checkout", "cod", "bank_transfer"],
    primaryMethod: "checkout",
    currency: "AED",
    countries: ["AE", "SA", "KW", "QA", "BH", "OM", "JO", "EG"],
  },
  asia_pacific: {
    region: "asia_pacific",
    supportedMethods: ["stripe", "paypal"],
    primaryMethod: "stripe",
    currency: "USD",
    countries: ["CN", "JP", "SG", "HK", "TW", "TH", "MY", "PH", "ID", "VN", "AU", "NZ"],
  },
};

export interface PaymentGatewayConfig {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  minAmount: number;
  maxAmount: number;
  fees: number; // percentage
  processingTime: string;
  supportedCurrencies: string[];
}

export const PAYMENT_GATEWAYS: Record<PaymentMethod, PaymentGatewayConfig> = {
  stripe: {
    name: "stripe",
    displayName: "Credit/Debit Card (Stripe)",
    description: "Secure payment with major credit and debit cards",
    icon: "💳",
    minAmount: 1,
    maxAmount: 999999,
    fees: 2.9,
    processingTime: "Instant",
    supportedCurrencies: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"],
  },
  paypal: {
    name: "paypal",
    displayName: "PayPal",
    description: "Fast and secure payment with PayPal",
    icon: "🅿️",
    minAmount: 1,
    maxAmount: 999999,
    fees: 3.49,
    processingTime: "Instant",
    supportedCurrencies: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CNY"],
  },
  checkout: {
    name: "checkout",
    displayName: "Checkout.com",
    description: "Global payment processing for Middle East",
    icon: "🌍",
    minAmount: 1,
    maxAmount: 999999,
    fees: 2.5,
    processingTime: "1-2 hours",
    supportedCurrencies: ["AED", "SAR", "KWD", "QAR"],
  },
  mercado_pago: {
    name: "mercado_pago",
    displayName: "Mercado Pago",
    description: "Leading payment solution in Latin America",
    icon: "🏪",
    minAmount: 1,
    maxAmount: 999999,
    fees: 3.99,
    processingTime: "1-3 business days",
    supportedCurrencies: ["BRL", "ARS", "CLP", "COP", "MXN"],
  },
  cod: {
    name: "cod",
    displayName: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: "💰",
    minAmount: 1,
    maxAmount: 50000,
    fees: 0,
    processingTime: "Upon delivery",
    supportedCurrencies: ["AED", "SAR", "KWD", "QAR"],
  },
  bank_transfer: {
    name: "bank_transfer",
    displayName: "Bank Transfer",
    description: "Direct bank transfer for wholesale orders",
    icon: "🏦",
    minAmount: 1000,
    maxAmount: 9999999,
    fees: 0,
    processingTime: "2-5 business days",
    supportedCurrencies: ["USD", "EUR", "GBP", "AED", "CNY"],
  },
};

/**
 * Detect customer region based on country code
 */
export function detectRegion(countryCode: string): PaymentRegion {
  const code = countryCode.toUpperCase();

  for (const [region, config] of Object.entries(REGION_PAYMENT_CONFIG)) {
    if (config.countries.includes(code)) {
      return region as PaymentRegion;
    }
  }

  // Default to Americas if unknown
  return "americas";
}

/**
 * Get available payment methods for a region
 */
export function getPaymentMethodsForRegion(region: PaymentRegion): PaymentMethod[] {
  return REGION_PAYMENT_CONFIG[region].supportedMethods;
}

/**
 * Get primary payment method for a region
 */
export function getPrimaryPaymentMethod(region: PaymentRegion): PaymentMethod {
  return REGION_PAYMENT_CONFIG[region].primaryMethod;
}

/**
 * Get currency for a region
 */
export function getCurrencyForRegion(region: PaymentRegion): string {
  return REGION_PAYMENT_CONFIG[region].currency;
}

/**
 * Calculate total with payment fees
 */
export function calculateTotalWithFees(
  amount: number,
  paymentMethod: PaymentMethod
): { subtotal: number; fees: number; total: number } {
  const gateway = PAYMENT_GATEWAYS[paymentMethod];
  const fees = (amount * gateway.fees) / 100;

  return {
    subtotal: amount,
    fees: Math.round(fees * 100) / 100,
    total: Math.round((amount + fees) * 100) / 100,
  };
}

/**
 * Validate payment amount for a method
 */
export function validatePaymentAmount(
  amount: number,
  paymentMethod: PaymentMethod
): { valid: boolean; error?: string } {
  const gateway = PAYMENT_GATEWAYS[paymentMethod];

  if (amount < gateway.minAmount) {
    return {
      valid: false,
      error: `Minimum amount is ${gateway.minAmount}`,
    };
  }

  if (amount > gateway.maxAmount) {
    return {
      valid: false,
      error: `Maximum amount is ${gateway.maxAmount}`,
    };
  }

  return { valid: true };
}

/**
 * Get payment method details
 */
export function getPaymentMethodDetails(method: PaymentMethod): PaymentGatewayConfig {
  return PAYMENT_GATEWAYS[method];
}

/**
 * Format payment method display
 */
export function formatPaymentMethod(method: PaymentMethod): string {
  const gateway = PAYMENT_GATEWAYS[method];
  return `${gateway.icon} ${gateway.displayName}`;
}

/**
 * Get recommended payment methods for a region with pricing
 */
export function getRecommendedPaymentMethods(
  region: PaymentRegion,
  amount: number
): Array<{
  method: PaymentMethod;
  displayName: string;
  icon: string;
  fees: number;
  totalAmount: number;
  processingTime: string;
}> {
  const methods = getPaymentMethodsForRegion(region);

  return methods
    .map((method) => {
      const gateway = PAYMENT_GATEWAYS[method];
      const { fees, total } = calculateTotalWithFees(amount, method);

      return {
        method,
        displayName: gateway.displayName,
        icon: gateway.icon,
        fees,
        totalAmount: total,
        processingTime: gateway.processingTime,
      };
    })
    .sort((a, b) => a.fees - b.fees); // Sort by lowest fees first
}

/**
 * Generate payment initialization payload
 */
export function generatePaymentPayload(
  orderId: string,
  amount: number,
  currency: string,
  method: PaymentMethod,
  customerEmail: string
): Record<string, unknown> {
  const gateway = PAYMENT_GATEWAYS[method];

  return {
    orderId,
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    method,
    gateway: gateway.name,
    customerEmail,
    description: `B2B Wholesale Order #${orderId}`,
    metadata: {
      orderType: "wholesale",
      platform: "b2b_wholesale",
    },
  };
}

/**
 * Map country code to payment region with currency
 */
export function getRegionAndCurrency(countryCode: string): {
  region: PaymentRegion;
  currency: string;
  methods: PaymentMethod[];
} {
  const region = detectRegion(countryCode);
  const currency = getCurrencyForRegion(region);
  const methods = getPaymentMethodsForRegion(region);

  return { region, currency, methods };
}
