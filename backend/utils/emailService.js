import nodemailer from "nodemailer";

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email template for sending private key
const getPrivateKeyEmailTemplate = (
  customerName,
  voucherName,
  value,
  privateKey,
  type,
  maxDiscount
) => {
  const formattedKey =
    typeof privateKey === "string" ? privateKey : JSON.stringify(privateKey);

  const valueText =
    type === "percentage"
      ? `offering a <strong>${value}% discount</strong>${
          maxDiscount && Number(maxDiscount) > 0
            ? ` (up to <strong>Rs. ${maxDiscount}</strong>)`
            : ""
        }`
      : `worth <strong>Rs. ${Number(value).toFixed(2)}</strong>`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb; text-align: center;">GiftVault Voucher Private Key</h2>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
        <p style="font-size: 16px;">Hello ${customerName},</p>
        <p style="font-size: 16px;">Thank you for purchasing the <strong>${voucherName}</strong> voucher ${valueText}.</p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1f2937;">Your Private Key:</p>
          <div style="font-family: 'Courier New', monospace; font-size: 13px; margin: 12px 0; padding: 14px; background-color: #f8fafc; border-radius: 4px; border: 2px solid #2563eb; user-select: all; -webkit-user-select: all; -moz-user-select: all; -ms-user-select: all;">
            <p style="margin: 0; color: #1f2937; word-break: break-all; line-height: 1.6;">${formattedKey}</p>
          </div>
          <div style="background-color: #eff6ff; padding: 12px; border-radius: 4px; border-left: 4px solid #2563eb; margin-top: 12px;">
            <p style="margin: 0; font-weight: 600; font-size: 13px; color: #1e40af;">📋 To Copy This Key:</p>
            <ol style="margin: 8px 0 0 0; padding-left: 20px; font-size: 12px; color: #1e40af;">
              <li>Triple-click the key above to select all text</li>
              <li>Press <strong>Ctrl+C</strong> (Windows) or <strong>Cmd+C</strong> (Mac)</li>
              <li>Paste when redeeming your voucher</li>
            </ol>
          </div>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Please keep this private key safe. You will need it to redeem your voucher.</p>
        <p style="font-size: 14px; color: #ef4444; font-weight: bold;">Important:</p>
        <ul style="font-size: 14px; color: #6b7280;">
          <li>Do not share this private key with anyone</li>
          <li>When redeeming, enter the key exactly as shown above</li>
          <li>Include all curly braces {}, quotes "", and other characters</li>
        </ul>
      </div>
      <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} GiftVault. All rights reserved.
      </p>
    </div>
  `;
};

// Email template for password reset
const getPasswordResetEmailTemplate = (userName, resetCode) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb; text-align: center;">GiftVault Password Reset</h2>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
        <p style="font-size: 16px;">Hello ${userName},</p>
        <p style="font-size: 16px;">You have requested to reset your password for your GiftVault account.</p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-weight: bold; color: #1f2937; font-size: 18px;">Your Reset Code:</p>
          <div style="font-family: monospace; font-size: 24px; font-weight: bold; margin: 15px 0; padding: 15px; background-color: #f8fafc; border-radius: 4px; color: #2563eb; letter-spacing: 3px;">
            ${resetCode}
          </div>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This code will expire in 5 minutes for security reasons.</p>
        <p style="font-size: 14px; color: #ef4444; font-weight: bold;">Important:</p>
        <ul style="font-size: 14px; color: #6b7280;">
          <li>Do not share this code with anyone</li>
          <li>The code is valid for only 5 minutes</li>
          <li>If you didn't request this reset, please ignore this email</li>
        </ul>
      </div>
      <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} GiftVault. All rights reserved.
      </p>
    </div>
  `;
};

// Send private key email
export const sendPrivateKeyEmail = async (
  customerEmail,
  customerName,
  voucherDetails,
  privateKey
) => {
  try {
    // Verify email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email service not configured");
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: "GiftVault - Your Voucher Private Key",
      html: getPrivateKeyEmailTemplate(
        customerName,
        voucherDetails.name,
        voucherDetails.value,
        privateKey,
        voucherDetails.type,
        voucherDetails.maxDiscount
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log("[Email] Private key sent successfully to:", customerEmail);
    console.log("Voucher Details:", voucherDetails);

    return true;
  } catch (error) {
    console.error("[Email] Error sending private key email:", error);
    throw new Error("Failed to send private key email");
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, userName, resetCode) => {
  try {
    // Verify email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email service not configured");
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "GiftVault - Password Reset Code",
      html: getPasswordResetEmailTemplate(userName, resetCode),
    };

    await transporter.sendMail(mailOptions);
    console.log("[Email] Password reset email sent successfully to:", email);

    return true;
  } catch (error) {
    console.error("[Email] Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};
