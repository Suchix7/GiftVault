import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Search,
  LayoutGrid,
  List,
  Eye,
  Edit,
  Ticket,
  Trash2,
  X,
  ShieldCheck,
  Calendar,
  BarChart3,
  Zap,
  Users,
  Percent,
  Plus,
  QrCode,
} from "lucide-react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import VendorLoyaltySettings from "@/components/loyalty/VendorLoyaltySettings";
import VendorQRGenerator from "@/components/loyalty/VendorQRGenerator";

const LocalStatusBadge = ({ status }) => {
  const styles = {
    active: "bg-emerald-50 text-emerald-600 border-emerald-100",
    draft: "bg-amber-50 text-amber-600 border-amber-100",
    expired: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || "bg-gray-50 text-gray-400"}`}
    >
      {status}
    </span>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="border rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

export default function VendorDashboardContent({
  currentPage,
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  vouchers,
  isLoading,
  error,
  filteredVouchers,
  selectedVoucher,
  isViewModalOpen,
  isEditModalOpen,
  isDeleteModalOpen,
  newVoucher,
  previewLogo,
  redeemForm,
  isRedeeming,
  userProfile,
  profileLoading,
  profileForm,
  updatingProfile,
  handleViewVoucher,
  handleEditVoucher,
  handleDeleteVoucher,
  handleUpdateVoucher,
  handleCreateVoucher,
  handleLogoUpload,
  handleEditLogoUpload,
  handleRedeem,
  handleUpdateProfile,
  setNewVoucher,
  setCurrentPage,
  setSelectedVoucher,
  setIsViewModalOpen,
  setIsEditModalOpen,
  setIsDeleteModalOpen,
  setRedeemForm,
  setProfileForm,
  onOpenQrScanner,
}) {
  const renderDashboardContent = () => {
    const activeCount = vouchers?.filter((v) => v?.status === "active").length || 0;
    const draftCount = vouchers?.filter((v) => v?.status === "draft").length || 0;
    const expiredCount = vouchers?.filter((v) => v?.status === "expired").length || 0;
    const totalVal = vouchers?.reduce((acc, v) => acc + (v?.value || 0), 0) || 0;
    const totalRed = vouchers?.reduce((acc, v) => acc + (v?.redeemedCount || 0), 0) || 0;

    if (isLoading) {
      return (
        <div className="space-y-10 animate-pulse">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2">
              <div className="h-10 w-48 bg-gray-200 rounded-lg" />
              <div className="h-4 w-64 bg-gray-100 rounded-md" />
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5">
                <div className="p-8 bg-gray-100 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                  <div className="h-8 w-12 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100"></div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100"></div>
          </div>
        </div>
      );
    }

    return (
      <motion.div className="space-y-10 pb-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-gray-900">Vendor Center</h1>
            <p className="text-gray-500 font-medium">Real-time overview of your digital assets.</p>
          </div>
          <button
            className="bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-gray-800 transition-colors"
            onClick={() => {
              setCurrentPage("createVoucher");
              setActiveTab("createVoucher");
            }}
          >
            <Plus className="h-4 w-4" /> Create Voucher
          </button>
        </div>

        {error ? (
          <motion.div className="text-center py-20 bg-red-50 rounded-[2rem] border border-red-100 text-red-500" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <p className="font-bold tracking-tight">{error}</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Active",
                  count: activeCount,
                  icon: Gift,
                  bg: "bg-emerald-50",
                  text: "text-emerald-600",
                },
                {
                  label: "Drafts",
                  count: draftCount,
                  icon: Edit,
                  bg: "bg-amber-50",
                  text: "text-amber-600",
                },
                {
                  label: "Expired",
                  count: expiredCount,
                  icon: Calendar,
                  bg: "bg-rose-50",
                  text: "text-rose-600",
                },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 transition-all">
                  <div className={`${stat.bg} p-4 rounded-2xl`}>
                    <stat.icon className={`${stat.text} h-6 w-6`} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</h3>
                    <p className="text-3xl font-black tracking-tighter text-gray-900">{stat.count}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold tracking-tight mb-6">Recent Activity</h2>
                <div className="space-y-3">
                  {vouchers?.slice(0, 5).map((voucher) => (
                    <div key={voucher._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                          <Gift className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{voucher.name}</p>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                            {voucher.createdAt ? format(new Date(voucher.createdAt), "MMM dd, yyyy") : "Recently"}
                          </p>
                        </div>
                      </div>
                      <div className="text-[10px] font-bold uppercase px-2 py-1 bg-gray-100 rounded-md tracking-tighter">{voucher.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight mb-6">Asset Valuation</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-5 bg-gray-50/5 rounded-2xl border border-gray-100">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Value</span>
                      <span className="text-lg font-black tracking-tighter text-gray-900">Rs. {totalVal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-5 bg-gray-50/5 rounded-2xl border border-gray-100">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Redeemed</span>
                      <span className="text-lg font-black tracking-tighter text-gray-900">{totalRed}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-black rounded-3xl text-white flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">System Status</p>
                    <p className="text-sm font-bold">Encrypted & Operational</p>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  };

  const renderCreateVoucherContent = () => (
    <motion.div className="space-y-10 pb-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}>
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold tracking-tighter text-gray-900">Voucher Forge</h1>
        <p className="text-gray-500 font-medium text-sm">Engineer and deploy new digital assets to your vault.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
          <form onSubmit={handleCreateVoucher} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Asset Name</label>
                <input
                  id="name"
                  value={newVoucher.name}
                  onChange={(e) => setNewVoucher({ ...newVoucher, name: e.target.value })}
                  placeholder="e.g. Holiday Special $50"
                  className="w-full h-12 px-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all outline-none font-medium text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Valuation Type</label>
                <select
                  id="type"
                  value={newVoucher.type}
                  onChange={(e) => setNewVoucher({ ...newVoucher, type: e.target.value })}
                  className="w-full h-12 px-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none font-bold text-xs uppercase tracking-widest cursor-pointer"
                >
                  <option value="amount">Flat Amount (Rs.)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                  {newVoucher.type === "amount" ? "Face Value (Rs.)" : "Discount (%)"}
                </label>
                <input
                  id="value"
                  type="number"
                  value={newVoucher.value}
                  onChange={(e) => setNewVoucher({ ...newVoucher, value: e.target.value })}
                  className="w-full h-12 px-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all outline-none font-black text-lg"
                  required
                />
              </div>

              {newVoucher.type === "percentage" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Max Discount (Rs.) [Optional]</label>
                  <input
                    id="maxDiscount"
                    type="number"
                    value={newVoucher.maxDiscount}
                    onChange={(e) => setNewVoucher({ ...newVoucher, maxDiscount: e.target.value })}
                    className="w-full h-12 px-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none font-medium text-sm"
                    placeholder="Limit the discount amount"
                  />
                </motion.div>
              )}

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Marketing Campaign</label>
                <select
                  id="campaign"
                  value={newVoucher.campaign}
                  onChange={(e) => setNewVoucher({ ...newVoucher, campaign: e.target.value })}
                  className="w-full h-12 px-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none font-bold text-xs uppercase tracking-widest cursor-pointer"
                >
                  <option value="">No Campaign</option>
                  <option value="holiday">Holiday Campaign</option>
                  <option value="birthday">Birthday Rewards</option>
                  <option value="welcome">Welcome Bonus</option>
                  <option value="loyalty">Loyalty Program</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Lifecycle Expiry</label>
                <input
                  type="date"
                  className="w-full h-12 px-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none font-bold text-xs uppercase tracking-widest"
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setNewVoucher({ ...newVoucher, expiryDate: date });
                  }}
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Asset Description</label>
                <textarea
                  id="description"
                  value={newVoucher.description}
                  onChange={(e) => setNewVoucher({ ...newVoucher, description: e.target.value })}
                  className="w-full p-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none font-medium text-sm min-h-[100px] resize-none"
                  placeholder="Special holiday gift voucher details..."
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Brand Identity</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1 px-4 h-12 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                  />
                  {previewLogo && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-12 w-12 rounded-xl overflow-hidden border border-gray-100 p-1 bg-white shadow-sm">
                      <img src={previewLogo} alt="Logo Preview" className="h-full w-full object-contain" />
                    </motion.div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Upload PNG, JPG, or SVG (max 5MB)</p>
              </div>
            </div>

            <div className="flex gap-4 pt-8">
              <button type="submit" className="flex-[2] h-14 bg-black text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:bg-gray-800 transition-all">
                Create Asset
              </button>
              <button type="button" className="flex-1 h-14 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-all" onClick={() => setCurrentPage("vouchers")}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="sticky top-8 space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-2">Vault Preview</h2>
          <motion.div layout className="w-full aspect-[1.6/1] rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden group" style={{ backgroundColor: newVoucher.color || "#1e293b" }}>
            <div className="absolute inset-4 bg-black/10 backdrop-blur-md rounded-[2.2rem] border border-white/10 p-8 flex flex-col justify-between z-10 overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="h-14 w-14 bg-white/90 rounded-xl p-2 flex items-center justify-center shadow-lg shadow-black/20">
                  {previewLogo || newVoucher.logo ? (
                    <img src={previewLogo || `${newVoucher.logo}?t=${Date.now()}`} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <Gift className="text-black w-6 h-6" />
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">Secure Asset</p>
                  <p className="text-[11px] font-bold text-white uppercase tracking-tighter">Verified Issuance</p>
                </div>
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-white mb-1 uppercase truncate">
                  {newVoucher.name || "Voucher Name"}
                </h3>
                <p className="text-white/60 text-[10px] font-medium max-w-[85%] line-clamp-2 italic uppercase tracking-wider">
                  {newVoucher.description || "Digital voucher description details..."}
                </p>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                  <div className="bg-white/20 px-4 py-2 rounded-full">
                    <span className="text-2xl font-black text-white tracking-tighter">
                      {newVoucher.type === "percentage" ? `${newVoucher.value}% Off` : `Rs. ${newVoucher.value}`}
                    </span>
                  </div>
                  {newVoucher.type === "percentage" && newVoucher.maxDiscount && (
                    <p className="text-[9px] font-bold text-white/40 mt-1 uppercase">Upto Rs. {newVoucher.maxDiscount}</p>
                  )}
                </div>
                {newVoucher.expiryDate && (
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Valid Thru</p>
                    <p className="text-xs font-bold text-white uppercase">{format(newVoucher.expiryDate, "MMM dd, yyyy")}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 p-6 rounded-3xl flex items-center gap-4">
              <input
                type="color"
                value={newVoucher.color}
                onChange={(e) => setNewVoucher({ ...newVoucher, color: e.target.value })}
                className="w-10 h-10 p-0 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden shrink-0"
              />
              <div>
                <p className="text-[9px] font-bold uppercase text-gray-400">Vault Theme</p>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-tighter">{newVoucher.color || "#1e293b"}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 p-6 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <Ticket size={20} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase text-gray-400">Active Campaign</p>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-tighter truncate">{newVoucher.campaign || "Internal"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderVouchersContent = () => {
    const safeVouchers = filteredVouchers || [];

    return (
      <motion.div className="space-y-8 pb-32" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-gray-900">Voucher Registry</h1>
            <p className="text-gray-500 font-medium mt-1">Manage, audit, and deploy your digital vault assets.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full md:w-auto bg-black text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-black/10 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
            onClick={() => {
              setCurrentPage("createVoucher");
              setActiveTab("createVoucher");
            }}
          >
            <Plus size={16} /> Forge New Asset
          </motion.button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="Search registry by name, ID, or campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3.5 w-full bg-white border border-gray-100 rounded-[1.2rem] focus:ring-4 focus:ring-gray-50 outline-none text-sm font-medium transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center p-1.5 bg-gray-100 rounded-[1.2rem] w-full md:w-auto">
            <button className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === "list" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}`} onClick={() => setViewMode("list")}> <div className="flex items-center gap-2 justify-center"><List size={14} /> List</div></button>
            <button className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}`} onClick={() => setViewMode("grid")}> <div className="flex items-center gap-2 justify-center"><LayoutGrid size={14} /> Grid</div></button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingSkeleton key="loader" />
          ) : safeVouchers.length === 0 ? (
            <motion.div key="empty" className="py-32 text-center bg-white border border-gray-100 rounded-[3rem] shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Ticket className="text-gray-300 w-8 h-8" />
              </div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">No assets found in ledger</p>
            </motion.div>
          ) : viewMode === "list" ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-50">
                  <thead className="bg-gray-50/50">
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <th className="px-8 py-5 text-left">Asset Identity</th>
                      <th className="px-8 py-5 text-left hidden sm:table-cell">Valuation</th>
                      <th className="px-8 py-5 text-left hidden lg:table-cell">Campaign</th>
                      <th className="px-8 py-5 text-left">Status</th>
                      <th className="px-8 py-5 text-left hidden md:table-cell">Usage</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {safeVouchers.map((voucher) => (
                      <tr key={voucher._id} className="hover:bg-gray-50/30 transition-all group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-black/5" style={{ backgroundColor: voucher.color || "#000" }}>
                              <Gift size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate uppercase tracking-tight">{voucher.name}</p>
                              <p className="text-[9px] font-mono text-gray-400 uppercase">ID: {voucher._id.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 hidden sm:table-cell">
                          <span className="font-black text-sm text-gray-900">{voucher.type === "percentage" ? `${voucher.value}% OFF` : `Rs. ${voucher.value?.toLocaleString()}`}</span>
                        </td>
                        <td className="px-8 py-5 hidden lg:table-cell">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{voucher.campaign || "—"}</span>
                        </td>
                        <td className="px-8 py-5"><LocalStatusBadge status={voucher.status} /></td>
                        <td className="px-8 py-5 hidden md:table-cell">
                          <div className="flex flex-col">
                            <span className="text-xs font-black">{voucher.redeemedCount || 0}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase">Redeemed</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleViewVoucher(voucher)} className="p-2.5 hover:bg-white rounded-xl text-gray-400 hover:text-black hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"><Eye size={16} /></button>
                            <button onClick={() => handleEditVoucher(voucher)} className="p-2.5 hover:bg-white rounded-xl text-gray-400 hover:text-emerald-600 hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"><Edit size={16} /></button>
                            <button onClick={() => { setSelectedVoucher(voucher); setIsDeleteModalOpen(true); }} className="p-2.5 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {safeVouchers.map((voucher) => (
                <motion.div key={voucher._id} whileHover={{ y: -8 }} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: voucher.color || "#000" }}>
                      <Gift size={24} />
                    </div>
                    <LocalStatusBadge status={voucher.status} />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-1 truncate uppercase">{voucher.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Vault Item #{voucher._id.slice(-6)}</p>
                  <div className="text-4xl font-black tracking-tighter text-black mb-8">{voucher.type === "percentage" ? `${voucher.value}%` : `Rs.${voucher.value?.toLocaleString()}`}</div>
                  <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Valid Until</span>
                      <span className="text-xs font-bold text-gray-900">{voucher.expiryDate ? format(new Date(voucher.expiryDate), "MMM dd, yyyy") : "Perpetual"}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleViewVoucher(voucher)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-black transition-colors"><Eye size={18} /></button>
                      <button onClick={() => handleEditVoucher(voucher)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-black transition-colors"><Edit size={18} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(isViewModalOpen || isEditModalOpen) && selectedVoucher && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsViewModalOpen(false); setIsEditModalOpen(false); }} className="absolute inset-0 z-0" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="bg-white w-full max-w-2xl rounded-t-[3rem] sm:rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[92vh] sm:max-h-[85vh]">
                <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8 sm:hidden" />
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tighter text-gray-900">{isEditModalOpen ? "Modify Asset" : "Audit Report"}</h2>
                    <p className="text-[10px] font-mono text-gray-400 uppercase mt-1 tracking-widest">Global UID: {selectedVoucher._id}</p>
                  </div>
                  <button onClick={() => { setIsViewModalOpen(false); setIsEditModalOpen(false); }} className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"><X size={20} /></button>
                </div>

                {isViewModalOpen && (
                  <div className="space-y-8">
                    <div className="p-10 rounded-[2.5rem] text-white relative overflow-hidden" style={{ backgroundColor: selectedVoucher.color || "#000" }}>
                      <div className="relative z-10 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mb-2">Net Value</p>
                          <h3 className="text-6xl font-black tracking-tighter">{selectedVoucher.type === "percentage" ? `${selectedVoucher.value}%` : `Rs.${selectedVoucher.value?.toLocaleString()}`}</h3>
                        </div>
                        <Gift size={50} className="opacity-20" />
                      </div>
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6">
                      {[
                        { label: "Entity Name", val: selectedVoucher.name },
                        { label: "Campaign Reference", val: selectedVoucher.campaign || "Default" },
                        { label: "Redemption Count", val: `${selectedVoucher.redeemedCount || 0} Assets` },
                        { label: "Genesis Date", val: format(new Date(selectedVoucher.createdAt), "MMM dd, yyyy") },
                        { label: "Expiration Protocol", val: format(new Date(selectedVoucher.expiryDate), "MMM dd, yyyy") },
                        { label: "System Status", component: <LocalStatusBadge status={selectedVoucher.status} /> },
                      ].map((item, i) => (
                        <div key={i}>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">{item.label}</p>
                          {item.component ? item.component : <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{item.val}</p>}
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-2"><ShieldCheck size={14} /> Governance & Terms</p>
                      <p className="text-sm text-gray-600 leading-relaxed italic font-medium">{selectedVoucher.description || "No specific contractual terms defined for this asset."}</p>
                    </div>
                  </div>
                )}

                {isEditModalOpen && (
                  <form onSubmit={handleUpdateVoucher} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Brand Identity</label>
                        <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                          <div className="relative w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                            {selectedVoucher.logo ? (
                              <img src={`${selectedVoucher.logo}?t=${Date.now()}`} alt="Voucher Logo" className="w-full h-full object-contain p-1" />
                            ) : null}
                            {!selectedVoucher.logo && <Gift className="text-gray-200 w-6 h-6" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-gray-900 mb-1">Upload Asset Logo</p>
                            <p className="text-[10px] text-gray-400 font-medium mb-3 uppercase tracking-tighter">PNG, JPG, or SVG (max 5MB)</p>
                            <input type="file" accept="image/*" onChange={handleEditLogoUpload} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Asset Nomenclature</label>
                        <input value={selectedVoucher.name} onChange={(e) => setSelectedVoucher({ ...selectedVoucher, name: e.target.value })} className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-gray-900 border-transparent focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 outline-none transition-all" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Valuation Mode</label>
                        <select value={selectedVoucher.type} onChange={(e) => setSelectedVoucher({ ...selectedVoucher, type: e.target.value })} className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-xs uppercase cursor-pointer border-none outline-none appearance-none">
                          <option value="amount">Fixed Amount (NPR)</option>
                          <option value="percentage">Percentage (%)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Magnitude</label>
                        <input type="number" value={selectedVoucher.value} onChange={(e) => setSelectedVoucher({ ...selectedVoucher, value: parseFloat(e.target.value) })} className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-black text-lg outline-none focus:ring-4 focus:ring-gray-50 border-none" />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Expiration Protocol</label>
                        <input type="datetime-local" value={selectedVoucher.expiryDate ? format(new Date(selectedVoucher.expiryDate), "yyyy-MM-dd'T'HH:mm") : ""} onChange={(e) => setSelectedVoucher({ ...selectedVoucher, expiryDate: e.target.value })} className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-xs outline-none border-none" />
                      </div>

                      <div className="md:col-span-2 flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                        <input type="color" value={selectedVoucher.color || "#000000"} onChange={(e) => setSelectedVoucher({ ...selectedVoucher, color: e.target.value })} className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer rounded-xl overflow-hidden shrink-0" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vault Identity Color</p>
                          <p className="text-xs font-mono text-gray-600 uppercase">{selectedVoucher.color || "#000000"}</p>
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Operational Status</label>
                        <select value={selectedVoucher.status || "draft"} onChange={(e) => setSelectedVoucher({ ...selectedVoucher, status: e.target.value })} className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-sm uppercase cursor-pointer border-none outline-none appearance-none focus:ring-4 focus:ring-gray-50">
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-8">
                      <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all">Discard</button>
                      <button type="submit" className="flex-[2] py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-gray-800 transition-all">{isLoading ? "Syncing..." : "Commit Changes"}</button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isDeleteModalOpen && selectedVoucher && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm text-center shadow-2xl">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Trash2 size={32} />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-2">Burn Asset?</h2>
                <p className="text-gray-500 text-sm mb-10 leading-relaxed font-medium">
                  This will permanently delete <span className="text-black font-bold">"{selectedVoucher.name}"</span>. This operation cannot be reversed.
                </p>
                <div className="flex flex-col gap-3">
                  <button onClick={handleDeleteVoucher} className="w-full py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all">Confirm Termination</button>
                  <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all">Cancel Protocol</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderRedeemContent = () => (
    <motion.div className="space-y-10 pb-20" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}>
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter text-gray-900">Redemption Hub</h1>
        <p className="text-gray-500 font-medium">Verify cryptographic codes and burn active assets in real-time.</p>
      </div>

      <div className="max-w-xl mx-auto text-center">
        <button
          type="button"
          onClick={onOpenQrScanner}
          className="inline-flex items-center justify-center gap-2 mb-4 px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-lg hover:bg-slate-800 transition-all"
        >
          <QrCode className="h-4 w-4" /> Scan QR to Fill Voucher
        </button>
        <p className="text-xs text-gray-400 uppercase tracking-[0.3em]">
          Scan a customer QR to auto-fill email and cryptographic code.
        </p>
      </div>

      <div className="max-w-xl w-full mx-auto">
        <div className="bg-white rounded-[3rem] p-10 md:p-12 border border-gray-100 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
          <form onSubmit={handleRedeem} className="space-y-8 relative z-10">
            <div className="flex justify-center mb-6">
              <div className="bg-black p-4 rounded-[2rem] shadow-xl shadow-black/10">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Beneficiary Email</label>
                <div className="relative">
                  <input id="email" type="email" value={redeemForm.email} onChange={(e) => setRedeemForm({ ...redeemForm, email: e.target.value })} placeholder="Enter associated email address" className="w-full h-14 px-5 bg-[#F5F5F7] border-transparent rounded-2xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all outline-none font-medium text-sm" required />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"><Users size={18} /></div>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="code" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Cryptographic Code</label>
                <div className="relative">
                  <input id="code" type="text" value={redeemForm.code} onChange={(e) => setRedeemForm({ ...redeemForm, code: e.target.value })} placeholder="GIFT-XXXX-XXXX" className="w-full h-14 px-5 bg-[#F5F5F7] border-transparent rounded-2xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all outline-none font-mono font-bold text-lg tracking-widest uppercase placeholder:tracking-normal placeholder:font-sans placeholder:text-sm" required />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"><Ticket size={18} /></div>
                </div>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isRedeeming} className="w-full h-16 bg-black text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3">
              {isRedeeming ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Authenticating...</>) : "Authorize Redemption"}
            </motion.button>
            <div className="pt-4 text-center">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">All redemptions are final and recorded <br /> on the secure GiftVault ledger.</p>
            </div>
          </form>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center space-y-2 shadow-sm">
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><ShieldCheck size={20} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Verified Only</p>
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">System automatically detects expired or forged assets.</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center space-y-2 shadow-sm">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Auto-Burn</p>
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Single-use tokens are voided immediately upon authorization.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderDistributionContent = () => (
    <motion.div className="space-y-10 pb-20" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-gray-900">Distribution</h1>
          <p className="text-gray-500 font-medium">Logistics and deployment of digital assets.</p>
        </div>
      </div>
      <div className="relative inline-flex p-1 bg-gray-100 rounded-2xl">
        {["send", "history"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-8 py-2.5 text-[11px] font-bold uppercase tracking-widest z-10 transition-colors duration-300 ${activeTab === tab ? "text-black" : "text-gray-400 hover:text-gray-600"}`}>
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="distributionTabPill" className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10 border border-gray-200/50" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }} className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.02)]">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">{activeTab === "send" ? "Initiate Transfer" : "Audit Registry"}</h2>
            <p className="text-gray-500 leading-relaxed font-medium mb-8">{activeTab === "send" ? "Securely deploy selected vouchers from your vault to client endpoints." : "A chronological record of all successful asset redemptions and transfers."}</p>
            <div className="border-2 border-dashed border-gray-100 rounded-3xl h-64 flex flex-col items-center justify-center gap-4 text-gray-300">
              <div className="bg-gray-50 p-4 rounded-full">{activeTab === "send" ? <Zap className="w-8 h-8" /> : <BarChart3 className="w-8 h-8" />}</div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Ready for Deployment</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );

  const renderAnalyticsContent = () => {
    const safeVouchers = vouchers || [];
    const totalRevenue = safeVouchers.reduce((acc, v) => acc + (v?.redeemedCount || 0) * (v?.value || 0), 0);
    const totalCustomers = new Set(safeVouchers.flatMap((v) => v.redemptions?.map((r) => r.userId) || [])).size;
    const activeVouchers = safeVouchers.filter((v) => v?.status === "active").length;
    const sentCount = safeVouchers.reduce((acc, v) => acc + (v?.sentCount || 0), 0);
    const redeemedCount = safeVouchers.reduce((acc, v) => acc + (v?.redeemedCount || 0), 0);
    const redemptionRate = sentCount > 0 ? ((redeemedCount / sentCount) * 100).toFixed(1) : "0.0";
    const statusData = [
      { name: "Active", value: activeVouchers, color: "#10b981" },
      { name: "Draft", value: safeVouchers.filter((v) => v?.status === "draft").length, color: "#f59e0b" },
      { name: "Expired", value: safeVouchers.filter((v) => v?.status === "expired").length, color: "#ef4444" },
    ].filter((d) => d.value > 0);

    return (
      <motion.div className="space-y-10 pb-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold tracking-tighter text-gray-900">Insights</h1>
          <p className="text-gray-500 font-medium text-sm">Performance metrics for your issued assets.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, icon: BarChart3, bg: "bg-blue-50", text: "text-blue-600" },
            { label: "Customers", value: totalCustomers, icon: Users, bg: "bg-indigo-50", text: "text-indigo-600" },
            { label: "Active", value: activeVouchers, icon: Gift, bg: "bg-emerald-50", text: "text-emerald-600" },
            { label: "Rate", value: `${redemptionRate}%`, icon: Percent, bg: "bg-violet-50", text: "text-violet-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-40">
              <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                <h3 className="text-2xl font-black tracking-tighter text-gray-900">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-8">Redemption Registry</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeVouchers}>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: "#f8f8f8" }} />
                  <Bar dataKey="redeemedCount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-8">Vault Status</h2>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData.length > 0 ? statusData : [{ name: "Empty", value: 1, color: "#f3f4f6" }]} innerRadius={80} outerRadius={105} paddingAngle={5} dataKey="value" stroke="none">
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Assets</span>
                <span className="text-4xl font-black tracking-tighter">{safeVouchers.length}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSettingsContent = () => {
    if (profileLoading) {
      return (
        <div className="h-[60vh] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">
          <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin mr-3" />
          Loading Profile...
        </div>
      );
    }

    return (
      <motion.div
        className="space-y-10 pb-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold tracking-tighter text-gray-900">
            Identity & Preferences
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Manage your vault credentials and system behavior.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Account Profile Card */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-8 flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" /> Account Profile
              </h2>

              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                      Entity Name
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                      Access Email
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.companyName}
                      onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                      className="w-full h-12 px-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all outline-none font-medium text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.number}
                      onChange={(e) => setProfileForm({ ...profileForm, number: e.target.value })}
                      className="w-full h-12 px-4 bg-[#F5F5F7] border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 transition-all outline-none font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
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
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight text-gray-900 mb-6">
                Security Status
              </h2>

              <div className="space-y-6">
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                      Vault Active
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium leading-relaxed mt-1">
                      Your account is currently protected by AES-256 protocol.
                    </p>
                  </div>
                </div>

                <div className="px-1 border-b border-gray-50 pb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">
                    Genesis Date
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {userProfile?.createdAt ? format(new Date(userProfile.createdAt), "MMMM yyyy") : "N/A"}
                  </p>
                </div>

                <div className="px-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">
                    Account Status
                  </p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    {userProfile?.isApproved ? "Approved" : "Pending Approval"}
                    <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      userProfile?.isApproved
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {userProfile?.isApproved ? "Active" : "Pending"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-6">
                <button className="w-full py-4 text-red-500 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-red-50 rounded-2xl transition-colors">
                  Terminate Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderLoyaltyContent = () => {
    if (!userProfile) {
      return (
        <div className="h-[60vh] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">
          <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin mr-3" />
          Loading Profile...
        </div>
      );
    }

    return (
      <motion.div
        className="pb-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VendorLoyaltySettings 
          vendorId={userProfile._id} 
          userId={userProfile._id}
        />
      </motion.div>
    );
  };

  const renderQrGeneratorContent = () => {
    if (!userProfile) {
      return (
        <div className="h-[60vh] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">
          <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin mr-3" />
          Loading Profile...
        </div>
      );
    }

    return (
      <motion.div
        className="pb-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VendorQRGenerator vendorId={userProfile._id} />
      </motion.div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto relative scroll-smooth pt-16 lg:pt-0 pb-24 lg:pb-0">
      <div className="absolute top-0 right-0 w-full lg:w-[600px] h-[400px] lg:h-[600px] bg-gray-100/30 blur-[80px] lg:blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={currentPage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {currentPage === "dashboard" && renderDashboardContent()}
            {currentPage === "createVoucher" && renderCreateVoucherContent()}
            {currentPage === "vouchers" && renderVouchersContent()}
            {currentPage === "redeem" && renderRedeemContent()}
            {currentPage === "loyalty" && renderLoyaltyContent()}
            {currentPage === "qr_generator" && renderQrGeneratorContent()}
            {currentPage === "distribution" && renderDistributionContent()}
            {currentPage === "analytics" && renderAnalyticsContent()}
            {currentPage === "settings" && renderSettingsContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
