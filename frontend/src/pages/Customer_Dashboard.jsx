import React, { useState, useEffect } from "react";
import { History, User, Ticket } from "lucide-react";
import api from "@/api/axios";
import KeyVerificationModal from "@/components/OtpVerificationModal";
import QrCodeModal from "@/components/QrCodeModal";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import CustomerDashboardSidebar from "@/components/customer/CustomerDashboardSidebar";
import CustomerDashboardContent from "@/components/customer/CustomerDashboardContent";

export default function CustomerDashboard() {
  const [activeView, setActiveView] = useState("vouchers");
  const [activeTab, setActiveTab] = useState("active");
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState({});
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedVoucherForRedemption, setSelectedVoucherForRedemption] = useState(null);
  const [redemptionCodes, setRedemptionCodes] = useState({});
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    number: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, voucherRes, vendorRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/vouchers/public/active"),
          api.get("/users/vendors/all"),
        ]);

        setCurrentUser(userRes.data.user);
        setVouchers(voucherRes.data.vouchers || []);

        // Populate profile form
        setProfileForm({
          name: userRes.data.user.name || "",
          email: userRes.data.user.email || "",
          number: userRes.data.user.number || "",
        });

        const vendorMap = {};
        (vendorRes.data.users || []).forEach((v) => {
          vendorMap[v._id] = v.name;
        });
        setVendors(vendorMap);
      } catch (error) {
        toast.error("Protocol Sync Failed");
      } finally {
        setIsLoading(false);
        setIsUserLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) =>
    dateString ? format(new Date(dateString), "MMM dd, yyyy") : "N/A";

  const isVoucherExpired = (voucher) => {
    if (voucher.status === "expired") return true;
    if (!voucher.expiryDate) return false;
    return new Date(voucher.expiryDate) < new Date();
  };

  const isVoucherRedeemedByUser = (voucher) =>
    currentUser &&
    voucher?.redemptions?.some((r) => r.userId === currentUser._id);

  const getRedemptionDate = (voucher) => {
    const redemption = voucher?.redemptions?.find(
      (r) => r.userId === currentUser?._id,
    );
    return redemption ? new Date(redemption.redeemedAt) : null;
  };

  const activeVouchers = vouchers.filter(
    (v) =>
      v.status === "active" &&
      !isVoucherExpired(v) &&
      !isVoucherRedeemedByUser(v),
  );

  const redeemedVouchers = vouchers.filter((v) => isVoucherRedeemedByUser(v));

  const expiredVouchers = vouchers.filter(
    (v) => isVoucherExpired(v) && !isVoucherRedeemedByUser(v),
  );

  const handleRedeemClick = (voucher) => {
    setSelectedVoucherForRedemption(voucher);
    setIsOtpModalOpen(true);
  };

  const handleKeySuccess = (data) => {
    if (!selectedVoucherForRedemption) return;

    setRedemptionCodes((prev) => ({
      ...prev,
      [selectedVoucherForRedemption._id]: {
        code: data.code,
        qrToken: data.qrToken,
      },
    }));

    setQrModalData({
      voucher: {
        ...selectedVoucherForRedemption,
        decryptedCode: data.code,
      },
      qrToken: data.qrToken,
    });
    setIsQrModalOpen(true);
    toast.success("Redemption Key Generated");
  };

  const handleShowQr = (voucher) => {
    const redemptionData = redemptionCodes[voucher._id];
    if (!redemptionData) return;

    setQrModalData({
      voucher: {
        ...voucher,
        decryptedCode: redemptionData.code,
      },
      qrToken: redemptionData.qrToken,
    });
    setIsQrModalOpen(true);
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const response = await api.patch(`/users/${currentUser._id}`, profileForm);
      setCurrentUser(response.data.user);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FBFBFB]">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
          Syncing...
        </p>
      </div>
    );
  }

  const navItems = [
    { id: "vouchers", label: "My Assets", icon: <Ticket size={18} /> },
    { id: "history", label: "Ledger", icon: <History size={18} /> },
    { id: "profile", label: "Identity", icon: <User size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#FBFBFB] text-[#1D1D1F] font-sans overflow-hidden relative">
      <CustomerDashboardSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        navItems={navItems}
      />

      <main className="flex-1 overflow-y-auto relative scroll-smooth pt-20 lg:pt-0 pb-28 lg:pb-0">
        <div className="absolute top-0 right-0 w-full lg:w-[600px] h-[400px] lg:h-[600px] bg-gray-100/30 blur-[80px] lg:blur-[120px] rounded-full pointer-events-none -z-10" />

        <AnimatePresence mode="wait">
          <CustomerDashboardContent
            activeView={activeView}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeVouchers={activeVouchers}
            redeemedVouchers={redeemedVouchers}
            expiredVouchers={expiredVouchers}
            vendors={vendors}
            redemptionCodes={redemptionCodes}
            handleRedeemClick={handleRedeemClick}
            handleShowQr={handleShowQr}
            currentUser={currentUser}
            formatDate={formatDate}
            getRedemptionDate={getRedemptionDate}
            profileForm={profileForm}
            updatingProfile={updatingProfile}
            handleUpdateProfile={handleUpdateProfile}
            setProfileForm={setProfileForm}
          />
        </AnimatePresence>
      </main>

      {isOtpModalOpen && (
        <KeyVerificationModal
          onClose={() => {
            setIsOtpModalOpen(false);
            setSelectedVoucherForRedemption(null);
          }}
          onSuccess={handleKeySuccess}
          voucherId={selectedVoucherForRedemption?._id}
        />
      )}

      {isQrModalOpen && qrModalData && (
        <QrCodeModal
          isOpen={isQrModalOpen}
          onClose={() => {
            setIsQrModalOpen(false);
            setQrModalData(null);
          }}
          qrToken={qrModalData.qrToken}
          voucher={qrModalData.voucher}
          customerEmail={currentUser?.email}
        />
      )}
    </div>
  );
}
