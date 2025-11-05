/**
 * Social Media Sharing Service
 * Handles product sharing across multiple social media platforms
 */

export interface ShareableProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  images?: string[];
  basePrice: number;
  sku: string;
}

export interface SocialShareConfig {
  platform: "facebook" | "twitter" | "linkedin" | "whatsapp" | "email" | "telegram";
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  hashtags?: string[];
}

/**
 * Generate social media share URLs
 */
export function generateShareUrls(
  product: ShareableProduct,
  baseUrl: string
): Record<string, string> {
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const title = `Check out: ${product.name}`;
  const description = product.description || `Wholesale ${product.name} - ${product.sku}`;
  const encodedUrl = encodeURIComponent(productUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=wholesale,B2B,surplus`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
  };
}

/**
 * Generate email sharing template
 */
export function generateEmailTemplate(
  product: ShareableProduct,
  baseUrl: string,
  recipientEmail?: string
): { subject: string; body: string; htmlBody: string } {
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const price = (product.basePrice / 100).toFixed(2);

  const subject = `Wholesale Opportunity: ${product.name}`;

  const body = `
Hi,

I wanted to share this wholesale product with you:

Product: ${product.name}
SKU: ${product.sku}
Price: $${price}
Description: ${product.description || "Premium surplus goods"}

View Product: ${productUrl}

Best regards,
B2B Wholesale Surplus Goods Platform
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0052CC; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .product-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .product-info h3 { margin: 0 0 10px 0; color: #0052CC; }
    .product-info p { margin: 5px 0; }
    .cta-button { display: inline-block; background: #0052CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Wholesale Product Opportunity</h1>
    </div>
    <div class="content">
      <p>Hi,</p>
      <p>I wanted to share this wholesale product with you:</p>
      
      <div class="product-info">
        <h3>${product.name}</h3>
        <p><strong>SKU:</strong> ${product.sku}</p>
        <p><strong>Price:</strong> $${price}</p>
        <p><strong>Description:</strong> ${product.description || "Premium surplus goods"}</p>
      </div>

      <a href="${productUrl}" class="cta-button">View Product Details</a>

      <p>This is a great wholesale opportunity. Don't miss out!</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 B2B Wholesale Surplus Goods Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, body, htmlBody };
}

/**
 * Generate social media meta tags for product page
 */
export function generateMetaTags(
  product: ShareableProduct,
  baseUrl: string
): Record<string, string> {
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const imageUrl = product.images?.[0] || `${baseUrl}/default-product.jpg`;
  const price = (product.basePrice / 100).toFixed(2);

  return {
    "og:title": product.name,
    "og:description": product.description || "Premium surplus goods",
    "og:url": productUrl,
    "og:image": imageUrl,
    "og:type": "product",
    "og:price:amount": price,
    "og:price:currency": "USD",
    "twitter:card": "summary_large_image",
    "twitter:title": product.name,
    "twitter:description": product.description || "Premium surplus goods",
    "twitter:image": imageUrl,
  };
}

/**
 * Track social share events
 */
export interface ShareEvent {
  productId: number;
  platform: string;
  timestamp: Date;
  userId?: number;
  userAgent?: string;
  referrer?: string;
}

/**
 * Generate share tracking URL
 */
export function generateTrackingUrl(
  shareUrl: string,
  platform: string,
  productId: number
): string {
  const params = new URLSearchParams();
  params.set("utm_source", platform);
  params.set("utm_medium", "social");
  params.set("utm_campaign", `product_${productId}`);

  if (shareUrl.includes("?")) {
    return `${shareUrl}&${params.toString()}`;
  } else {
    return `${shareUrl}?${params.toString()}`;
  }
}

/**
 * Generate WhatsApp business message template
 */
export function generateWhatsAppTemplate(product: ShareableProduct, baseUrl: string): string {
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const price = (product.basePrice / 100).toFixed(2);

  return `
🛍️ *${product.name}*

📦 SKU: ${product.sku}
💰 Price: $${price}

${product.description || "Premium surplus goods"}

👉 View Details: ${productUrl}

#wholesale #B2B #surplus
  `.trim();
}

/**
 * Generate LinkedIn article template
 */
export function generateLinkedInTemplate(product: ShareableProduct, baseUrl: string): string {
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const price = (product.basePrice / 100).toFixed(2);

  return `
Exciting wholesale opportunity! 🎯

We're offering premium surplus goods at competitive prices.

Product: ${product.name}
SKU: ${product.sku}
Price: $${price}

${product.description || "Premium surplus goods from Dongguan"}

Interested in bulk orders? Visit our platform for more details:
${productUrl}

#wholesale #B2B #supplychain #sourcing
  `.trim();
}
