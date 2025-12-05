import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("Email not fully configured. Skipping email sending.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: false,
    auth: {
      user,
      pass
    }
  });

  return transporter;
}

export async function sendBookingConfirmationEmail(booking) {
  const t = getTransporter();
  if (!t) return;

  const {
    email,
    customerName,
    bookingId,
    bookingDate,
    bookingTime,
    numberOfGuests,
    cuisinePreference,
    seatingPreference
  } = booking;

  const prettyDate = bookingDate;
  const prettyTime = bookingTime;

  const mailOptions = {
    from: process.env.SMTP_FROM || "no-reply@vaiu.ai",
    to: email,
    subject: `Your booking is confirmed – ID ${bookingId}`,
    text: `
Hi ${customerName},

Your restaurant booking is confirmed.

Booking ID: ${bookingId}
Date: ${prettyDate}
Time: ${prettyTime}
Guests: ${numberOfGuests}
Cuisine: ${cuisinePreference}
Seating: ${seatingPreference}

Thank you for booking via the Vaiu Voice Assistant.

Regards,
Vaiu Team
    `.trim()
  };

  try {
    await t.sendMail(mailOptions);
    console.log("Booking confirmation email sent to", email);
  } catch (err) {
    console.error("Error sending confirmation email:", err.message);
  }
}
