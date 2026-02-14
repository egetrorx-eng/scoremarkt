/**
 * Resend Email Utilities
 * ═══════════════════════════════════════════════════════════════
 * Pre-configured email sending with Swiss B2B professional templates.
 * Always enabled - used for transactional emails in all tiers.
 */

import { Resend } from 'resend';

// Initialize Resend client
const resendApiKey = import.meta.env.RESEND_API_KEY;
const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'noreply@example.com';

if (!resendApiKey) {
  console.warn('⚠️ RESEND_API_KEY is not set. Email sending will fail.');
}

export const resend = new Resend(resendApiKey);

/**
 * Email configuration
 */
export const emailConfig = {
  from: fromEmail,
  replyTo: import.meta.env.RESEND_REPLY_TO || fromEmail,
};

/**
 * Send email with error handling
 */
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || emailConfig.replyTo,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EMAIL TEMPLATES - ScoreMarkt Professional Style (English)
// ═══════════════════════════════════════════════════════════════

/**
 * Base email wrapper with ScoreMarkt branding
 */
function emailWrapper(content: string, footer?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ScoreMarkt Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; line-height: 1.6; color: #ffffff; background-color: #0A0E27;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0A0E27;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #0F1635; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px; background-color: #161F4A; text-align: center;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #BFFF00; letter-spacing: -0.02em;">ScoreMarkt</h2>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          ${footer ? `
          <tr>
            <td style="padding: 24px 40px; background-color: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4); text-align: center; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">
                ${footer}
              </p>
            </td>
          </tr>
          ` : ''}
        </table>
        <!-- Secondary Footer -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto 0;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">
                &copy; ${new Date().getFullYear()} ScoreMarkt Terminal. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Order Filled Notification
 */
export function orderFilledEmail(data: {
  name: string;
  orderId: string;
  market: string;
  side: string;
  shares: number;
  price: number;
}): string {
  const content = `
    <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #ffffff;">Limit Order Fulfilled ⚡️</h1>
    <p style="margin: 0 0 24px; color: rgba(255,255,255,0.6);">Hello ${data.name}, your limit order has been successfully executed on the professional terminal.</p>
    
    <div style="background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding-bottom: 8px; color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 700; text-transform: uppercase;">Market</td>
        </tr>
        <tr>
          <td style="padding-bottom: 16px; color: #ffffff; font-weight: 600; font-size: 14px;">${data.market}</td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td width="50%">
                  <div style="color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 700; text-transform: uppercase;">Side</div>
                  <div style="color: ${data.side === 'BUY' ? '#BFFF00' : '#FF4B4B'}; font-weight: 800; font-size: 16px;">${data.side}</div>
                </td>
                <td width="50%">
                  <div style="color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 700; text-transform: uppercase;">Execution Price</div>
                  <div style="color: #ffffff; font-weight: 800; font-size: 16px;">${data.price}¢</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 24px 0 0; text-align: center;">
      <a href="${process.env.SITE_URL || 'https://scoremarkt.com'}/portfolio" style="display: inline-block; padding: 14px 28px; background-color: #BFFF00; color: #0A0E27; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">View Portfolio</a>
    </p>
  `;

  return emailWrapper(content, 'This is an automated simulation alert from ScoreMarkt Pro.');
}

/**
 * Alpha Alert Notification
 */
export function alphaAlertEmail(data: {
  name: string;
  market: string;
  alphaScore: number;
  consensus: string;
}): string {
  const content = `
    <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #ffffff;">High Alpha Detected 💎</h1>
    <p style="margin: 0 0 24px; color: rgba(255,255,255,0.6);">Our AI analysis has identified a high-confidence trading opportunity.</p>
    
    <div style="background-color: rgba(191, 255, 0, 0.05); border-radius: 12px; padding: 24px; border: 1px solid rgba(191, 255, 0, 0.2);">
      <div style="font-size: 12px; color: #BFFF00; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Intelligence Protocol Active</div>
      <div style="font-size: 18px; color: #ffffff; font-weight: 700; margin-bottom: 16px;">${data.market}</div>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="50%">
            <div style="color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 700; text-transform: uppercase;">Alpha Score</div>
            <div style="color: #BFFF00; font-weight: 800; font-size: 24px;">${data.alphaScore}%</div>
          </td>
          <td width="50%">
            <div style="color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 700; text-transform: uppercase;">AI Consensus</div>
            <div style="color: #ffffff; font-weight: 800; font-size: 18px;">${data.consensus}</div>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 24px 0 0; text-align: center;">
      <a href="${process.env.SITE_URL || 'https://scoremarkt.com'}/markets" style="display: inline-block; padding: 14px 28px; border: 2px solid #BFFF00; color: #BFFF00; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">View Market</a>
    </p>
  `;

  return emailWrapper(content, 'Calculated by ScoreMarkt Alpha Engine v2.0');
}

/**
 * Welcome Email
 */
export function welcomeEmail(data: {
  name: string;
  loginUrl?: string;
}): string {
  const content = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #ffffff;">Welcome to the Terminal</h1>
    <p style="margin: 0 0 16px; color: rgba(255,255,255,0.6);">Hello ${data.name}, you have successfully gained access to ScoreMarkt's institutional-grade simulation platform.</p>
    
    <p style="margin: 0 0 24px; color: rgba(255,255,255,0.6);">Your account has been initialized with $5,000 in virtual USDC. You can now place market and limit orders on global football prediction markets.</p>
    
    ${data.loginUrl ? `
    <p style="margin: 0 0 32px; text-align: center;">
      <a href="${data.loginUrl}" style="display: inline-block; padding: 16px 32px; background-color: #BFFF00; color: #0A0E27; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Enter Terminal</a>
    </p>
    ` : ''}
    
    <p style="margin: 0; color: rgba(255,255,255,0.4); font-size: 14px;">If you have any questions, our support team is available via the Discord terminal channel.</p>
  `;

  return emailWrapper(content);
}


