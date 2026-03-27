/**
 * Business-level email notification functions.
 * Each function composes a template and calls sendMail().
 * All functions return a Promise<boolean> and never throw.
 *
 * Call fire-and-forget from API routes (no await needed):
 *   notify.bookingReceived(booking);   // don't await — don't block the response
 *
 * Every notification sends two emails:
 *   1. Guest   → confirmation / acknowledgment
 *   2. Admin   → action required / heads-up
 */

import {
  sendMail,
  emailLayout,
  heading,
  paragraph,
  detailTable,
  ctaButton,
  divider,
  badge,
  ADMIN_EMAIL,
  SITE_URL,
  SITE_NAME,
} from "@/lib/mailer";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BookingEmailData {
  bookingRef:   string;
  guestName:    string;
  guestEmail:   string;
  guestPhone?:  string;
  hotelName:    string;
  hotelCity:    string;
  roomName:     string;
  checkIn:      string;
  checkOut:     string;
  nights:       number;
  guestsCount:  number;
  totalAmount:  number;
  currency:     string;
  specialRequests?: string;
  ownerEmail?:  string;
}

export interface LeadEmailData {
  leadId:       string;
  guestName:    string;
  guestEmail:   string;
  guestPhone?:  string;
  hotelName:    string;
  hotelSlug?:   string;
  checkIn?:     string;
  checkOut?:    string;
  guestsCount?: number;
  budgetRange?: string;
  specialRequests?: string;
  source:       string;
}

export interface HotelStatusEmailData {
  ownerName:      string;
  ownerEmail:     string;
  hotelName:      string;
  hotelSlug:      string;
  status:         "approved" | "rejected";
  rejectedReason?: string;
  adminNotes?:    string;
}

// ── 1. Booking submitted ──────────────────────────────────────────────────────

/**
 * Sends:
 *   → Guest:  booking confirmation with all details
 *   → Admin:  new booking notification requiring manual confirmation
 */
export async function notifyBookingReceived(data: BookingEmailData): Promise<void> {
  const formattedAmount = `${data.currency} ${data.totalAmount.toLocaleString()}`;
  const details: [string, string][] = [
    ["Booking Ref",   data.bookingRef],
    ["Hotel",         `${data.hotelName} — ${data.hotelCity}`],
    ["Room",          data.roomName],
    ["Check-in",      data.checkIn],
    ["Check-out",     data.checkOut],
    ["Nights",        String(data.nights)],
    ["Guests",        String(data.guestsCount)],
    ["Total",         formattedAmount],
  ];
  if (data.specialRequests) {
    details.push(["Special Requests", data.specialRequests]);
  }

  // ── Guest confirmation ────────────────────────────────────────────────────
  const guestHtml = emailLayout(
    `
    ${heading("Booking Request Received")}
    ${badge("Pending Confirmation", "amber")}
    <br><br>
    ${paragraph(`Hi ${data.guestName},`)}
    ${paragraph(
      `Your booking request for <strong>${data.hotelName}</strong> has been received. ` +
      `The hotel team will review it and contact you within <strong>24 hours</strong> to confirm.`,
    )}
    ${detailTable(details)}
    ${paragraph(
      `<strong>What happens next?</strong><br>` +
      `The hotel team will contact you directly via email${data.guestPhone ? " or phone" : ""} ` +
      `to confirm availability and arrange payment. No charge has been made at this stage.`,
    )}
    ${divider()}
    ${paragraph(`If you have any questions, reply to this email and we'll help right away.`)}
    `,
    `Booking request ${data.bookingRef} received — ${data.hotelName}`,
  );

  // ── Admin / owner notification ────────────────────────────────────────────
  const recipients: string[] = [ADMIN_EMAIL()];
  if (data.ownerEmail && data.ownerEmail !== ADMIN_EMAIL()) {
    recipients.push(data.ownerEmail);
  }

  const adminHtml = emailLayout(
    `
    ${heading("New Booking Request")}
    ${badge("Action Required", "blue")}
    <br><br>
    ${paragraph(`A new booking request has been submitted and requires manual confirmation.`)}
    ${detailTable([
      ...details,
      ["Guest Email", data.guestEmail],
      ...(data.guestPhone ? [["Guest Phone", data.guestPhone] as [string, string]] : []),
    ])}
    ${ctaButton("View Booking in Dashboard", `${SITE_URL}/admin/bookings`)}
    ${paragraph(`Log in to the admin dashboard to confirm or cancel this booking.`)}
    `,
    `New booking: ${data.bookingRef} — ${data.hotelName}`,
  );

  await Promise.all([
    sendMail({ to: data.guestEmail, subject: `Booking Request Received — ${data.bookingRef}`, html: guestHtml }),
    sendMail({ to: recipients,      subject: `[Action Required] New Booking: ${data.bookingRef} — ${data.hotelName}`, html: adminHtml }),
  ]);
}

// ── 2. Booking confirmed ──────────────────────────────────────────────────────

/** Sends confirmation email to guest when a hotel owner/admin confirms a booking. */
export async function notifyBookingConfirmed(data: BookingEmailData): Promise<void> {
  const details: [string, string][] = [
    ["Booking Ref", data.bookingRef],
    ["Hotel",       `${data.hotelName} — ${data.hotelCity}`],
    ["Room",        data.roomName],
    ["Check-in",    data.checkIn],
    ["Check-out",   data.checkOut],
    ["Nights",      String(data.nights)],
    ["Guests",      String(data.guestsCount)],
    ["Total",       `${data.currency} ${data.totalAmount.toLocaleString()}`],
  ];

  const html = emailLayout(
    `
    ${heading("Your Booking is Confirmed!")}
    ${badge("Confirmed", "green")}
    <br><br>
    ${paragraph(`Hi ${data.guestName},`)}
    ${paragraph(
      `Great news! Your booking at <strong>${data.hotelName}</strong> has been confirmed. ` +
      `We look forward to welcoming you.`,
    )}
    ${detailTable(details)}
    ${paragraph(
      `<strong>Payment:</strong> The hotel team will contact you directly to arrange payment ` +
      `and share any additional check-in details.`,
    )}
    ${divider()}
    ${paragraph(`Questions? Reply to this email and we'll help right away.`)}
    `,
    `Booking confirmed — ${data.hotelName}`,
  );

  await sendMail({
    to:      data.guestEmail,
    subject: `Booking Confirmed ✓ — ${data.hotelName} (${data.bookingRef})`,
    html,
  });
}

// ── 3. Booking cancelled ──────────────────────────────────────────────────────

/** Notifies the guest that their booking has been cancelled. */
export async function notifyBookingCancelled(
  data: Pick<BookingEmailData, "bookingRef" | "guestName" | "guestEmail" | "hotelName">,
  reason?: string,
): Promise<void> {
  const html = emailLayout(
    `
    ${heading("Booking Cancelled")}
    ${badge("Cancelled", "red")}
    <br><br>
    ${paragraph(`Hi ${data.guestName},`)}
    ${paragraph(`Your booking at <strong>${data.hotelName}</strong> (ref: ${data.bookingRef}) has been cancelled.`)}
    ${reason ? paragraph(`<strong>Reason:</strong> ${reason}`) : ""}
    ${paragraph(`If you believe this is a mistake or would like to rebook, please reply to this email or visit our website.`)}
    ${ctaButton("Browse Other Hotels", `${SITE_URL}/deals`)}
    `,
    `Booking cancelled — ${data.bookingRef}`,
  );

  await sendMail({
    to:      data.guestEmail,
    subject: `Booking Cancelled — ${data.hotelName} (${data.bookingRef})`,
    html,
  });
}

// ── 4. Lead submitted ─────────────────────────────────────────────────────────

/**
 * Sends:
 *   → Guest:  acknowledgment that inquiry was received
 *   → Admin:  new lead notification for manual forwarding to hotel partner
 */
export async function notifyLeadReceived(data: LeadEmailData): Promise<void> {
  const detailRows: [string, string][] = [
    ["Hotel",  data.hotelName],
    ["Source", data.source],
  ];
  if (data.checkIn)      detailRows.push(["Check-in",  data.checkIn]);
  if (data.checkOut)     detailRows.push(["Check-out", data.checkOut]);
  if (data.guestsCount)  detailRows.push(["Guests",    String(data.guestsCount)]);
  if (data.budgetRange)  detailRows.push(["Budget",    data.budgetRange]);
  if (data.specialRequests) detailRows.push(["Message", data.specialRequests]);

  // ── Guest acknowledgment ──────────────────────────────────────────────────
  const guestHtml = emailLayout(
    `
    ${heading("Inquiry Received")}
    ${paragraph(`Hi ${data.guestName},`)}
    ${paragraph(
      `Thank you for your inquiry about <strong>${data.hotelName}</strong>. ` +
      `We have forwarded your request to the hotel team and they will contact you ` +
      `within <strong>24 hours</strong>.`,
    )}
    ${detailTable(detailRows)}
    ${paragraph(`If you have any urgent questions, please reply to this email.`)}
    ${ctaButton("Browse More Deals", `${SITE_URL}/deals`)}
    `,
    `Inquiry received — ${data.hotelName}`,
  );

  // ── Admin notification ────────────────────────────────────────────────────
  const adminHtml = emailLayout(
    `
    ${heading("New Lead Submitted")}
    ${badge("Forward to Hotel Partner", "amber")}
    <br><br>
    ${paragraph(`A new lead has been submitted and requires forwarding to the hotel partner.`)}
    ${detailTable([
      ["Lead ID",     data.leadId],
      ["Guest Name",  data.guestName],
      ["Guest Email", data.guestEmail],
      ...(data.guestPhone ? [["Guest Phone", data.guestPhone] as [string, string]] : []),
      ...detailRows,
    ])}
    ${ctaButton("Manage Leads", `${SITE_URL}/admin/leads`)}
    ${paragraph(
      `<strong>Next step:</strong> Contact the hotel partner (WhatsApp / email) and forward ` +
      `this lead. Then update its status in the dashboard.`,
    )}
    `,
    `New lead: ${data.guestName} → ${data.hotelName}`,
  );

  await Promise.all([
    sendMail({ to: data.guestEmail, subject: `Inquiry Received — ${data.hotelName}`, html: guestHtml }),
    sendMail({ to: ADMIN_EMAIL(),   subject: `[New Lead] ${data.guestName} → ${data.hotelName}`, html: adminHtml }),
  ]);
}

// ── 5. Hotel listing status ───────────────────────────────────────────────────

/** Notifies the hotel owner when their listing is approved or rejected. */
export async function notifyHotelStatus(data: HotelStatusEmailData): Promise<void> {
  const isApproved = data.status === "approved";

  const html = emailLayout(
    isApproved
      ? `
        ${heading("Your Hotel Listing is Live!")}
        ${badge("Approved", "green")}
        <br><br>
        ${paragraph(`Hi ${data.ownerName},`)}
        ${paragraph(
          `Congratulations! Your listing for <strong>${data.hotelName}</strong> has been ` +
          `approved and is now live on ${SITE_NAME}.`,
        )}
        ${data.adminNotes ? paragraph(`<strong>Admin Notes:</strong> ${data.adminNotes}`) : ""}
        ${ctaButton("View Your Listing", `${SITE_URL}/hotels/${data.hotelSlug}`)}
        ${paragraph(
          `Guests can now discover and book your property. Log in to your dashboard to ` +
          `manage rooms, update availability, and view inquiries.`,
        )}
        `
      : `
        ${heading("Listing Update Required")}
        ${badge("Not Approved", "red")}
        <br><br>
        ${paragraph(`Hi ${data.ownerName},`)}
        ${paragraph(
          `Unfortunately, your listing for <strong>${data.hotelName}</strong> could not be ` +
          `approved at this time.`,
        )}
        ${data.rejectedReason ? paragraph(`<strong>Reason:</strong> ${data.rejectedReason}`) : ""}
        ${data.adminNotes     ? paragraph(`<strong>Notes:</strong> ${data.adminNotes}`)         : ""}
        ${paragraph(
          `Please update your listing based on the feedback above and resubmit for review. ` +
          `Reply to this email if you have any questions.`,
        )}
        `,
    isApproved
      ? `Your listing for ${data.hotelName} is now live`
      : `Your listing for ${data.hotelName} needs attention`,
  );

  await sendMail({
    to:      data.ownerEmail,
    subject: isApproved
      ? `Listing Approved — ${data.hotelName} is now live on ${SITE_NAME}`
      : `Listing Update Required — ${data.hotelName}`,
    html,
  });
}

// ── 6. Welcome email ──────────────────────────────────────────────────────────

/** Sends a welcome email to a new user after signup. */
export async function notifyWelcome(
  email: string,
  fullName: string,
  role: "customer" | "hotel_owner" | "admin",
): Promise<void> {
  const isOwner = role === "hotel_owner";

  const html = emailLayout(
    `
    ${heading(`Welcome to ${SITE_NAME}!`)}
    ${paragraph(`Hi ${fullName},`)}
    ${paragraph(
      isOwner
        ? `Your hotel owner account has been created. You can now submit your property for listing ` +
          `and start reaching travellers across the Middle East.`
        : `Your account is ready. Start discovering the best hotel deals across Dubai, Makkah, Madinah, and more.`,
    )}
    ${ctaButton(
      isOwner ? "Submit Your Hotel" : "Browse Deals",
      isOwner ? `${SITE_URL}/partner` : `${SITE_URL}/deals`,
    )}
    ${paragraph(`If you have any questions, just reply to this email.`)}
    `,
    `Welcome to ${SITE_NAME}`,
  );

  await sendMail({
    to:      email,
    subject: `Welcome to ${SITE_NAME}`,
    html,
  });
}

// ── Convenience namespace export ──────────────────────────────────────────────
// Usage: import { notify } from "@/lib/notifications"
//        notify.bookingReceived(data);  // fire-and-forget

export const notify = {
  bookingReceived:  notifyBookingReceived,
  bookingConfirmed: notifyBookingConfirmed,
  bookingCancelled: notifyBookingCancelled,
  leadReceived:     notifyLeadReceived,
  hotelStatus:      notifyHotelStatus,
  welcome:          notifyWelcome,
};
