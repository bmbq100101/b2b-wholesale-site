import { ChatMessage } from "../drizzle/schema";

interface EmailTranscriptData {
  userName: string;
  userEmail: string | null | undefined;
  topic: string;
  startTime: Date;
  endTime: Date;
  messages: ChatMessage[];
  agentName?: string;
}

/**
 * Generate HTML email template for chat transcript
 */
export function generateChatTranscriptHTML(data: EmailTranscriptData): string {
  const formattedStartTime = data.startTime.toLocaleString();
  const formattedEndTime = data.endTime.toLocaleString();
  const duration = Math.round((data.endTime.getTime() - data.startTime.getTime()) / 60000);

  const messagesHTML = data.messages
    .map((msg) => {
      const senderName = msg.senderType === "customer" ? data.userName : (data.agentName || "Support Agent");
      const senderClass = msg.senderType === "customer" ? "customer-message" : "agent-message";
      const messageTime = new Date(msg.createdAt).toLocaleTimeString();

      return `
        <div class="message ${senderClass}">
          <div class="message-header">
            <strong>${senderName}</strong>
            <span class="message-time">${messageTime}</span>
          </div>
          <div class="message-content">${escapeHtml(msg.message)}</div>
        </div>
      `;
    })
    .join("");

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
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }
        .session-info {
          background-color: #f0f9ff;
          border-left: 4px solid #2563eb;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        .session-info-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          font-size: 14px;
        }
        .session-info-label {
          font-weight: 600;
          color: #1e40af;
          min-width: 100px;
        }
        .session-info-value {
          color: #333;
        }
        .messages-section {
          margin: 20px 0;
        }
        .messages-section h2 {
          color: #1e40af;
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .message {
          margin-bottom: 15px;
          padding: 12px;
          border-radius: 6px;
          background-color: #f9fafb;
          border-left: 3px solid #e5e7eb;
        }
        .message.customer-message {
          background-color: #dbeafe;
          border-left-color: #2563eb;
          margin-left: 20px;
        }
        .message.agent-message {
          background-color: #f3f4f6;
          border-left-color: #6b7280;
          margin-right: 20px;
        }
        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .message-header strong {
          color: #1f2937;
        }
        .message-time {
          color: #9ca3af;
          font-size: 12px;
        }
        .message-content {
          color: #374151;
          word-wrap: break-word;
          white-space: pre-wrap;
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
        .no-messages {
          text-align: center;
          color: #9ca3af;
          padding: 20px;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Chat Session Transcript</h1>
          <p>Your support conversation has been saved for your records</p>
        </div>

        <div class="session-info">
          <div class="session-info-row">
            <span class="session-info-label">Topic:</span>
            <span class="session-info-value">${escapeHtml(data.topic)}</span>
          </div>
          <div class="session-info-row">
            <span class="session-info-label">Started:</span>
            <span class="session-info-value">${formattedStartTime}</span>
          </div>
          <div class="session-info-row">
            <span class="session-info-label">Ended:</span>
            <span class="session-info-value">${formattedEndTime}</span>
          </div>
          <div class="session-info-row">
            <span class="session-info-label">Duration:</span>
            <span class="session-info-value">${duration} minutes</span>
          </div>
          ${data.agentName ? `
          <div class="session-info-row">
            <span class="session-info-label">Agent:</span>
            <span class="session-info-value">${escapeHtml(data.agentName)}</span>
          </div>
          ` : ""}
        </div>

        <div class="messages-section">
          <h2>Conversation</h2>
          ${messagesHTML || '<div class="no-messages">No messages in this conversation</div>'}
        </div>

        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>If you have further questions, please <a href="https://b2bwholesale.example.com/contact" class="footer-link">contact our support team</a>.</p>
          <p>&copy; 2024 B2B Wholesale Surplus Goods. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email template for chat transcript
 */
export function generateChatTranscriptText(data: EmailTranscriptData): string {
  const formattedStartTime = data.startTime.toLocaleString();
  const formattedEndTime = data.endTime.toLocaleString();
  const duration = Math.round((data.endTime.getTime() - data.startTime.getTime()) / 60000);

  const messagesText = data.messages
    .map((msg) => {
      const senderName = msg.senderType === "customer" ? data.userName : (data.agentName || "Support Agent");
      const messageTime = new Date(msg.createdAt).toLocaleTimeString();
      return `[${messageTime}] ${senderName}: ${msg.message}`;
    })
    .join("\n");

  return `
CHAT SESSION TRANSCRIPT
======================

Topic: ${data.topic}
Started: ${formattedStartTime}
Ended: ${formattedEndTime}
Duration: ${duration} minutes
${data.agentName ? `Agent: ${data.agentName}` : ""}

CONVERSATION
============

${messagesText || "No messages in this conversation"}

---
This is an automated email. Please do not reply to this message.
If you have further questions, please contact our support team.
© 2024 B2B Wholesale Surplus Goods. All rights reserved.
  `.trim();
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
 * Send chat transcript email using Manus built-in notification API
 */
export async function sendChatTranscriptEmail(
  data: EmailTranscriptData
): Promise<boolean> {
  try {
    const htmlContent = generateChatTranscriptHTML(data);
    const textContent = generateChatTranscriptText(data);

    // Use Manus built-in notification API
    const response = await fetch(
      `${process.env.BUILT_IN_FORGE_API_URL}/notification/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        },
        body: JSON.stringify({
          to: data.userEmail,
          subject: `Chat Transcript - ${data.topic}`,
          html: htmlContent,
          text: textContent,
        }),
      }
    );

    if (!response.ok) {
      console.error(
        "[Email] Failed to send transcript email:",
        await response.text()
      );
      return false;
    }

    console.log(`[Email] Chat transcript sent to ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending chat transcript:", error);
    return false;
  }
}
