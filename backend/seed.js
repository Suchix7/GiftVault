import "dotenv/config";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// ─── Models ──────────────────────────────────────────────────────────────────
import { User } from "./models/UserModel.js";
import Voucher from "./models/VoucherModel.js";
import LoyaltyRule from "./models/LoyaltyRuleModel.js";
import UserProgress from "./models/UserProgressModel.js";

// ─── Real RSA + AES from project utils ───────────────────────────────────────
import { encrypt as rsaEncrypt } from "./utils/rsa.js";

const algorithm = "aes-256-cbc";
const getAESKey = () =>
  crypto.createHash("sha256").update(process.env.AES_SECRET || "giftvault_default_secret").digest();

const encryptAES = (text) => {
  const key = getAESKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return { iv: iv.toString("base64"), data: encrypted };
};

const generateVoucherCode = (length = 12) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

// Real RSA encryption — each voucher gets its own key pair
const makeEncryptedVoucher = (code) => {
  const { encrypted: encryptedCode, privateKey } = rsaEncrypt(code);
  const encryptedPrivateKey = encryptAES(privateKey);
  const publicKey = { length: code.length, prefix: code.substring(0, 2) };
  return { encryptedCode, encryptedPrivateKey, publicKey };
};


// ─── Universal seed password ──────────────────────────────────────────────────
const SEED_PASSWORD = "Demo@1234";

// ─── Vendor definitions ───────────────────────────────────────────────────────
const VENDORS = [
  { name: "Arun Sharma",     companyName: "Brew & Bean Cafe",        email: "brew.bean@giftvault.demo",      vendorCategory: "Cafe",        number: "9801000001" },
  { name: "Priya Thapa",     companyName: "Spice Garden Restaurant", email: "spice.garden@giftvault.demo",   vendorCategory: "Restaurant",  number: "9801000002" },
  { name: "Rajan Karki",     companyName: "TrendZone Clothing",      email: "trendzone@giftvault.demo",      vendorCategory: "Clothing",    number: "9801000003" },
  { name: "Sunita Rai",      companyName: "TechHub Electronics",     email: "techhub@giftvault.demo",        vendorCategory: "Electronics", number: "9801000004" },
  { name: "Bikash Gurung",   companyName: "Glow Beauty Studio",      email: "glow.beauty@giftvault.demo",    vendorCategory: "Beauty",      number: "9801000005" },
  { name: "Kamala Shrestha", companyName: "QuickFix Services",       email: "quickfix@giftvault.demo",       vendorCategory: "Services",    number: "9801000006" },
  { name: "Dipesh Magar",    companyName: "Himalayan Cafe",          email: "himalayan.cafe@giftvault.demo", vendorCategory: "Cafe",        number: "9801000007" },
  { name: "Anita Basnet",    companyName: "Fusion Kitchen",          email: "fusion.kitchen@giftvault.demo", vendorCategory: "Restaurant",  number: "9801000008" },
  { name: "Sagar Adhikari",  companyName: "Style Street",            email: "style.street@giftvault.demo",   vendorCategory: "Clothing",    number: "9801000009" },
  { name: "Meena Tamang",    companyName: "Wellness Spa",            email: "wellness.spa@giftvault.demo",   vendorCategory: "Beauty",      number: "9801000010" },
];

// ─── Customer definitions ─────────────────────────────────────────────────────
const USERS = [
  { name: "Rajesh Pandey",  email: "rajesh.pandey@giftvault.demo",  number: "9802000001", bonusPoints: 42  },
  { name: "Sita Devi",      email: "sita.devi@giftvault.demo",       number: "9802000002", bonusPoints: 18  },
  { name: "Hari Bahadur",   email: "hari.bahadur@giftvault.demo",    number: "9802000003", bonusPoints: 75  },
  { name: "Laxmi Koirala",  email: "laxmi.koirala@giftvault.demo",   number: "9802000004", bonusPoints: 9   },
  { name: "Prakash Oli",    email: "prakash.oli@giftvault.demo",      number: "9802000005", bonusPoints: 130 },
  { name: "Kavita Joshi",   email: "kavita.joshi@giftvault.demo",    number: "9802000006", bonusPoints: 55  },
  { name: "Nabin Dahal",    email: "nabin.dahal@giftvault.demo",     number: "9802000007", bonusPoints: 28  },
  { name: "Puja Acharya",   email: "puja.acharya@giftvault.demo",    number: "9802000008", bonusPoints: 88  },
  { name: "Roshan Khatri",  email: "roshan.khatri@giftvault.demo",   number: "9802000009", bonusPoints: 11  },
  { name: "Manisha Gautam", email: "manisha.gautam@giftvault.demo",  number: "9802000010", bonusPoints: 63  },
];

const ADMIN = { name: "GiftVault Admin", email: "admin@giftvault.demo", number: "9800000000" };

// ─── Voucher factory (5 per vendor) ──────────────────────────────────────────
const makeVouchers = (vendorId, category) => {
  const future30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const future90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const past5    = new Date(Date.now() -  5 * 24 * 60 * 60 * 1000);
  return [
    {
      vendorId, category, name: "Weekend Flash Sale",
      type: "percentage", value: 20, maxDiscount: 500,
      description: "20% off your next purchase this weekend!", campaign: "Weekend Sale",
      status: "active", expiryDate: future30, maxRedemptions: -1,
      isPaid: false, pointsRequired: 0, color: "#6366f1",
      sentCount: Math.floor(Math.random() * 60) + 20,
    },
    {
      vendorId, category, name: "Loyalty Reward Voucher",
      type: "amount", value: 200,
      description: "Rs.200 off for our loyal customers.", campaign: "Loyalty Program",
      status: "active", expiryDate: future90, maxRedemptions: 50,
      isPaid: false, pointsRequired: 0, color: "#10b981",
      sentCount: Math.floor(Math.random() * 40) + 10,
    },
    {
      vendorId, category, name: "Premium Discount Pass",
      type: "percentage", value: 35, maxDiscount: 1000,
      description: "Exclusive 35% off. Redeem with loyalty points.", campaign: "Points Exclusive",
      status: "active", expiryDate: future90, maxRedemptions: 20,
      isPaid: true, pointsRequired: 15, color: "#f59e0b",
      sentCount: Math.floor(Math.random() * 30) + 5,
    },
    {
      vendorId, category, name: "Grand Opening Special",
      type: "amount", value: 500,
      description: "Grand opening celebration offer.", campaign: "Grand Opening",
      status: "expired", expiryDate: past5, maxRedemptions: 100,
      isPaid: false, pointsRequired: 0, color: "#ef4444",
      sentCount: 100,
    },
    {
      vendorId, category, name: "Coming Soon Offer",
      type: "percentage", value: 15,
      description: "Upcoming special offer. Stay tuned!", campaign: "Upcoming",
      status: "draft", expiryDate: future90, maxRedemptions: -1,
      isPaid: false, pointsRequired: 0, color: "#8b5cf6",
      sentCount: 0,
    },
  ];
};

// ─── Loyalty rule templates ───────────────────────────────────────────────────
const LOYALTY_RULES = [
  { threshold: 5,  pointsPerScan: 1, rewardText: "Free Coffee" },
  { threshold: 8,  pointsPerScan: 2, rewardText: "Free Dessert" },
  { threshold: 10, pointsPerScan: 1, rewardText: "10% off next visit" },
  { threshold: 6,  pointsPerScan: 1, rewardText: "Free Accessory" },
  { threshold: 5,  pointsPerScan: 2, rewardText: "Free Beauty Treatment" },
  { threshold: 7,  pointsPerScan: 1, rewardText: "Free Service" },
  { threshold: 5,  pointsPerScan: 1, rewardText: "Free Drink" },
  { threshold: 8,  pointsPerScan: 2, rewardText: "Free Starter" },
  { threshold: 10, pointsPerScan: 1, rewardText: "Free T-Shirt" },
  { threshold: 6,  pointsPerScan: 2, rewardText: "Free Facial" },
];

// ─── Progress scenarios ───────────────────────────────────────────────────────
// [currentStamps, totalPoints, rewardEarnedCount, hasPendingReward, hasClaimedReward]
const PROGRESS_SCENARIOS = [
  [3,  12, 0, false, false],  // actively collecting, no reward yet
  [7,  25, 1, true,  false],  // earned a reward, not claimed yet
  [0,  30, 2, false, true ],  // 2 rewards claimed, reset stamps
  [4,  18, 1, false, true ],  // 1 claimed, collecting again
  [9,  40, 2, true,  true ],  // power user — pending + claimed
  [2,   8, 0, false, false],  // just started
  [5,  20, 1, true,  false],  // just hit threshold
  [1,   4, 0, false, false],  // brand new
  [6,  28, 1, false, true ],  // claimed 1, collecting
  [8,  35, 2, true,  true ],  // very active
];

// ═══════════════════════════════════════════════════════════════════════════════
async function seed() {
  console.log("\n" + "=".repeat(60));
  console.log("  GiftVault Seed Script");
  console.log("=".repeat(60) + "\n");

  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/giftvault");
  console.log("Connected to MongoDB\n");

  // 1. Clean demo data
  console.log("Clearing old demo data...");
  const oldVendors = await User.find({ email: /@giftvault\.demo$/ });
  const oldVendorIds = oldVendors.map(v => v._id);
  await User.deleteMany({ email: /@giftvault\.demo$/ });
  await Voucher.deleteMany({ vendorId: { $in: oldVendorIds } });
  await LoyaltyRule.deleteMany({ vendorId: { $in: oldVendorIds } });
  await UserProgress.deleteMany({ vendorId: { $in: oldVendorIds } });
  console.log("Done.\n");

  // 2. Admin
  await User.create({
    name: ADMIN.name, email: ADMIN.email, password: SEED_PASSWORD,
    number: ADMIN.number, role: "admin", isApproved: true, bonusPoints: 0,
  });

  // 3. Vendors
  const vendorDocs = [];
  for (const v of VENDORS) {
    const doc = await User.create({
      name: v.name, email: v.email, password: SEED_PASSWORD,
      number: v.number, companyName: v.companyName,
      vendorCategory: v.vendorCategory, role: "vendor",
      isApproved: true, bonusPoints: 0,
    });
    vendorDocs.push(doc);
  }
  console.log(`Created ${vendorDocs.length} vendors.`);

  // 4. Loyalty rules
  const loyaltyRuleDocs = [];
  for (let i = 0; i < vendorDocs.length; i++) {
    const rule = LOYALTY_RULES[i % LOYALTY_RULES.length];
    const doc = await LoyaltyRule.create({
      vendorId: vendorDocs[i]._id, ...rule, isActive: true,
    });
    loyaltyRuleDocs.push(doc);
  }
  console.log(`Created ${loyaltyRuleDocs.length} loyalty rules.`);

  // 5. Vouchers
  const allVouchers = [];
  for (const vendor of vendorDocs) {
    const templates = makeVouchers(vendor._id, vendor.vendorCategory);
    for (const template of templates) {
      const code = generateVoucherCode();
      const { encryptedCode, encryptedPrivateKey, publicKey } = makeEncryptedVoucher(code);
      const voucher = await Voucher.create({ ...template, encryptedCode, encryptedPrivateKey, publicKey, redeemedCount: 0 });
      allVouchers.push({ voucher, code });
    }
  }
  const activeVouchers = allVouchers.filter(v => v.voucher.status === "active");
  console.log(`Created ${allVouchers.length} vouchers (${activeVouchers.length} active).`);

  // 6. Customers
  const userDocs = [];
  for (const u of USERS) {
    const doc = await User.create({
      name: u.name, email: u.email, password: SEED_PASSWORD,
      number: u.number, role: "user", isApproved: true,
      bonusPoints: u.bonusPoints, redeemedVouchers: [],
    });
    userDocs.push(doc);
  }
  console.log(`Created ${userDocs.length} customers.`);

  // 7. UserProgress + Redemptions
  let progressCount = 0;
  let redemptionCount = 0;

  for (let ui = 0; ui < userDocs.length; ui++) {
    const user = userDocs[ui];

    // Assign each user to 3–6 vendors (offset by index so coverage is spread)
    const vendorCount = (ui % 4) + 3;
    const startIdx = ui % vendorDocs.length;
    const assignedVendors = [];
    for (let k = 0; k < vendorCount; k++) {
      assignedVendors.push(vendorDocs[(startIdx + k) % vendorDocs.length]);
    }

    for (let vi = 0; vi < assignedVendors.length; vi++) {
      const vendor = assignedVendors[vi];
      const rule = loyaltyRuleDocs.find(r => r.vendorId.toString() === vendor._id.toString());
      const [stamps, totalPts, rewardCount, hasPending, hasClaimed] = PROGRESS_SCENARIOS[(ui + vi) % PROGRESS_SCENARIOS.length];

      const claimedRewards = hasClaimed
        ? Array.from({ length: Math.min(rewardCount, 2) }, (_, idx) => ({
            claimedAt: new Date(Date.now() - (idx + 1) * 7 * 24 * 60 * 60 * 1000),
            stampsAtClaim: rule?.threshold || 5,
            description: rule?.rewardText || "Free Item",
          }))
        : [];

      const pendingRewards = hasPending
        ? [{
            earnedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            stampsAtEarn: rule?.threshold || 5,
            description: rule?.rewardText || "Free Item",
            qrToken: uuidv4(),
            isRedeemed: false,
          }]
        : [];

      await UserProgress.create({
        userId: user._id, vendorId: vendor._id,
        currentStamps: stamps, totalPoints: totalPts,
        rewardEarnedCount: rewardCount,
        lastScannedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        claimedRewards, pendingRewards,
      });
      progressCount++;
    }

    // Give each user 2–3 redeemed active vouchers
    const slice = activeVouchers.slice((ui * 3) % activeVouchers.length, (ui * 3 + 3) % activeVouchers.length + 2);
    const redeemedIds = [];
    for (const { voucher, code } of slice.slice(0, 2)) {
      await Voucher.findByIdAndUpdate(voucher._id, {
        $inc: { redeemedCount: 1 },
        $push: { redemptions: { userId: user._id, code, redeemedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) } },
      });
      redeemedIds.push(voucher._id);
      redemptionCount++;
    }
    await User.findByIdAndUpdate(user._id, { $addToSet: { redeemedVouchers: { $each: redeemedIds } } });
  }
  console.log(`Created ${progressCount} progress records, ${redemptionCount} redemptions.\n`);

  // ─── Print credentials sheet ──────────────────────────────────────────────
  const W = 70;
  const hr = "-".repeat(W);
  const eq = "=".repeat(W);

  console.log("\n" + eq);
  console.log("  GIFTVAULT DEMO CREDENTIALS  —  Universal password: " + SEED_PASSWORD);
  console.log(eq);

  console.log("\nADMIN");
  console.log(hr);
  console.log(`  Email : ${ADMIN.email}`);
  console.log(`  Pass  : ${SEED_PASSWORD}`);

  console.log(`\nVENDORS  (${VENDORS.length} total, all approved)`);
  console.log(hr);
  console.log(`${"#".padEnd(3)}  ${"Company".padEnd(26)}  ${"Category".padEnd(14)}  Email`);
  console.log(hr);
  VENDORS.forEach((v, i) => {
    console.log(`${String(i+1).padEnd(3)}  ${v.companyName.padEnd(26)}  ${v.vendorCategory.padEnd(14)}  ${v.email}`);
  });

  console.log(`\nCUSTOMERS  (${USERS.length} total)`);
  console.log(hr);
  console.log(`${"#".padEnd(3)}  ${"Name".padEnd(18)}  ${"Pts".padEnd(6)}  Email`);
  console.log(hr);
  USERS.forEach((u, i) => {
    console.log(`${String(i+1).padEnd(3)}  ${u.name.padEnd(18)}  ${String(u.bonusPoints).padEnd(6)}  ${u.email}`);
  });

  console.log(`\nDATABASE SUMMARY`);
  console.log(hr);
  console.log(`  Vouchers    : ${allVouchers.length} total  |  ${activeVouchers.length} active  |  ${allVouchers.filter(v=>v.voucher.status==='expired').length} expired  |  ${allVouchers.filter(v=>v.voucher.status==='draft').length} draft`);
  console.log(`  Loyalty     : ${loyaltyRuleDocs.length} rules, ${progressCount} progress records`);
  console.log(`  Redemptions : ${redemptionCount}`);
  console.log("\n" + eq + "\n");

  await mongoose.disconnect();
  console.log("Seed complete.\n");
}

seed().catch(err => {
  console.error("Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
