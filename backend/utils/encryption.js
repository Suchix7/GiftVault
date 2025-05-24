import crypto from "crypto";

// Import RSA functions
import {
  encrypt as rsaEncrypt,
  decrypt as rsaDecrypt,
  getPrivateKey as getRSAPrivateKey,
} from "./rsa.js";

// Export RSA functions directly
export const encrypt = rsaEncrypt;
export const decrypt = rsaDecrypt;
export const getPrivateKey = getRSAPrivateKey;

// Generate a random voucher code
export const generateVoucherCode = (length = 12) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
