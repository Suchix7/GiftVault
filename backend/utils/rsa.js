// Simplified RSA implementation for MERN stack
export class RSA {
  constructor() {
    // Pre-generated prime numbers (small for demo)
    this.p = 61n;
    this.q = 53n;
    this.n = this.p * this.q;
    this.phi = (this.p - 1n) * (this.q - 1n);
    this.e = 17n; // Public exponent
    this.d = this.modInverse(this.e, this.phi); // Private exponent
  }

  // Modular inverse for finding d
  modInverse(a, m) {
    let [g, x, y] = this.extendedGCD(a, m);
    if (g !== 1n) throw new Error("No inverse exists");
    return ((x % m) + m) % m;
  }

  // Extended Euclidean Algorithm
  extendedGCD(a, b) {
    if (b === 0n) return [a, 1n, 0n];
    let [g, x, y] = this.extendedGCD(b, a % b);
    return [g, y, x - (a / b) * y];
  }

  // Fast modular exponentiation
  modPow(base, exp, mod) {
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        result = (result * base) % mod;
      }
      exp = exp >> 1n;
      base = (base * base) % mod;
    }
    return result;
  }

  // Convert string to BigInt array
  stringToBigInts(str) {
    return str.split("").map((c) => BigInt(c.charCodeAt(0)));
  }

  // Convert BigInt array back to string
  bigIntsToString(bigints) {
    return bigints.map((b) => String.fromCharCode(Number(b))).join("");
  }

  // Encrypt with public key
  encrypt(message) {
    const messageBigInts = this.stringToBigInts(message);
    return messageBigInts.map((m) => this.modPow(m, this.e, this.n)).join(",");
  }

  // Parse private key from various formats
  parsePrivateKey(privateKey) {
    try {
      console.log("RSA parsePrivateKey - Input:", privateKey);

      // If already an object with d and n, use it directly
      if (
        typeof privateKey === "object" &&
        privateKey !== null &&
        "d" in privateKey &&
        "n" in privateKey
      ) {
        return {
          d: privateKey.d.toString(),
          n: privateKey.n.toString(),
        };
      }

      // If it's a string, try to parse it
      if (typeof privateKey === "string") {
        try {
          const parsed = JSON.parse(privateKey);
          if ("d" in parsed && "n" in parsed) {
            return {
              d: parsed.d.toString(),
              n: parsed.n.toString(),
            };
          }
        } catch (e) {
          // If JSON parsing fails, check if it's already in the correct format
          if (privateKey.includes('"d"') && privateKey.includes('"n"')) {
            return JSON.parse(privateKey);
          }
        }
      }

      throw new Error("Invalid private key format");
    } catch (error) {
      console.error("RSA parsePrivateKey - Error:", error);
      throw new Error(`Failed to parse private key: ${error.message}`);
    }
  }

  // Parse encrypted data from various formats
  parseEncryptedData(encrypted) {
    try {
      console.log("RSA parseEncryptedData - Input:", encrypted);

      // If it's a comma-separated list of numbers, use it directly
      if (encrypted.includes(",")) {
        return encrypted;
      }

      // If it's a hex string with a colon, split and convert
      if (encrypted.includes(":")) {
        const parts = encrypted.split(":");
        return parts.map((part) => BigInt(`0x${part}`).toString()).join(",");
      }

      // If it's a single hex string
      if (/^[0-9a-fA-F]+$/.test(encrypted)) {
        return BigInt(`0x${encrypted}`).toString();
      }

      return encrypted;
    } catch (error) {
      console.error("RSA parseEncryptedData - Error:", error);
      throw new Error(`Failed to parse encrypted data: ${error.message}`);
    }
  }

  // Decrypt with private key
  decrypt(encrypted, privateKey) {
    try {
      console.log("RSA decrypt - Input:", { encrypted, privateKey });

      // Parse and validate private key
      const parsedKey = this.parsePrivateKey(privateKey);
      console.log("RSA decrypt - Parsed key:", parsedKey);

      // Parse encrypted data
      const parsedEncrypted = this.parseEncryptedData(encrypted);
      console.log("RSA decrypt - Parsed encrypted data:", parsedEncrypted);

      // Convert to BigInt
      const dBigInt = BigInt(parsedKey.d);
      const nBigInt = BigInt(parsedKey.n);
      console.log("RSA decrypt - BigInt values:", {
        d: dBigInt.toString(),
        n: nBigInt.toString(),
      });

      // Decrypt using provided private key
      const encryptedBigInts = parsedEncrypted.split(",").map((b) => BigInt(b));
      console.log(
        "RSA decrypt - Encrypted values:",
        encryptedBigInts.map((b) => b.toString())
      );

      const decryptedBigInts = encryptedBigInts.map((c) =>
        this.modPow(c, dBigInt, nBigInt)
      );
      console.log(
        "RSA decrypt - Decrypted values:",
        decryptedBigInts.map((b) => b.toString())
      );

      const result = this.bigIntsToString(decryptedBigInts);
      console.log("RSA decrypt - Final result:", result);
      return result;
    } catch (error) {
      console.error("RSA decrypt - Error:", error);
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Get public key components
  getPublicKey() {
    return { e: this.e.toString(), n: this.n.toString() };
  }

  // Get private key components
  getPrivateKey() {
    return JSON.stringify({ d: this.d.toString(), n: this.n.toString() });
  }
}

// Create and export a singleton instance
const rsaInstance = new RSA();

export const encrypt = (message) => rsaInstance.encrypt(message);
export const decrypt = (encrypted, privateKey) =>
  rsaInstance.decrypt(encrypted, privateKey);
export const getPublicKey = () => rsaInstance.getPublicKey();
export const getPrivateKey = () => rsaInstance.getPrivateKey();
