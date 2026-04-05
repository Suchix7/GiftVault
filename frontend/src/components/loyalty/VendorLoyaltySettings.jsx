import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Settings,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react";
import loyaltyAPI from "@/api/loyalty";
import { toast } from "sonner";

/**
 * VendorLoyaltySettings Component
 * Allows vendors to configure their loyalty program settings
 * Features:
 * - Update threshold (visits/stamps needed for reward)
 * - Update points per scan
 * - Update reward text
 */
const VendorLoyaltySettings = ({ vendorId }) => {
  const [rules, setRules] = useState({
    threshold: 5,
    pointsPerScan: 1,
    rewardText: "Free Item",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch current loyalty rules
  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true);
        const response = await loyaltyAPI.getLoyaltyRules(vendorId);
        if (response.success) {
          setRules({
            threshold: response.data.threshold || 5,
            pointsPerScan: response.data.pointsPerScan || 1,
            rewardText: response.data.rewardText || "Free Item",
            isActive: response.data.isActive !== undefined ? response.data.isActive : true,
          });
        }
      } catch (error) {
        console.error("Error fetching loyalty rules:", error);
        toast.error("Error loading loyalty settings");
        setMessage("Error loading loyalty settings");
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchRules();
    }
  }, [vendorId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRules((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save loyalty rules
  const handleSaveRules = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await loyaltyAPI.updateLoyaltyRules(vendorId, {
        threshold: parseInt(rules.threshold),
        pointsPerScan: parseInt(rules.pointsPerScan),
        rewardText: rules.rewardText,
        isActive: rules.isActive,
      });

      if (response.success) {
        toast.success("Loyalty settings updated successfully!");
        setMessage("✓ Loyalty settings updated successfully!");
        setTimeout(() => setMessage(""), 4000);
      }
    } catch (error) {
      console.error("Error saving rules:", error);
      const errorMsg = error.response?.data?.message || "Error saving settings";
      toast.error(errorMsg);
      setMessage("✗ " + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading loyalty settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Settings className="w-8 h-8 text-black" />
          Loyalty Program Settings
        </h1>
        <p className="text-gray-500 font-medium">
          Configure your stamp card rewards settings
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-start gap-3 border ${
            message.startsWith("✓")
              ? "bg-gray-50 border-gray-200 text-black"
              : "bg-red-50 border-red-100 text-red-600"
          }`}
        >
          {message.startsWith("✓") ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{message}</p>
        </motion.div>
      )}

      {/* Settings Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-10 space-y-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Reward Configuration
        </h2>

        <form onSubmit={handleSaveRules} className="space-y-8">
          {/* Threshold Setting */}
          <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">
              Stamps Required for Reward
            </label>
            <p className="text-xs text-gray-500 mb-4 font-medium">
              How many stamps/visits until a customer can claim a reward? (e.g., 6 for Buy 6 Get 1)
            </p>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="threshold"
                min="1"
                max="100"
                value={rules.threshold}
                onChange={handleInputChange}
                className="flex-1 h-14 px-5 bg-white border border-gray-200 rounded-2xl text-black font-bold focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all"
              />
              <div className="text-4xl font-black tracking-tighter text-black">
                {rules.threshold}
              </div>
            </div>
          </div>

          {/* Points Per Scan */}
          <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">
              Stamps Per QR Token Scan
            </label>
            <p className="text-xs text-gray-500 mb-4 font-medium">
              How many stamps to award on a customer's loyalty card for each successful QR token scan?
            </p>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="pointsPerScan"
                min="1"
                max="10"
                value={rules.pointsPerScan}
                onChange={handleInputChange}
                className="flex-1 h-14 px-5 bg-white border border-gray-200 rounded-2xl text-black font-bold focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all"
              />
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Zap className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>

          {/* Reward Text */}
          <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">
              Reward Description
            </label>
            <p className="text-xs text-gray-500 mb-4 font-medium">
              What reward do customers get? (e.g., "Free Coffee", "10% Off")
            </p>
            <input
              type="text"
              name="rewardText"
              value={rules.rewardText}
              onChange={handleInputChange}
              placeholder="Free Coffee"
              className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-black font-bold focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
            <div>
              <label htmlFor="isActive" className="text-sm font-bold text-gray-900 cursor-pointer mb-1 block">
                Loyalty Program Active
              </label>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">System Status</p>
            </div>
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={rules.isActive}
              onChange={handleInputChange}
              className="w-6 h-6 text-black bg-white rounded border-gray-300 focus:ring-black focus:ring-2 cursor-pointer accent-black"
            />
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className={`
              w-full h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em]
              transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-black/5
              ${
                saving
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-900"
              }
            `}
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save Settings"}
          </motion.button>
        </form>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 border border-gray-100 rounded-3xl p-8"
      >
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-4">How It Works</h3>
        <ul className="text-sm text-gray-500 space-y-3 font-medium">
          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> Enable your loyalty program and customize target stamps</li>
          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> Customers scan your Store dynamic QR codes</li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></div> 
            <span>Each scan awards <strong className="text-black">{rules.pointsPerScan} stamp(s)</strong> towards their loyalty card, as well as the dynamic points.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></div> 
            <span>After <strong className="text-black">{rules.threshold} stamps</strong>, they earn <strong className="text-black">{rules.rewardText}</strong></span>
          </li>
          <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-black"></div> Stamps reset automatically after they claim their reward</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default VendorLoyaltySettings;
