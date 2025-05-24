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
