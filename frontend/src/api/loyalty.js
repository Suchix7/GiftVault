import api from "./axios";

const API_BASE = "/loyalty";

/**
 * Loyalty API Helper
 * Handles all API calls related to the Dynamic Loyalty & Stamp Card Feature
 */

export const loyaltyAPI = {
  /**
   * Get loyalty rules for a vendor
   * @param {string} vendorId - The vendor's ID
   * @returns {Promise} Loyalty rules (threshold, pointsPerScan, rewardText, etc)
   */
  getLoyaltyRules: async (vendorId) => {
    const response = await api.get(`${API_BASE}/rules/${vendorId}`);
    return response.data;
  },

  /**
   * Update loyalty rules for a vendor
   * @param {string} vendorId - The vendor's ID
   * @param {object} rules - Updated rules (threshold, pointsPerScan, rewardText, isActive)
   * @returns {Promise} Updated rules
   */
  updateLoyaltyRules: async (vendorId, rules) => {
    const response = await api.patch(`${API_BASE}/rules/${vendorId}`, rules);
    return response.data;
  },

  /**
   * Generate a one-time-use QR token
   * @param {string} vendorId - The vendor's ID
   * @param {number} points - Points to award when this QR is scanned
   * @returns {Promise} QR token, verification URL, and expiry time
   */
  generateQRToken: async (vendorId, points = 1) => {
    const response = await api.post(`${API_BASE}/generate-qr`, {
      vendorId,
      points,
    });
    return response.data;
  },

  /**
   * Verify and redeem a QR token (customer scans QR)
   * @param {string} token - The QR token from the QR code
   * @param {string} userId - The customer's user ID
   * @returns {Promise} Points earned, current stamps, threshold, reward status
   */
  verifyQRToken: async (token, userId) => {
    const response = await api.post(`${API_BASE}/verify-qr`, {
      token,
      userId,
    });
    return response.data;
  },

  /**
   * Get user's progress for a specific vendor
   * @param {string} userId - The customer's user ID
   * @param {string} vendorId - The vendor's ID
   * @returns {Promise} User progress and loyalty rules
   */
  getUserProgress: async (userId, vendorId) => {
    const response = await api.get(
      `${API_BASE}/progress/${userId}/${vendorId}`
    );
    return response.data;
  },

  /**
   * Claim a reward manually
   * @param {string} userId - The customer's user ID
   * @param {string} vendorId - The vendor's ID
   * @returns {Promise} Reward claim confirmation and reset status
   */
  claimReward: async (userId, vendorId) => {
    const response = await api.post(`${API_BASE}/claim-reward`, {
      userId,
      vendorId,
    });
    return response.data;
  },

  /**
   * Get loyalty statistics for a vendor
   * @param {string} vendorId - The vendor's ID
   * @returns {Promise} Total QR scans, active QRs, customer count, top customers
   */
  getVendorStats: async (vendorId) => {
    const response = await api.get(`${API_BASE}/vendor-stats/${vendorId}`);
    return response.data;
  },
};

export default loyaltyAPI;
