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
  privateKey
) => {
  // Ensure the private key is properly formatted
  const formattedKey =
    typeof privateKey === "string" ? privateKey : JSON.stringify(privateKey);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb; text-align: center;">GiftVault Voucher Private Key</h2>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
        <p style="font-size: 16px;">Hello ${customerName},</p>
        <p style="font-size: 16px;">Thank you for purchasing the ${voucherName} voucher worth Rs. ${value}.</p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1f2937;">Your Private Key:</p>
          <div style="font-family: monospace; font-size: 14px; margin: 10px 0; padding: 10px; background-color: #f8fafc; border-radius: 4px;">
            <p style="margin: 0; color: #1f2937; word-break: break-all;">${formattedKey}</p>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Copy the entire key above, including the curly braces and quotes</p>
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
        privateKey
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log("[Email] Private key sent successfully to:", customerEmail);
    return true;
  } catch (error) {
    console.error("[Email] Error sending private key email:", error);
    throw new Error("Failed to send private key email");
  }
};
