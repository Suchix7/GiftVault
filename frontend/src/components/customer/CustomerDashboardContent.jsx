import { motion } from "framer-motion";
import { ShieldCheck, User, Camera, QrCode, Zap } from "lucide-react";
import CustomerVoucherCard from "@/components/customer/CustomerVoucherCard";
import DynamicStampCard from "@/components/loyalty/DynamicStampCard";

export default function CustomerDashboardContent({
  activeView,
  activeTab,
  setActiveTab,
  activeVouchers,
  redeemedVouchers,
  expiredVouchers,
  vendors,
  redemptionCodes,
  handleRedeemClick,
  handleShowQr,
  currentUser,
  formatDate,
  getRedemptionDate,
  profileForm,
  updatingProfile,
  handleUpdateProfile,
  setProfileForm,
  loyaltyPrograms = {},
  setLoyaltyPrograms = () => {},
  handleOpenScanner = () => {},
  globalTotalPoints = 0,
}) {
  const vouchersToShow =
    activeTab === "active"
      ? activeVouchers
      : activeTab === "redeemed"
      ? redeemedVouchers
      : expiredVouchers;

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-12 relative z-10">
      {activeView === "vouchers" && (
        <motion.div
          key="vouchers"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-8 md:space-y-10"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
              My Vouchers
            </h1>
            <p className="text-gray-500 font-medium text-xs md:text-sm">
              Manage your digital vault assets.
            </p>
          </div>
          <div className="flex items-center p-1 bg-gray-100 rounded-2xl w-full md:w-fit border border-gray-200 shadow-inner overflow-x-auto no-scrollbar">
            {["active", "redeemed", "expired"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-6 md:px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? "bg-white shadow-sm text-black"
                    : "text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === "active" ? (
             <>
                <div className="mb-4 mt-8">
                  <h2 className="text-xl font-black tracking-tighter text-gray-900 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-500"/>
                    Free Vault Assets
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {vouchersToShow.filter(v => !v.isPaid).map((voucher) => (
                    <CustomerVoucherCard
                      key={voucher._id}
                      voucher={voucher}
                      type={activeTab}
                      vendors={vendors}
                      redemptionCodes={redemptionCodes}
                      onRedeem={handleRedeemClick}
                      onShowQr={handleShowQr}
                      formatDate={formatDate}
                      getRedemptionDate={getRedemptionDate}
                      currentUser={currentUser}
                      userPoints={globalTotalPoints}
                    />
                  ))}
                  {vouchersToShow.filter(v => !v.isPaid).length === 0 && (
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest col-span-full">No free assets available right now.</p>
                  )}
                </div>

                <div className="mb-4 mt-12 pt-8 border-t border-gray-100">
                  <h2 className="text-xl font-black tracking-tighter text-gray-900 flex items-center gap-2">
                    <Zap size={20} className="text-yellow-500" />
                    Premium Assets (Requires Points)
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {vouchersToShow.filter(v => v.isPaid).map((voucher) => (
                    <CustomerVoucherCard
                      key={voucher._id}
                      voucher={voucher}
                      type={activeTab}
                      vendors={vendors}
                      redemptionCodes={redemptionCodes}
                      onRedeem={handleRedeemClick}
                      onShowQr={handleShowQr}
                      formatDate={formatDate}
                      getRedemptionDate={getRedemptionDate}
                      currentUser={currentUser}
                      userPoints={globalTotalPoints}
                    />
                  ))}
                  {vouchersToShow.filter(v => v.isPaid).length === 0 && (
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest col-span-full">No premium assets available right now.</p>
                  )}
                </div>
             </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mt-8">
              {vouchersToShow.map((voucher) => (
                <CustomerVoucherCard
                  key={voucher._id}
                  voucher={voucher}
                  type={activeTab}
                  vendors={vendors}
                  redemptionCodes={redemptionCodes}
                  onRedeem={handleRedeemClick}
                  onShowQr={handleShowQr}
                  formatDate={formatDate}
                  getRedemptionDate={getRedemptionDate}
                  currentUser={currentUser}
                  userPoints={globalTotalPoints}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeView === "history" && (
        <motion.div
          key="history"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8 md:space-y-10"
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
            Ledger
          </h1>
          <div className="space-y-3">
            {redeemedVouchers.map((voucher) => (
              <div
                key={voucher._id}
                className="bg-white border border-gray-100 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: voucher.color || "#000" }}
                  >
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-xs md:text-sm uppercase">
                      {voucher.name}
                    </p>
                    <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Used {formatDate(getRedemptionDate(voucher))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs md:text-sm font-black text-emerald-600">
                    SUCCESS
                  </p>
                  <p className="text-[8px] md:text-[10px] font-mono text-gray-300">
                    TXN-{voucher._id.slice(-6)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeView === "profile" && (
        <motion.div
          key="profile"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8 md:space-y-10"
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900">
            Identity
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2rem] p-6 md:p-10 shadow-sm">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                <User size={20} /> Personal Data
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full h-12 px-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all outline-none font-medium text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full h-12 px-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all outline-none font-medium text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.number}
                      onChange={(e) => setProfileForm({ ...profileForm, number: e.target.value })}
                      className="w-full h-12 px-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all outline-none font-medium text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                      Member Since
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(currentUser?.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-8 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingProfile ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-black rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 text-white opacity-20">
                <User size={32} />
              </div>
              <h3 className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-6">
                Vault Balance
              </h3>
              <p className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                {currentUser?.bonusPoints || 0}
              </p>
              <p className="text-[10px] font-bold text-white/60 uppercase">
                Earned Points
              </p>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[9px] font-bold uppercase text-white/40 mb-1">
                  Referral Code
                </p>
                <p className="font-mono text-sm font-black tracking-widest">
                  {currentUser?.referralCode || "NONE"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeView === "loyalty" && (
        <motion.div
          key="loyalty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-8 md:space-y-10"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
                Loyalty Cards
              </h1>
              <p className="text-gray-500 font-medium text-xs md:text-sm">
                Track your rewards and stamp cards across your favorite vendors.
              </p>
            </div>
            
            <button
              onClick={handleOpenScanner}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all active:scale-95 whitespace-nowrap w-fit shrink-0"
            >
              <QrCode className="w-5 h-5 text-[#f5f5f7]" />
              Scan QR for Points
            </button>
          </div>

          {Object.entries(loyaltyPrograms).filter(
            ([_, programData]) => programData.progress?.totalPoints > 0
          ).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {Object.entries(loyaltyPrograms)
                .filter(([_, programData]) => programData.progress?.totalPoints > 0)
                .map(([vendorId, programData]) => (
                <DynamicStampCard
                  key={vendorId}
                  vendorId={vendorId}
                  userId={currentUser?._id}
                  vendorName={programData.vendorName}
                  progress={programData.progress}
                  rules={programData.rules}
                  onClaimReward={async () => {
                    // We DO NOT call claimReward here anymore!
                    // The customer shows the QR to the Vendor. The Vendor scans it and calls claimReward.
                    // This function is now just a callback to "Refresh My Data" after closing the QR modal.
                    const loyaltyAPI = (await import("@/api/loyalty")).default;
                    
                    const updated = await loyaltyAPI.getUserProgress(
                      currentUser._id,
                      vendorId
                    );
                    if (updated.success) {
                      setLoyaltyPrograms((prev) => ({
                        ...prev,
                        [vendorId]: {
                          ...prev[vendorId],
                          ...updated.data,
                        },
                      }));
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6H6m0 0H0"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No Loyalty Programs Yet
                </h3>
                <p className="text-gray-600 text-sm">
                  Vendors you shop from will offer loyalty cards here. Start collecting stamps!
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
