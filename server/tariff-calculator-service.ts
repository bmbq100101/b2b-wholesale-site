/**
 * Intelligent Tariff Calculator Service
 * Calculates import duties and taxes based on destination country
 */

export interface TariffRate {
  countryCode: string;
  countryName: string;
  dutyRate: number; // percentage
  vat: number; // percentage
  additionalTaxes: number; // percentage
  description: string;
}

export interface TariffCalculation {
  productValue: number;
  currency: string;
  countryCode: string;
  countryName: string;
  dutyAmount: number;
  vatAmount: number;
  additionalTaxes: number;
  totalTax: number;
  totalCost: number;
  breakdown: {
    productValue: number;
    duty: number;
    vat: number;
    additional: number;
  };
  estimatedDeliveryDays: number;
  notes: string;
}

// Tariff rates by country (simplified example - in production, use real tariff databases)
const TARIFF_RATES: Record<string, TariffRate> = {
  // Americas
  US: {
    countryCode: "US",
    countryName: "United States",
    dutyRate: 5.5,
    vat: 0, // No federal VAT
    additionalTaxes: 0,
    description: "US tariff rate for electronics and consumer goods",
  },
  CA: {
    countryCode: "CA",
    countryName: "Canada",
    dutyRate: 6.5,
    vat: 5, // GST
    additionalTaxes: 0,
    description: "Canadian tariff and GST",
  },
  MX: {
    countryCode: "MX",
    countryName: "Mexico",
    dutyRate: 7.0,
    vat: 16,
    additionalTaxes: 0,
    description: "Mexican tariff and IVA",
  },
  BR: {
    countryCode: "BR",
    countryName: "Brazil",
    dutyRate: 12.0,
    vat: 18,
    additionalTaxes: 5,
    description: "Brazilian tariff, ICMS, and additional fees",
  },
  AR: {
    countryCode: "AR",
    countryName: "Argentina",
    dutyRate: 10.0,
    vat: 21,
    additionalTaxes: 0,
    description: "Argentine tariff and IVA",
  },

  // Europe
  GB: {
    countryCode: "GB",
    countryName: "United Kingdom",
    dutyRate: 4.0,
    vat: 20,
    additionalTaxes: 0,
    description: "UK tariff and VAT",
  },
  DE: {
    countryCode: "DE",
    countryName: "Germany",
    dutyRate: 3.5,
    vat: 19,
    additionalTaxes: 0,
    description: "German tariff and VAT",
  },
  FR: {
    countryCode: "FR",
    countryName: "France",
    dutyRate: 3.5,
    vat: 20,
    additionalTaxes: 0,
    description: "French tariff and VAT",
  },
  IT: {
    countryCode: "IT",
    countryName: "Italy",
    dutyRate: 3.5,
    vat: 22,
    additionalTaxes: 0,
    description: "Italian tariff and VAT",
  },
  ES: {
    countryCode: "ES",
    countryName: "Spain",
    dutyRate: 3.5,
    vat: 21,
    additionalTaxes: 0,
    description: "Spanish tariff and VAT",
  },
  NL: {
    countryCode: "NL",
    countryName: "Netherlands",
    dutyRate: 3.5,
    vat: 21,
    additionalTaxes: 0,
    description: "Dutch tariff and VAT",
  },

  // Middle East
  AE: {
    countryCode: "AE",
    countryName: "United Arab Emirates",
    dutyRate: 5.0,
    vat: 5,
    additionalTaxes: 0,
    description: "UAE tariff and VAT",
  },
  SA: {
    countryCode: "SA",
    countryName: "Saudi Arabia",
    dutyRate: 5.0,
    vat: 15,
    additionalTaxes: 0,
    description: "Saudi Arabia tariff and VAT",
  },
  KW: {
    countryCode: "KW",
    countryName: "Kuwait",
    dutyRate: 4.0,
    vat: 0,
    additionalTaxes: 0,
    description: "Kuwaiti tariff (no VAT)",
  },
  QA: {
    countryCode: "QA",
    countryName: "Qatar",
    dutyRate: 4.0,
    vat: 0,
    additionalTaxes: 0,
    description: "Qatari tariff (no VAT)",
  },

  // Asia Pacific
  JP: {
    countryCode: "JP",
    countryName: "Japan",
    dutyRate: 3.0,
    vat: 10,
    additionalTaxes: 0,
    description: "Japanese tariff and consumption tax",
  },
  SG: {
    countryCode: "SG",
    countryName: "Singapore",
    dutyRate: 0,
    vat: 8,
    additionalTaxes: 0,
    description: "Singapore GST (minimal tariffs)",
  },
  HK: {
    countryCode: "HK",
    countryName: "Hong Kong",
    dutyRate: 0,
    vat: 0,
    additionalTaxes: 0,
    description: "Hong Kong (free port, no tariffs)",
  },
  AU: {
    countryCode: "AU",
    countryName: "Australia",
    dutyRate: 5.0,
    vat: 10,
    additionalTaxes: 0,
    description: "Australian tariff and GST",
  },
  NZ: {
    countryCode: "NZ",
    countryName: "New Zealand",
    dutyRate: 5.0,
    vat: 15,
    additionalTaxes: 0,
    description: "New Zealand tariff and GST",
  },
};

export const DELIVERY_TIMES: Record<string, number> = {
  // Americas
  US: 5,
  CA: 7,
  MX: 8,
  BR: 12,
  AR: 14,

  // Europe
  GB: 4,
  DE: 3,
  FR: 4,
  IT: 5,
  ES: 5,
  NL: 3,

  // Middle East
  AE: 6,
  SA: 7,
  KW: 7,
  QA: 7,

  // Asia Pacific
  JP: 5,
  SG: 3,
  HK: 2,
  AU: 8,
  NZ: 10,
};

/**
 * Get tariff rate for a country
 */
export function getTariffRate(countryCode: string): TariffRate | null {
  return TARIFF_RATES[countryCode.toUpperCase()] || null;
}

/**
 * Calculate tariffs for a product
 */
export function calculateTariff(
  productValue: number,
  countryCode: string,
  currency: string = "USD"
): TariffCalculation {
  const rate = getTariffRate(countryCode);

  if (!rate) {
    throw new Error(`Tariff information not available for country: ${countryCode}`);
  }

  const dutyAmount = (productValue * rate.dutyRate) / 100;
  const vatAmount = ((productValue + dutyAmount) * rate.vat) / 100;
  const additionalTaxAmount = ((productValue + dutyAmount + vatAmount) * rate.additionalTaxes) / 100;
  const totalTax = dutyAmount + vatAmount + additionalTaxAmount;
  const totalCost = productValue + totalTax;

  const estimatedDeliveryDays = DELIVERY_TIMES[countryCode.toUpperCase()] || 14;

  return {
    productValue,
    currency,
    countryCode: rate.countryCode,
    countryName: rate.countryName,
    dutyAmount: Math.round(dutyAmount * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    additionalTaxes: Math.round(additionalTaxAmount * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    breakdown: {
      productValue,
      duty: Math.round(dutyAmount * 100) / 100,
      vat: Math.round(vatAmount * 100) / 100,
      additional: Math.round(additionalTaxAmount * 100) / 100,
    },
    estimatedDeliveryDays,
    notes: rate.description,
  };
}

/**
 * Calculate tariffs for multiple products
 */
export function calculateBulkTariff(
  items: Array<{ productValue: number; quantity: number }>,
  countryCode: string,
  currency: string = "USD"
): TariffCalculation & { itemCount: number } {
  const totalValue = items.reduce((sum, item) => sum + item.productValue * item.quantity, 0);
  const calculation = calculateTariff(totalValue, countryCode, currency);

  return {
    ...calculation,
    itemCount: items.length,
  };
}

/**
 * Get all available countries for tariff calculation
 */
export function getAvailableCountries(): Array<{
  code: string;
  name: string;
  dutyRate: number;
  vat: number;
}> {
  return Object.values(TARIFF_RATES).map(rate => ({
    code: rate.countryCode,
    name: rate.countryName,
    dutyRate: rate.dutyRate,
    vat: rate.vat,
  }));
}

/**
 * Compare tariffs across multiple countries
 */
export function compareTariffs(
  productValue: number,
  countryCodes: string[],
  currency: string = "USD"
): Array<TariffCalculation & { rank: number }> {
  const calculations = countryCodes
    .map(code => {
      try {
        return calculateTariff(productValue, code, currency);
      } catch {
        return null;
      }
    })
    .filter((calc): calc is TariffCalculation => calc !== null)
    .sort((a, b) => a.totalCost - b.totalCost)
    .map((calc, idx) => ({
      ...calc,
      rank: idx + 1,
    }));

  return calculations;
}

/**
 * Get tariff summary for dashboard
 */
export function getTariffSummary(countryCode: string): {
  country: string;
  dutyRate: string;
  vatRate: string;
  estimatedDelivery: number;
  description: string;
} {
  const rate = getTariffRate(countryCode);

  if (!rate) {
    throw new Error(`Tariff information not available for country: ${countryCode}`);
  }

  return {
    country: rate.countryName,
    dutyRate: `${rate.dutyRate}%`,
    vatRate: `${rate.vat}%`,
    estimatedDelivery: DELIVERY_TIMES[countryCode.toUpperCase()] || 14,
    description: rate.description,
  };
}

/**
 * Estimate final price with tariffs
 */
export function estimateFinalPrice(
  productValue: number,
  countryCode: string,
  shippingCost: number = 0,
  currency: string = "USD"
): {
  productValue: number;
  shippingCost: number;
  subtotal: number;
  taxes: number;
  finalPrice: number;
  currency: string;
} {
  const calculation = calculateTariff(productValue, countryCode, currency);

  return {
    productValue,
    shippingCost,
    subtotal: productValue + shippingCost,
    taxes: calculation.totalTax,
    finalPrice: calculation.totalCost + shippingCost,
    currency,
  };
}
