import { Button } from "@/components/ui/button";
import {
  Gift,
  History,
  User,
  Calendar,
  Award,
  Users,
  ChevronRight,
  Ticket,
  ShieldCheck,
  Zap,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import KeyVerificationModal from "@/components/OtpVerificationModal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function CustomerDashboard() {
  const [activeView, setActiveView] = useState("vouchers");
  const [activeTab, setActiveTab] = useState("active");
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState({});
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedVoucherForRedemption, setSelectedVoucherForRedemption] =
    useState(null);
  const [redemptionCodes, setRedemptionCodes] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // --- Logic remains same as your original code ---
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
    const r = voucher?.redemptions?.find((r) => r.userId === currentUser?._id);
    return r ? new Date(r.redeemedAt) : null;
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

  const handleKeySuccess = (code) => {
    setRedemptionCodes((prev) => ({
      ...prev,
      [selectedVoucherForRedemption._id]: code,
    }));
    toast.success("Redemption Key Generated");
  };

  // --- Premium Sub-Component: Hardware Voucher Card (Responsive) ---
  const VoucherCard = ({ voucher, type }) => {
    const hasCode = redemptionCodes[voucher._id];
    const isRedeemed = type === "redeemed";
    const isExpired = type === "expired";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div
          className="w-full aspect-[1.6/1] rounded-[2rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden group"
          style={{ backgroundColor: voucher.color || "#1e293b" }}
        >
          <div className="absolute inset-2 md:inset-3 bg-black/10 backdrop-blur-md rounded-[1.8rem] md:rounded-[2rem] border border-white/10 p-5 md:p-8 flex flex-col justify-between z-10 overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 md:h-12 md:w-12 bg-white/90 rounded-xl p-2 flex items-center justify-center shadow-lg">
                {voucher.logo ? (
                  <img
                    src={voucher.logo}
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Gift className="text-black w-5 h-5" />
                )}
              </div>
              <div className="text-right">
                <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-white/50 leading-none mb-1">
                  Secure Asset
                </p>
                <p className="text-[9px] md:text-[10px] font-bold text-white uppercase truncate max-w-[80px] md:max-w-[100px]">
                  {vendors[voucher.vendorId] || "Verified Partner"}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg md:text-2xl font-black tracking-tighter text-white mb-0.5 md:mb-1 uppercase truncate">
                {voucher.name}
              </h3>
              <p className="text-white/60 text-[8px] md:text-[9px] font-medium max-w-[90%] line-clamp-1 italic uppercase tracking-wider">
                {voucher.description ||
                  "Digital voucher asset reserved for holder."}
              </p>
            </div>
            <div className="flex justify-between items-end border-t border-white/10 pt-3 md:pt-4">
              <div>
                <div className="bg-white/20 px-3 py-1 rounded-full inline-block mb-1">
                  <span className="text-lg md:text-xl font-black text-white tracking-tighter">
                    {voucher.type === "percentage"
                      ? `${voucher.value}% Off`
                      : `Rs. ${voucher.value}`}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-white/40 mb-0.5">
                  {isRedeemed ? "Burned On" : "Valid Thru"}
                </p>
                <p className="text-[9px] md:text-[10px] font-bold text-white uppercase">
                  {isRedeemed
                    ? formatDate(getRedemptionDate(voucher))
                    : formatDate(voucher.expiryDate)}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="px-1">
          {hasCode ? (
            <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
              <p className="text-[8px] font-black text-gray-500 uppercase mb-1">
                Authorization Key
              </p>
              <p className="text-white font-mono text-xl font-black tracking-[0.4em]">
                {redemptionCodes[voucher._id]}
              </p>
            </div>
          ) : isRedeemed ? (
            <div className="w-full py-3 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase text-center border border-emerald-100 flex items-center justify-center gap-2">
              <ShieldCheck size={14} /> Redeemed
            </div>
          ) : isExpired ? (
            <div className="w-full py-3 rounded-2xl bg-gray-50 text-gray-400 text-[10px] font-black uppercase text-center border border-gray-100">
              Expired
            </div>
          ) : (
            <Button
              onClick={() => handleRedeemClick(voucher)}
              className="w-full h-12 md:h-14 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              Unlock Redemption <ChevronRight size={14} />
            </Button>
          )}
        </div>
      </motion.div>
    );
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
      {/* --- Desktop Sidebar (Hidden on Mobile) --- */}
      <aside className="hidden lg:flex w-64 border-r border-gray-100 bg-white flex-col z-50">
        <div className="p-8 mb-4 flex items-center gap-3">
          <div className="bg-black p-2 rounded-xl shadow-lg">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">
            GiftVault
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`relative flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all rounded-2xl group ${activeView === item.id ? "text-black" : "text-gray-400 hover:text-gray-900"}`}
            >
              {activeView === item.id && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-gray-50 rounded-2xl -z-10 border border-gray-100"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {item.icon} {item.label}
              {activeView === item.id && (
                <div className="ml-auto w-1 h-1 bg-black rounded-full" />
              )}
            </button>
          ))}
        </nav>
        <div className="p-6 mt-auto border-t border-gray-50">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-4 text-[10px] font-bold">
            <p className="text-gray-400 uppercase mb-1">Verified User</p>
            <p className="text-gray-900 truncate">{currentUser?.name}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* --- Mobile Top Header --- */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 flex items-center justify-between px-6 font-black uppercase tracking-tighter">
        <div className="flex items-center gap-2">
          <Gift size={18} />
          <span>GiftVault</span>
        </div>
        <div className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">
          {currentUser?.bonusPoints} PTS
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth pt-20 lg:pt-0 pb-28 lg:pb-0">
        <div className="absolute top-0 right-0 w-full lg:w-[600px] h-[400px] lg:h-[600px] bg-gray-100/30 blur-[80px] lg:blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto p-5 md:p-12 relative z-10">
          <AnimatePresence mode="wait">
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
                      className={`flex-1 md:flex-none px-6 md:px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white shadow-sm text-black" : "text-gray-400"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {(activeTab === "active"
                    ? activeVouchers
                    : activeTab === "redeemed"
                      ? redeemedVouchers
                      : expiredVouchers
                  ).map((v) => (
                    <VoucherCard key={v._id} voucher={v} type={activeTab} />
                  ))}
                </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                          Full Name
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {currentUser?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                          Email Hash
                        </p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {currentUser?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                          Authorized Phone
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {currentUser?.number || "Not synced"}
                        </p>
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
                  </div>
                  <div className="bg-black rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
                    <Zap
                      className="absolute top-4 right-4 text-white opacity-20"
                      size={32}
                    />
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
          </AnimatePresence>
        </div>
      </main>

      {/* --- Mobile Bottom Nav Bar (Hidden on Desktop) --- */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="relative flex flex-col items-center justify-center w-12 h-12 transition-all"
            >
              <span
                className={isActive ? "text-black scale-110" : "text-gray-400"}
              >
                {React.cloneElement(item.icon, { size: 20 })}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-dot"
                  className="absolute -bottom-1 w-1 h-1 bg-black rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>

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
    </div>
  );
}
