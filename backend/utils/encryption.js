import crypto from "crypto";

// Import RSA functions
import {
  encrypt as rsaEncrypt,
  decrypt as rsaDecrypt,
  generateNewKeys,
} from "./rsa.js";

// Export RSA functions
export const encrypt = rsaEncrypt;
export const decrypt = rsaDecrypt;

// Export getPrivateKey as a function that generates new keys and returns the private key
export const getPrivateKey = () => {
  const { privateKey } = generateNewKeys();
  return privateKey;
};

// Generate a random voucher code
export const generateVoucherCode = (length = 12) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
const algorithm = "aes-256-cbc";
const key = crypto.createHash("sha256").update(process.env.AES_SECRET).digest(); // 32-byte key

// Encrypt any string with AES
export const encryptAES = (text) => {
  const iv = crypto.randomBytes(16); // Initialization Vector
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return {
    iv: iv.toString("base64"),
    data: encrypted,
  };
};

// Decrypt AES-encrypted data
export const decryptAES = (encryptedObj) => {
  const iv = Buffer.from(encryptedObj.iv, "base64");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedObj.data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
