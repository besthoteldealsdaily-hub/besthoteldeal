/**
 * Free email delivery via Gmail SMTP + Nodemailer.
 *
 * Setup (one-time, takes 2 minutes):
 *  1. Enable 2-Step Verification on your Google account.
 *  2. Go to https://myaccount.google.com/apppasswords
 *  3. Create an App Password → copy the 16-char code.
 *  4. Add to .env.local:
 *       SMTP_USER=youremail@gmail.com
 *       SMTP_PASS=abcd efgh ijkl mnop   ← paste App Password (spaces OK)
 *       SMTP_FROM="Best Hotel Deals Daily <youremail@gmail.com>"
 *       ADMIN_EMAIL=youremail@gmail.com
 *
 * Free limits:
 *   Personal Gmail:          500 emails / day
 *   Google Workspace (free): 2 000 emails / day
 *
 * No credit card, no API key, no third-party service required.
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MailOptions {
  to:       string | string[];
  subject:  string;
  html:     string;
  replyTo?: string;
  cc?:      string | string[];
}

// ── Transporter factory ───────────────────────────────────────────────────────
// Creates a new transporter per call so it works on Vercel (stateless functions).

function createTransporter(): Transporter {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? "smtp.gmail.com",
    port:   parseInt(process.env.SMTP_PORT ?? "587", 10),
    secure: false,  // STARTTLS on port 587 (not SSL 465)
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    // Vercel functions have tight timeouts — keep connection fast
    connectionTimeout: 5000,
    greetingTimeout:   5000,
    socketTimeout:     10000,
  });
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FROM_ADDRESS = () =>
  process.env.SMTP_FROM ?? `Best Hotel Deals Daily <${process.env.SMTP_USER}>`;

export const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL ?? process.env.SMTP_USER ?? "";
export const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? "https://besthoteldealsdaily.com";
export const SITE_NAME   = "Best Hotel Deals Daily";

// ── Core send function ────────────────────────────────────────────────────────

/**
 * Sends an email. Returns true on success, false on failure.
 * Never throws — safe to call fire-and-forget from API routes.
 *
 * If SMTP_USER/SMTP_PASS are not set, logs to console in dev mode and skips in prod.
 */
export async function sendMail(options: MailOptions): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[mailer] SMTP not configured. Skipping: "${options.subject}" → ${options.to}`);
    }
    return false;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from:    FROM_ADDRESS(),
      to:      Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html:    options.html,
      replyTo: options.replyTo,
      cc:      options.cc
        ? Array.isArray(options.cc) ? options.cc.join(", ") : options.cc
        : undefined,
    });
    return true;
  } catch (err) {
    console.error("[mailer] Send failed:", (err as Error).message);
    return false;
  }
}

// ── Base email layout ─────────────────────────────────────────────────────────
// Simple, mobile-responsive HTML that renders well in all major email clients.

export function emailLayout(content: string, previewText = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SITE_NAME}</title>
  ${previewText ? `<span style="display:none;max-height:0;overflow:hidden;">${previewText}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:24px 32px;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <span style="color:#f59e0b;font-size:18px;font-weight:700;letter-spacing:-0.3px;">${SITE_NAME}</span>
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                ${SITE_NAME} · Middle East Hotel Deals
                <br>
                <a href="${SITE_URL}" style="color:#9ca3af;">${SITE_URL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Reusable email components ─────────────────────────────────────────────────

export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">${text}</h1>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">${text}</p>`;
}

export function detailTable(rows: [string, string][]): string {
  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 16px;font-size:13px;color:#6b7280;font-weight:500;white-space:nowrap;border-bottom:1px solid #f3f4f6;">${label}</td>
        <td style="padding:10px 16px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${value}</td>
      </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:16px 0;overflow:hidden;border-collapse:collapse;">
      ${rowsHtml}
    </table>`;
}

export function ctaButton(text: string, url: string): string {
  return `
    <table role="presentation" style="margin:24px 0;">
      <tr>
        <td>
          <a href="${url}" style="display:inline-block;background:#f59e0b;color:#1a1a2e;font-size:15px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">${text}</a>
        </td>
      </tr>
    </table>`;
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">`;
}

export function badge(text: string, color: "green" | "amber" | "red" | "blue" = "amber"): string {
  const colors = {
    green: "background:#dcfce7;color:#166534",
    amber: "background:#fef3c7;color:#92400e",
    red:   "background:#fee2e2;color:#991b1b",
    blue:  "background:#dbeafe;color:#1e40af",
  };
  return `<span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;${colors[color]};">${text}</span>`;
}
