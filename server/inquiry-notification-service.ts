import { InquiryNotification } from "../drizzle/schema";

interface InquiryEmailData {
  customerName: string;
  customerEmail: string;
  productName: string;
  productSku?: string;
  pageUrl?: string;
  inquiryDetails?: string;
}

interface InquirySMSData {
  customerPhone: string;
  productName: string;
  productSku?: string;
}

/**
 * Generate HTML email template for inquiry confirmation
 */
export function generateInquiryEmailHTML(data: InquiryEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #1e40af;
          font-size: 24px;
        }
        .content {
          margin: 20px 0;
        }
        .product-info {
          background-color: #f0f9ff;
          border-left: 4px solid #2563eb;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .product-info-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          font-size: 14px;
        }
        .product-info-label {
          font-weight: 600;
          color: #1e40af;
          min-width: 100px;
        }
        .product-info-value {
          color: #333;
        }
        .cta-button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: 600;
        }
        .cta-button:hover {
          background-color: #1e40af;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
        .footer-link {
          color: #2563eb;
          text-decoration: none;
        }
        .footer-link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ 询盘已收到</h1>
          <p>感谢您对我们产品的关注！</p>
        </div>

        <div class="content">
          <p>尊敬的 ${escapeHtml(data.customerName)},</p>
          <p>我们已成功收到您关于以下产品的询盘：</p>

          <div class="product-info">
            <div class="product-info-row">
              <span class="product-info-label">产品名称：</span>
              <span class="product-info-value">${escapeHtml(data.productName)}</span>
            </div>
            ${data.productSku ? `
            <div class="product-info-row">
              <span class="product-info-label">产品型号：</span>
              <span class="product-info-value">${escapeHtml(data.productSku)}</span>
            </div>
            ` : ""}
            ${data.pageUrl ? `
            <div class="product-info-row">
              <span class="product-info-label">产品链接：</span>
              <span class="product-info-value"><a href="${escapeHtml(data.pageUrl)}" style="color: #2563eb;">${escapeHtml(data.pageUrl)}</a></span>
            </div>
            ` : ""}
          </div>

          <p>我们的销售团队将在24小时内与您联系，为您提供详细的产品信息和报价。</p>

          ${data.pageUrl ? `
          <a href="${escapeHtml(data.pageUrl)}" class="cta-button">查看产品详情</a>
          ` : ""}

          <h3>接下来会发生什么？</h3>
          <ul>
            <li>我们的销售代表将审核您的询盘</li>
            <li>您将收到产品详细规格和定价信息</li>
            <li>我们可以提供样品供您评估</li>
            <li>协商最优的交易条款</li>
          </ul>

          <p>如有任何问题，请随时通过以下方式联系我们：</p>
          <ul>
            <li>电子邮件：sales@b2bwholesale.example.com</li>
            <li>电话：+86 769 1234 5678</li>
            <li>WhatsApp：+86 1234 5678</li>
          </ul>
        </div>

        <div class="footer">
          <p>这是一封自动生成的邮件，请勿直接回复。</p>
          <p>&copy; 2024 B2B Wholesale Surplus Goods. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email template for inquiry confirmation
 */
export function generateInquiryEmailText(data: InquiryEmailData): string {
  return `
尊敬的 ${data.customerName},

感谢您对我们产品的关注！

我们已成功收到您关于以下产品的询盘：

产品名称：${data.productName}
${data.productSku ? `产品型号：${data.productSku}` : ""}
${data.pageUrl ? `产品链接：${data.pageUrl}` : ""}

我们的销售团队将在24小时内与您联系，为您提供详细的产品信息和报价。

接下来会发生什么？
- 我们的销售代表将审核您的询盘
- 您将收到产品详细规格和定价信息
- 我们可以提供样品供您评估
- 协商最优的交易条款

如有任何问题，请随时通过以下方式联系我们：
电子邮件：sales@b2bwholesale.example.com
电话：+86 769 1234 5678
WhatsApp：+86 1234 5678

---
这是一封自动生成的邮件，请勿直接回复。
© 2024 B2B Wholesale Surplus Goods. All rights reserved.
  `.trim();
}

/**
 * Generate SMS message for inquiry confirmation
 */
export function generateInquirySMS(data: InquirySMSData): string {
  const productInfo = `${data.productName}${data.productSku ? ` (${data.productSku})` : ""}`;
  return `感谢您的询盘！我们已收到您关于"${productInfo}"的询问。销售团队将在24小时内与您联系。`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Send inquiry confirmation email
 */
export async function sendInquiryEmail(data: InquiryEmailData): Promise<boolean> {
  try {
    const htmlContent = generateInquiryEmailHTML(data);
    const textContent = generateInquiryEmailText(data);

    const response = await fetch(
      `${process.env.BUILT_IN_FORGE_API_URL}/notification/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        },
        body: JSON.stringify({
          to: data.customerEmail,
          subject: `询盘确认 - ${data.productName}`,
          html: htmlContent,
          text: textContent,
        }),
      }
    );

    if (!response.ok) {
      console.error(
        "[Inquiry Email] Failed to send email:",
        await response.text()
      );
      return false;
    }

    console.log(`[Inquiry Email] Confirmation email sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("[Inquiry Email] Error sending email:", error);
    return false;
  }
}

/**
 * Send inquiry confirmation SMS
 * Note: This requires SMS provider configuration (Twilio, AWS SNS, etc.)
 */
export async function sendInquirySMS(data: InquirySMSData): Promise<boolean> {
  try {
    const message = generateInquirySMS(data);

    // This is a placeholder for SMS sending
    // In production, you would integrate with Twilio, AWS SNS, or similar service
    console.log(`[Inquiry SMS] Would send SMS to ${data.customerPhone}: ${message}`);

    // Example: Twilio integration
    // const response = await fetch("https://api.twilio.com/2010-04-01/Accounts/{AccountSID}/Messages.json", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
    //     "Content-Type": "application/x-www-form-urlencoded",
    //   },
    //   body: new URLSearchParams({
    //     From: TWILIO_PHONE_NUMBER,
    //     To: data.customerPhone,
    //     Body: message,
    //   }).toString(),
    // });

    return true;
  } catch (error) {
    console.error("[Inquiry SMS] Error sending SMS:", error);
    return false;
  }
}
