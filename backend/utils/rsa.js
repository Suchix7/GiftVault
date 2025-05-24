// Secure RSA implementation for MERN stack
import crypto from "crypto";

export class RSA {
  constructor() {
    this.generateKeys();
  }

  // Generate a random prime number of specified bit length
  generatePrime(bits) {
    const min = BigInt(2) ** BigInt(bits - 1);
    const max = BigInt(2) ** BigInt(bits) - BigInt(1);

    while (true) {
      // Generate random number in range
      const n = this.getRandomBigInt(min, max);
      if (this.isPrime(n)) {
        return n;
      }
    }
  }

  // Miller-Rabin primality test
  isPrime(n, k = 128) {
    if (n <= BigInt(1) || n === BigInt(4)) return false;
    if (n <= BigInt(3)) return true;

    const d = this.findD(n);

    for (let i = 0; i < k; i++) {
      if (!this.millerRabinTest(n, d)) {
        return false;
      }
    }
    return true;
  }

  // Helper for Miller-Rabin test
  findD(n) {
    let d = n - BigInt(1);
    while (d % BigInt(2) === BigInt(0)) {
      d /= BigInt(2);
    }
    return d;
  }

  // Single iteration of Miller-Rabin test
  millerRabinTest(n, d) {
    const a = this.getRandomBigInt(BigInt(2), n - BigInt(2));
    let x = this.modPow(a, d, n);

    if (x === BigInt(1) || x === n - BigInt(1)) return true;

    while (d !== n - BigInt(1)) {
      x = (x * x) % n;
      d *= BigInt(2);

      if (x === BigInt(1)) return false;
      if (x === n - BigInt(1)) return true;
    }
    return false;
  }

  // Generate random BigInt in range [min, max]
  getRandomBigInt(min, max) {
    const range = max - min;
    const bits = range.toString(2).length;
    let result;

    do {
      const bytes = crypto.randomBytes(Math.ceil(bits / 8));
      result = BigInt("0x" + bytes.toString("hex")) % range;
    } while (result < BigInt(0));

    return result + min;
  }

  // Generate RSA key pair
  generateKeys() {
    // Use 512-bit primes for 1024-bit total key length
    const p = this.generatePrime(512);
    const q = this.generatePrime(512);

    this.n = p * q;
    this.phi = (p - BigInt(1)) * (q - BigInt(1));

    // Common value for e
    this.e = BigInt(65537);

    // Calculate private exponent d
    this.d = this.modInverse(this.e, this.phi);
  }

  // Modular inverse using extended Euclidean algorithm
  modInverse(a, m) {
    let [g, x] = this.extendedGCD(a, m);
    if (g !== BigInt(1)) throw new Error("Modular inverse does not exist");
    return ((x % m) + m) % m;
  }

  // Extended Euclidean Algorithm
  extendedGCD(a, b) {
    if (b === BigInt(0)) return [a, BigInt(1), BigInt(0)];
    let [g, x, y] = this.extendedGCD(b, a % b);
    return [g, y, x - (a / b) * y];
  }

  // Fast modular exponentiation
  modPow(base, exp, mod) {
    base = base % mod;
    let result = BigInt(1);
    while (exp > BigInt(0)) {
      if (exp % BigInt(2) === BigInt(1)) {
        result = (result * base) % mod;
      }
      base = (base * base) % mod;
      exp = exp >> BigInt(1);
    }
    return result;
  }

  // Convert string to BigInt array
  stringToBigInts(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const chunkSize = 64; // Process in 64-byte chunks
    const chunks = [];

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      chunks.push(BigInt("0x" + Buffer.from(chunk).toString("hex")));
    }

    return chunks;
  }

  // Convert BigInt array back to string
  bigIntsToString(bigints) {
    const decoder = new TextDecoder();
    let result = "";

    for (const n of bigints) {
      const hex = n.toString(16);
      const bytes = Buffer.from(
        hex.padStart(2 * Math.ceil(hex.length / 2), "0"),
        "hex"
      );
      result += decoder.decode(bytes);
    }

    return result;
  }

  // Encrypt with public key
  encrypt(message) {
    const messageBigInts = this.stringToBigInts(message);
    const encrypted = messageBigInts.map((m) =>
      this.modPow(m, this.e, this.n).toString(16)
    );
    return encrypted.join(":");
  }

  // Parse private key from various formats
  parsePrivateKey(privateKey) {
    try {
      if (
        typeof privateKey === "object" &&
        privateKey !== null &&
        "d" in privateKey &&
        "n" in privateKey
      ) {
        return {
          d: BigInt(privateKey.d),
          n: BigInt(privateKey.n),
        };
      }

      if (typeof privateKey === "string") {
        try {
          const parsed = JSON.parse(privateKey);
          if ("d" in parsed && "n" in parsed) {
            return {
              d: BigInt(parsed.d),
              n: BigInt(parsed.n),
            };
          }
        } catch (e) {
          if (privateKey.includes('"d"') && privateKey.includes('"n"')) {
            const parsed = JSON.parse(privateKey);
            return {
              d: BigInt(parsed.d),
              n: BigInt(parsed.n),
            };
          }
        }
      }

      throw new Error("Invalid private key format");
    } catch (error) {
      throw new Error(`Failed to parse private key: ${error.message}`);
    }
  }

  // Decrypt with private key
  decrypt(encrypted, privateKey) {
    try {
      const parsedKey = this.parsePrivateKey(privateKey);
      const encryptedParts = encrypted
        .split(":")
        .map((part) => BigInt(`0x${part}`));

      const decryptedBigInts = encryptedParts.map((c) =>
        this.modPow(c, parsedKey.d, parsedKey.n)
      );

      return this.bigIntsToString(decryptedBigInts);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Get public key components
  getPublicKey() {
    return {
      e: this.e.toString(),
      n: this.n.toString(),
    };
  }

  // Get private key components
  getPrivateKey() {
    return JSON.stringify({
      d: this.d.toString(),
      n: this.n.toString(),
    });
  }
}

// Create and export a new instance for each operation
export const encrypt = (message) => {
  const rsa = new RSA();
  const privateKey = rsa.getPrivateKey();
  const encrypted = rsa.encrypt(message);
  return { encrypted, privateKey };
};

export const decrypt = (encrypted, privateKey) => {
  const rsa = new RSA();
  return rsa.decrypt(encrypted, privateKey);
};

export const generateNewKeys = () => {
  const rsa = new RSA();
  return {
    publicKey: rsa.getPublicKey(),
    privateKey: rsa.getPrivateKey(),
  };
};
