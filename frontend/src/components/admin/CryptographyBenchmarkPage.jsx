import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Layers, Lock, Unlock, Zap, ShieldAlert, RefreshCw, Check } from "lucide-react";

// Pre-measured static data (derived from the hardware's real loop-based benchmarking results)
const BENCHMARK_DATA = [
  { size: 16, rsaEncrypt: 0.036, rsaDecrypt: 1.734, aesEncrypt: 0.015, aesDecrypt: 0.018, speedup: 94 },
  { size: 32, rsaEncrypt: 0.049, rsaDecrypt: 2.144, aesEncrypt: 0.016, aesDecrypt: 0.012, speedup: 175 },
  { size: 64, rsaEncrypt: 0.053, rsaDecrypt: 3.240, aesEncrypt: 0.013, aesDecrypt: 0.011, speedup: 290 },
  { size: 128, rsaEncrypt: 0.110, rsaDecrypt: 6.588, aesEncrypt: 0.019, aesDecrypt: 0.013, speedup: 526 },
  { size: 256, rsaEncrypt: 0.253, rsaDecrypt: 12.275, aesEncrypt: 0.011, aesDecrypt: 0.012, speedup: 1065 },
  { size: 512, rsaEncrypt: 0.870, rsaDecrypt: 24.432, aesEncrypt: 0.009, aesDecrypt: 0.012, speedup: 2103 },
  { size: 1024, rsaEncrypt: 1.247, rsaDecrypt: 52.284, aesEncrypt: 0.010, aesDecrypt: 0.012, speedup: 4234 },
];

// Browser RSA implementation using smaller primes (256-bit) for fast, responsive generation on load
class BrowserRSA {
  constructor() {
    this.e = 65537n;
    this.n = null;
    this.d = null;
  }

  generatePrime(bits) {
    const min = BigInt(2) ** BigInt(bits - 1);
    const max = BigInt(2) ** BigInt(bits) - BigInt(1);

    while (true) {
      const n = this.getRandomBigInt(min, max);
      if (this.isPrime(n)) {
        return n;
      }
    }
  }

  isPrime(n, k = 128) {
    if (n <= 1n || n === 4n) return false;
    if (n <= 3n) return true;

    const d = this.findD(n);

    for (let i = 0; i < k; i++) {
      if (!this.millerRabinTest(n, d)) {
        return false;
      }
    }
    return true;
  }

  findD(n) {
    let d = n - 1n;
    while (d % 2n === 0n) {
      d /= 2n;
    }
    return d;
  }

  millerRabinTest(n, d) {
    const a = this.getRandomBigInt(2n, n - 2n);
    let x = this.modPow(a, d, n);

    if (x === 1n || x === n - 1n) return true;

    while (d !== n - 1n) {
      x = (x * x) % n;
      d *= 2n;

      if (x === 1n) return false;
      if (x === n - 1n) return true;
    }
    return false;
  }

  getRandomBigInt(min, max) {
    const range = max - min;
    const bits = range.toString(2).length;
    let result;
    const bytesNeeded = Math.ceil(bits / 8);
    const array = new Uint8Array(bytesNeeded);

    do {
      window.crypto.getRandomValues(array);
      let hex = "";
      array.forEach(b => {
        hex += b.toString(16).padStart(2, "0");
      });
      result = BigInt("0x" + hex) % range;
    } while (result < 0n);

    return result + min;
  }

  generateKeys() {
    // 256-bit primes yield a 512-bit N, which is fast to generate (<200ms) and secure for benchmarks
    const p = this.generatePrime(256);
    const q = this.generatePrime(256);

    this.n = p * q;
    this.phi = (p - 1n) * (q - 1n);
    this.d = this.modInverse(this.e, this.phi);
  }

  modInverse(a, m) {
    let [g, x] = this.extendedGCD(a, m);
    if (g !== 1n) throw new Error("Modular inverse does not exist");
    return ((x % m) + m) % m;
  }

  extendedGCD(a, b) {
    if (b === 0n) return [a, 1n, 0n];
    let [g, x, y] = this.extendedGCD(b, a % b);
    return [g, y, x - (a / b) * y];
  }

  modPow(base, exp, mod) {
    base = base % mod;
    let result = 1n;
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        result = (result * base) % mod;
      }
      base = (base * base) % mod;
      exp = exp >> 1n;
    }
    return result;
  }

  stringToBigInts(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    // Use 32-byte chunks since N is 512-bit (64 bytes). Chunk size must be strictly smaller than N.
    const chunkSize = 32;
    const chunks = [];

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      let hex = "";
      chunk.forEach(b => {
        hex += b.toString(16).padStart(2, "0");
      });
      chunks.push(BigInt("0x" + hex));
    }

    return chunks;
  }

  bigIntsToString(bigints) {
    const decoder = new TextDecoder();
    let result = "";

    for (const n of bigints) {
      let hex = n.toString(16);
      if (hex.length % 2 !== 0) hex = "0" + hex;
      const bytes = new Uint8Array(
        hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
      result += decoder.decode(bytes);
    }

    return result;
  }

  encrypt(message) {
    const messageBigInts = this.stringToBigInts(message);
    const encrypted = messageBigInts.map((m) =>
      this.modPow(m, this.e, this.n).toString(16)
    );
    return encrypted.join(":");
  }

  decrypt(encrypted) {
    const encryptedParts = encrypted
      .split(":")
      .map((part) => BigInt(`0x${part}`));

    const decryptedBigInts = encryptedParts.map((c) =>
      this.modPow(c, this.d, this.n)
    );

    return this.bigIntsToString(decryptedBigInts);
  }
}

// Random string generator
function generateRandomData(bytes) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < bytes; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function CryptographyBenchmarkPage() {
  const [payloadSize, setPayloadSize] = useState(128);
  const [isRunning, setIsRunning] = useState(false);
  const [rsaKeys, setRsaKeys] = useState(null);
  const [generatingKeys, setGeneratingKeys] = useState(true);

  // Live Results State
  const [liveResults, setLiveResults] = useState(null);

  // Key Generation on component load
  useEffect(() => {
    const generateSessionKeys = () => {
      try {
        const rsa = new BrowserRSA();
        rsa.generateKeys();
        setRsaKeys({
          e: rsa.e,
          n: rsa.n,
          d: rsa.d,
        });
      } catch (err) {
        console.error("RSA Keygen failed:", err);
      } finally {
        setGeneratingKeys(false);
      }
    };

    // Run in a slight delay so loader mounts cleanly
    const timer = setTimeout(generateSessionKeys, 100);
    return () => clearTimeout(timer);
  }, []);

  // Estimations
  const rsaChunks = Math.max(1, Math.ceil(payloadSize / 32)); // chunks are 32-bytes in browser benchmark
  const rsaEstTime = rsaChunks * 3.55;
  const aesBlocks = Math.max(1, Math.ceil(payloadSize / 16));
  const aesEstTime = 0.008 + aesBlocks * 0.00005;
  const speedup = rsaEstTime / aesEstTime;

  const maxRenderedItems = 24;
  const renderedRsaChunks = Math.min(rsaChunks, maxRenderedItems);
  const renderedAesBlocks = Math.min(aesBlocks, maxRenderedItems);

  // Preset payload sizes (bytes)
  const presets = [16, 32, 64, 128, 256, 512, 1024];

  // Live Cryptography Benchmarking Function
  const runLiveBench = async () => {
    if (!rsaKeys) return;
    setIsRunning(true);
    // Delay slightly to let the UI update the spinner
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const plaintext = generateRandomData(payloadSize);

      // --- 1. RUN RSA LIVE ---
      const rsa = new BrowserRSA();
      // Inject already generated session keys
      rsa.e = rsaKeys.e;
      rsa.n = rsaKeys.n;
      rsa.d = rsaKeys.d;

      // RSA Encrypt Loop (Synchronous)
      const rsaEncIterations = 50;
      const tRsaEncStart = performance.now();
      let rsaCiphertext;
      for (let i = 0; i < rsaEncIterations; i++) {
        rsaCiphertext = rsa.encrypt(plaintext);
      }
      const tRsaEncEnd = performance.now();
      const rsaEncTime = (tRsaEncEnd - tRsaEncStart) / rsaEncIterations;

      // RSA Decrypt Loop (Synchronous)
      const rsaDecIterations = payloadSize <= 64 ? 20 : 5;
      const tRsaDecStart = performance.now();
      let rsaDecrypted;
      for (let i = 0; i < rsaDecIterations; i++) {
        rsaDecrypted = rsa.decrypt(rsaCiphertext);
      }
      const tRsaDecEnd = performance.now();
      const rsaDecTime = (tRsaDecEnd - tRsaDecStart) / rsaDecIterations;

      // Check correctness
      if (rsaDecrypted !== plaintext) {
        throw new Error("RSA Decryption integrity check failed!");
      }

      // --- 2. RUN AES LIVE (Using Web Crypto API) ---
      const aesKey = await window.crypto.subtle.generateKey(
        { name: "AES-CBC", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      const iv = window.crypto.getRandomValues(new Uint8Array(16));
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);

      // AES Encrypt Loop (Asynchronous, Parallelized)
      const aesIterations = 500;
      const tAesEncStart = performance.now();
      const encPromises = Array.from({ length: aesIterations }, () =>
        window.crypto.subtle.encrypt({ name: "AES-CBC", iv }, aesKey, data)
      );
      const aesCiphertexts = await Promise.all(encPromises);
      const tAesEncEnd = performance.now();
      const aesEncTime = (tAesEncEnd - tAesEncStart) / aesIterations;

      const aesCiphertext = aesCiphertexts[0];

      // AES Decrypt Loop (Asynchronous, Parallelized)
      const tAesDecStart = performance.now();
      const decPromises = Array.from({ length: aesIterations }, () =>
        window.crypto.subtle.decrypt({ name: "AES-CBC", iv }, aesKey, aesCiphertext)
      );
      const aesDecryptedBuffers = await Promise.all(decPromises);
      const tAesDecEnd = performance.now();
      const aesDecTime = (tAesDecEnd - tAesDecStart) / aesIterations;

      const decoder = new TextDecoder();
      const aesDecryptedText = decoder.decode(aesDecryptedBuffers[0]);

      if (aesDecryptedText !== plaintext) {
        throw new Error("AES Decryption integrity check failed!");
      }

      // Update Results
      setLiveResults({
        rsaEnc: rsaEncTime,
        rsaDec: rsaDecTime,
        aesEnc: aesEncTime,
        aesDec: aesDecTime,
        speedup: rsaDecTime / aesDecTime,
        size: payloadSize,
      });

    } catch (err) {
      console.error("Live bench failed:", err);
    } finally {
      setIsRunning(false);
    }
  };

  // Reset live results when size changes so user knows they need to rerun
  useEffect(() => {
    setLiveResults(null);
  }, [payloadSize]);

  if (generatingKeys) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-[10px] font-black uppercase tracking-widest">
          Generating Session Cryptography Keys...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
            Crypto Benchmarks
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Compare estimated models with actual hardware benchmarking run live in your browser.
          </p>
        </div>
      </header>

      {/* Main Grid: Chart + Simulator (Chart commented out, displaying Simulator centered) */}
      <div className="max-w-2xl mx-auto w-full">
        {/* 
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm xl:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                Decryption Performance Curve
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                RSA decryption scales linearly with 32-byte chunks; AES is flat and sub-millisecond.
              </p>
            </div>
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={BENCHMARK_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="size"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val} B`}
                />
                
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#6366f1"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}ms`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#06b6d4"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}ms`}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "1.25rem",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    fontFamily: "inherit",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                />
                <Legend
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                      {value}
                    </span>
                  )}
                />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rsaDecrypt"
                  name="RSA Decrypt (ms)"
                  stroke="#6366f1"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  dot={{ strokeWidth: 2, r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="aesDecrypt"
                  name="AES Decrypt (ms)"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  dot={{ strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        */}

        {/* Live Simulator Card */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between w-full">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
              Hardware Benchmarking
            </h3>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setPayloadSize(preset)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                    payloadSize === preset
                      ? "bg-black text-white"
                      : "bg-gray-50 border border-gray-100 text-gray-400 hover:text-black hover:border-gray-200"
                  }`}
                >
                  {preset} B
                </button>
              ))}
            </div>

            {/* Input payload size */}
            <div className="space-y-2 mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Payload Size
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={payloadSize}
                  onChange={(e) => setPayloadSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 h-14 px-5 bg-gray-50 border border-transparent focus:border-gray-200 rounded-2xl font-bold text-gray-900 focus:bg-white outline-none transition-all"
                />
                <div className="h-14 px-5 bg-gray-50 rounded-2xl flex items-center justify-center font-bold text-gray-400 text-sm">
                  bytes
                </div>
              </div>
            </div>

            {/* Live Bench Action Button */}
            <button
              onClick={runLiveBench}
              disabled={isRunning}
              className="w-full mb-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  Running live bench...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Run Live Hardware Test
                </>
              )}
            </button>

            {/* Results Grid */}
            <div className="space-y-4">
              {/* RSA Box */}
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    RSA Decryption
                  </span>
                  <div className="text-right">
                    <div className="text-xs font-black text-indigo-600">
                      {liveResults ? `${liveResults.rsaDec.toFixed(3)} ms` : `${rsaEstTime.toFixed(2)} ms`}
                    </div>
                    {liveResults && (
                      <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-0.5 flex items-center justify-end gap-0.5">
                        <Check size={8} /> Live Math Done
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  Processed in {rsaChunks} chunk{rsaChunks > 1 ? "s" : ""} of 32 bytes.
                </p>
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {Array.from({ length: renderedRsaChunks }).map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-indigo-50 border border-indigo-200 text-indigo-400 text-[8px] font-black rounded flex items-center justify-center"
                      title={`Chunk ${i + 1}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                  {rsaChunks > maxRenderedItems && (
                    <span className="text-[9px] font-bold text-gray-400 self-end ml-1">
                      + {rsaChunks - maxRenderedItems} more
                    </span>
                  )}
                </div>
              </div>

              {/* AES Box */}
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    AES-256-CBC Decrypt
                  </span>
                  <div className="text-right">
                    <div className="text-xs font-black text-cyan-600">
                      {liveResults ? `${liveResults.aesDec.toFixed(4)} ms` : `${aesEstTime.toFixed(4)} ms`}
                    </div>
                    {liveResults && (
                      <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-0.5 flex items-center justify-end gap-0.5">
                        <Check size={8} /> Live Web Crypto
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  Processed in {aesBlocks} block{aesBlocks > 1 ? "s" : ""} of 16 bytes.
                </p>
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {Array.from({ length: renderedAesBlocks }).map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-cyan-50 border border-cyan-200 text-cyan-400 text-[8px] font-black rounded flex items-center justify-center"
                      title={`Block ${i + 1}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                  {aesBlocks > maxRenderedItems && (
                    <span className="text-[9px] font-bold text-gray-400 self-end ml-1">
                      + {aesBlocks - maxRenderedItems} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Speedup Display */}
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl mt-6">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                AES Decryption Speedup
              </span>
              <span className="text-sm font-black text-emerald-600">
                ≈ {liveResults 
                  ? liveResults.speedup.toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                  : speedup.toLocaleString(undefined, { maximumFractionDigits: 0 })}×
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
