import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import LoyaltyRule from "../models/LoyaltyRuleModel.js";
import DynamicQR from "../models/DynamicQRModel.js";
import UserProgress from "../models/UserProgressModel.js";
import { User } from "../models/UserModel.js";

/**
 * GET /loyalty/rules/:vendorId
 * Fetch loyalty rules for a specific vendor
 */
export const getLoyaltyRules = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  let rules = await LoyaltyRule.findOne({ vendorId });

  // If no rules exist, create default rules
  if (!rules) {
    rules = await LoyaltyRule.create({
      vendorId,
      threshold: 5,
      pointsPerScan: 1,
      rewardText: "Free Item",
      isActive: true,
    });
  }

  res.status(200).json({
    success: true,
    data: rules,
  });
});

/**
 * PATCH /loyalty/rules/:vendorId
 * Update loyalty rules for a vendor
 * Private: Vendor can only update their own rules
 */
export const updateLoyaltyRules = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { threshold, pointsPerScan, rewardText, isActive } = req.body;

  // Verify user is the vendor (add auth check as needed)
  if (req.user.id !== vendorId && req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Not authorized to update these rules",
    });
    return;
  }

  let rules = await LoyaltyRule.findOne({ vendorId });

  if (!rules) {
    rules = await LoyaltyRule.create({
      vendorId,
      threshold: threshold || 5,
      pointsPerScan: pointsPerScan || 1,
      rewardText: rewardText || "Free Item",
      isActive: isActive !== undefined ? isActive : true,
    });
  } else {
    if (threshold !== undefined) rules.threshold = threshold;
    if (pointsPerScan !== undefined) rules.pointsPerScan = pointsPerScan;
    if (rewardText !== undefined) rules.rewardText = rewardText;
    if (isActive !== undefined) rules.isActive = isActive;
    await rules.save();
  }

  res.status(200).json({
    success: true,
    message: "Loyalty rules updated successfully",
    data: rules,
  });
});

/**
 * POST /loyalty/generate-qr
 * Generate a one-time-use QR token
 * Private: Vendor generates QR to display
 * QR expires in 2 minutes (120000ms)
 */
export const generateQRToken = asyncHandler(async (req, res) => {
  const { vendorId, points = 1 } = req.body;

  if (!vendorId) {
    res.status(400).json({
      success: false,
      message: "vendorId is required",
    });
    return;
  }

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // Expires in 2 minutes

  const qrRecord = await DynamicQR.create({
    token,
    vendorId,
    points,
    isUsed: false,
    expiresAt,
  });

  const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify?token=${token}`;

  res.status(201).json({
    success: true,
    message: "QR token generated successfully",
    data: {
      token,
      verifyUrl,
      expiresAt,
      qrId: qrRecord._id,
    },
  });
});

/**
 * POST /loyalty/verify-qr
 * Verify and redeem a QR token
 * Logic:
 * 1. Check if token exists and isUsed === false
 * 2. Check if token has expired
 * 3. Atomically set isUsed: true (prevents race conditions)
 * 4. Update UserProgress: currentStamps += points
 * 5. Check if currentStamps >= threshold
 * 6. If threshold reached, trigger reward
 * Public: Customer can verify their own progress
 */
export const verifyQRToken = asyncHandler(async (req, res) => {
  const { token, userId } = req.body;

  if (!token || !userId) {
    res.status(400).json({
      success: false,
      message: "token and userId are required",
    });
    return;
  }

  // Atomically find and update the QR record
  // This prevents race conditions where two users scan the same QR simultaneously
  const qrRecord = await DynamicQR.findOneAndUpdate(
    {
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() }, // Only valid if not expired
    },
    {
      isUsed: true,
      usedBy: userId,
      usedAt: new Date(),
    },
    { new: true }
  );

  // If no valid QR found, it either doesn't exist, is already used, or is expired
  if (!qrRecord) {
    res.status(400).json({
      success: false,
      message:
        "Invalid, already used, or expired token. Please try a new QR code.",
    });
    return;
  }

  const { vendorId, points } = qrRecord;

  // Get loyalty rules to check if threshold is reached
  const loyaltyRules = await LoyaltyRule.findOne({ vendorId });

  if (!loyaltyRules) {
    res.status(500).json({
      success: false,
      message: "Loyalty rules not found for this vendor",
    });
    return;
  }

  const stampsToAdd = loyaltyRules.pointsPerScan || 1;

  // Update UserProgress with the earned points/stamps
  let userProgress = await UserProgress.findOne({ userId, vendorId });

  // ALSO Update Global User Points
  const user = await User.findById(userId);
  if (user) {
    user.bonusPoints = (user.bonusPoints || 0) + points;
    await user.save();
  }

  if (!userProgress) {
    userProgress = await UserProgress.create({
      userId,
      vendorId,
      currentStamps: stampsToAdd,
      totalPoints: points,
      lastScannedAt: new Date(),
    });
  } else {
    userProgress.currentStamps += stampsToAdd;
    userProgress.totalPoints += points;
    userProgress.lastScannedAt = new Date();
    await userProgress.save();
  }

  const rewardEarned =
    userProgress.currentStamps >= loyaltyRules.threshold;

  const response = {
    success: true,
    message: "QR redeemed successfully",
    data: {
      pointsEarned: points,
      currentStamps: userProgress.currentStamps,
      totalPoints: userProgress.totalPoints,
      threshold: loyaltyRules.threshold,
      rewardEarned,
      rewardText: loyaltyRules.rewardText,
      vendorId, // Add vendorId to response
    },
  };

  // If reward is earned, create a pending reward instead of auto-claiming
  if (rewardEarned) {
    const qrToken = uuidv4();
    userProgress.pendingRewards.push({
      earnedAt: new Date(),
      stampsAtEarn: userProgress.currentStamps,
      description: loyaltyRules.rewardText,
      qrToken,
      isRedeemed: false,
    });
    userProgress.rewardEarnedCount += 1;
    userProgress.currentStamps = 0; // Reset stamps for next round
    await userProgress.save();

    response.data.rewardPending = true;
    response.data.pendingRewardToken = qrToken;
  }

  res.status(200).json(response);
});

/**
 * GET /loyalty/progress/:userId/:vendorId
 * Get customer progress for a specific vendor's loyalty program
 */
export const getUserProgress = asyncHandler(async (req, res) => {
  const { userId, vendorId } = req.params;

  let userProgress = await UserProgress.findOne({ userId, vendorId });

  const loyaltyRules = await LoyaltyRule.findOne({ vendorId });

  if (!userProgress) {
    userProgress = {
      currentStamps: 0,
      totalPoints: 0,
      rewardEarnedCount: 0,
      lastScannedAt: null,
    };
  }

  res.status(200).json({
    success: true,
    data: {
      progress: userProgress,
      rules: loyaltyRules || {
        threshold: 5,
        pointsPerScan: 1,
        rewardText: "Free Item",
      },
    },
  });
});

/**
 * POST /loyalty/claim-reward
 * Redeem a pending loyalty reward
 * Called when vendor scans customer's reward QR code
 */
export const claimReward = asyncHandler(async (req, res) => {
  const { userId, vendorId, qrToken } = req.body;

  // If qrToken is provided, find and redeem the specific pending reward
  if (qrToken) {
    const userProgress = await UserProgress.findOne({
      userId,
      vendorId,
      "pendingRewards.qrToken": qrToken,
      "pendingRewards.isRedeemed": false,
    });

    if (!userProgress) {
      res.status(404).json({
        success: false,
        message: "Pending reward not found or already redeemed",
      });
      return;
    }

    // Find and update the specific pending reward
    const pendingReward = userProgress.pendingRewards.find(
      (reward) => reward.qrToken === qrToken && !reward.isRedeemed
    );

    if (!pendingReward) {
      res.status(404).json({
        success: false,
        message: "Pending reward not found",
      });
      return;
    }

    // Mark as redeemed
    pendingReward.isRedeemed = true;
    pendingReward.redeemedAt = new Date();
    pendingReward.redeemedBy = req.user._id; // Vendor who redeemed

    // Move to claimed rewards
    userProgress.claimedRewards.push({
      claimedAt: new Date(),
      stampsAtClaim: pendingReward.stampsAtEarn,
      description: pendingReward.description,
    });

    await userProgress.save();

    res.status(200).json({
      success: true,
      message: "Reward redeemed successfully",
      data: {
        rewardText: pendingReward.description,
        redeemedAt: pendingReward.redeemedAt,
      },
    });
    return;
  }

  // Legacy behavior: claim reward based on current stamps (if no qrToken provided)
  const userProgress = await UserProgress.findOne({ userId, vendorId });

  if (!userProgress) {
    res.status(404).json({
      success: false,
      message: "User progress not found",
    });
    return;
  }

  const loyaltyRules = await LoyaltyRule.findOne({ vendorId });

  if (!loyaltyRules) {
    res.status(500).json({
      success: false,
      message: "Loyalty rules not found",
    });
    return;
  }

  if (userProgress.currentStamps < loyaltyRules.threshold) {
    res.status(400).json({
      success: false,
      message: "Not enough stamps to claim reward",
      data: {
        currentStamps: userProgress.currentStamps,
        threshold: loyaltyRules.threshold,
      },
    });
    return;
  }

  // Record the reward claim
  userProgress.claimedRewards.push({
    claimedAt: new Date(),
    stampsAtClaim: userProgress.currentStamps,
    description: loyaltyRules.rewardText,
  });
  userProgress.rewardEarnedCount += 1;
  userProgress.currentStamps = 0; // Reset stamps

  await userProgress.save();

  res.status(200).json({
    success: true,
    message: "Reward claimed successfully",
    data: {
      rewardText: loyaltyRules.rewardText,
      rewardClaimedCount: userProgress.rewardEarnedCount,
      stampsReset: true,
    },
  });
});

/**
 * GET /loyalty/vendor-stats/:vendorId
 * Get loyalty statistics for a vendor (admin/vendor only)
 */
export const getVendorLoyaltyStats = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const totalQRScanned = await DynamicQR.countDocuments({
    vendorId,
    isUsed: true,
  });

  const totalActiveQR = await DynamicQR.countDocuments({
    vendorId,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  const totalCustomers = await UserProgress.countDocuments({ vendorId });

  const topCustomers = await UserProgress.find({ vendorId })
    .sort({ totalPoints: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      totalQRScanned,
      totalActiveQR,
      totalCustomers,
      topCustomers,
    },
  });
});
