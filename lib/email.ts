import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
export async function sendPasswordAddConfirmationEmail(email: string, token: string) {
  const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings?token=${token}`;
  const mailOptions = {
  from: process.env.FROM_EMAIL,
  to: email,
  subject: 'Confirm Your Password Setup',
  html: `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333;">Confirm Password Setup</h2>
      <p>You've created a new password for your account. To complete the setup, please click the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmationUrl}" 
           style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Confirm Password Setup
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        This link will expire in 15 minutes for security reasons.
      </p>
      
      <p style="color: #666; font-size: 14px;">
        If you didn't request this password setup, please ignore this email.
      </p>
    </div>
  `}
  
  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${token}`;

  // Käytä omaa email-lähetyskirjastoasi kuten nodemailer tai Resend
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Reset your password",
    html: `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
       <p>Or copy and paste this link in your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour</p>
    </div>
    `,
  }
  await transporter.sendMail(mailOptions);
}
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
  
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Verify your email address',
    html: `
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
    `,
  };

  await transporter.sendMail(mailOptions);
}