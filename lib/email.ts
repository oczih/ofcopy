import nodemailer from 'nodemailer';
import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

// ---- Mailgun API client ----
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
  url: process.env.MAILGUN_REGION === "EU" 
    ? "https://api.eu.mailgun.net" 
    : "https://api.mailgun.net",
});

// ---- Nodemailer (SMTP) transporter ----
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.MAILGUN_LOGIN,
    pass: process.env.MAILGUN_PASSWORD,
  },
});
function htmlToText(html: string) {
  return html
    .replace(/<\/?[^>]+(>|$)/g, "") // poista HTML-tagit
    .replace(/\s+/g, " ")            // siivoa whitespace
    .trim();
}
// ---- Example Mailgun API sender ----
export async function sendWithMailgunAPI(to: string, subject: string, html: string) {
  try {
    const data = await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: process.env.FROM_EMAIL!,
      to,
      subject,
      html,
      text: htmlToText(html), // oma tekstiversio
    });

    return data;
  } catch (error) {
    console.error("Mailgun API error:", error);
    throw error;
  }
}

// ---- Example Nodemailer SMTP sender ----
export async function sendWithSMTP(to: string, subject: string, html: string) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
}

// ---- Your existing emails using SMTP ----
export async function sendPasswordAddConfirmationEmail(email: string, token: string) {
  const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings?token=${token}`;
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333;">Confirm Password Setup</h2>
      <p>You've created a new password for your account. To complete the setup, please click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmationUrl}" 
           style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Confirm Password Setup
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes for security reasons.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this password setup, please ignore this email.</p>
    </div>
  `;
  return sendWithSMTP(email, "Confirm Your Password Setup", html);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${token}`;
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour</p>
    </div>
  `;
  return sendWithSMTP(email, "Reset your password", html);
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2>Welcome! Please verify your email address</h2>
      <p>Click the button below to verify your email address:</p>
      <a href="${verificationUrl}" 
         style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Verify Email Address
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;

  // Use Mailgun API client instead of SMTP
  return sendWithMailgunAPI(email, "Verify your email address", html);
}

export async function sendRejectionEmail(email: string, reason?: string) {
  const applicationUrl = `${process.env.NEXTAUTH_URL}/apply-creator`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2>Application Update</h2>
      <p>Unfortunately, your application to become a creator has been <strong>rejected</strong>.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>You can update your details and reapply by visiting the link below:</p>
      <a href="${applicationUrl}" 
         style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Reapply as Creator
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${applicationUrl}">${applicationUrl}</a></p>
    </div>
  `;

  return sendWithMailgunAPI(email, "Your Creator Application Status", html);
}

export async function sendAcceptanceEmail(email: string) {
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/settings`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2>Congratulations!</h2>
      <p>Your application to become a creator has been <strong>approved</strong>.</p>
      <p>You can now access your creator dashboard and start uploading content. Please click here to set up your payout method:</p>
      <a href="${dashboardUrl}" 
         style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Go to Dashboard
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${dashboardUrl}">${dashboardUrl}</a></p>
    </div>
  `;

  return sendWithMailgunAPI(email, "Your Creator Application Approved", html);
}