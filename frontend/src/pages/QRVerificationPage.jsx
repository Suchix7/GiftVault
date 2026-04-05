import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Gift, Loader } from "lucide-react";
import api from "@/api/axios";
import loyaltyAPI from "../api/loyalty";
import { toast } from "sonner";

/**
 * QR Verification Page
 * Customers land here after scanning a QR code or clicking a verification link
 * URL: /verify?token=UUID
 */
const QRVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyQR = async () => {
      try {
        setLoading(true);

        // Fetch current user
        const userRes = await api.get("/users/profile");
        const userId = userRes.data.user._id;
        setCurrentUser(userRes.data.user);

        if (!userId) {
          setError("User not found. Please log in.");
          setLoading(false);
          return;
        }

        if (!token) {
          setError("No QR token provided");
          setLoading(false);
          return;
        }

        // Verify the QR token
        const response = await loyaltyAPI.verifyQRToken(token, userId);

        if (response.success) {
          setResult(response.data);
          toast.success("✓ Reward claim successful!");
        } else {
          setError(response.message || "Failed to verify QR code");
          toast.error(response.message || "Failed to verify QR code");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          "Failed to verify QR code. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    verifyQR();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-indigo-600"
        >
          <Loader className="w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Invalid QR Code
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-700 transition-all"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Points Earned!
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Your QR code has been successfully verified.
        </p>

        {/* Points Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-8"
        >
          {/* Points Earned */}
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Points Earned</p>
            <p className="text-3xl font-bold text-blue-600">
              +{result?.pointsEarned || 0}
            </p>
          </div>

          {/* Stamps Progress */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">Stamps Progress</p>
              <span className="text-lg font-bold text-indigo-600">
                {result?.currentStamps || 0}/{result?.threshold || 0}
              </span>
            </div>
            <div className="w-full bg-indigo-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    ((result?.currentStamps || 0) / (result?.threshold || 1)) *
                    100
                  }%`,
                }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full"
              />
            </div>
          </div>

          {/* Total Points */}
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Total Points</p>
            <p className="text-2xl font-bold text-purple-600">
              {result?.totalPoints || 0}
            </p>
          </div>
        </motion.div>

        {/* Reward Status */}
        {result?.rewardEarned && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-green-100 to-emerald-100 border-l-4 border-green-500 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">
                  {result?.rewardText || "Reward"} Unlocked!
                </h3>
                <p className="text-sm text-green-800 mt-1">
                  You've earned a reward. Visit your stamp card to claim it!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/customer_dashboard")}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all"
          >
            View My Stamp Card
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all"
          >
            Continue Shopping
          </button>
        </div>

        {/* Extra Info */}
        <p className="text-xs text-center text-gray-500 mt-6">
          Reward details available in your stamp card
        </p>
      </motion.div>
    </div>
  );
};

export default QRVerificationPage;
