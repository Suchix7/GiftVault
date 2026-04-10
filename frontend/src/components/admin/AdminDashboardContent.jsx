import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";
import {
  X, Search, Edit, Trash2, Eye, Plus, Users, ShieldCheck,
  TrendingUp, Activity, Check, RefreshCw, Tag, Award,
  AlertTriangle, Star, Zap, BarChart2, ChevronDown,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const CATEGORY_COLORS = {
  Cafe: "#f59e0b", Restaurant: "#ef4444", Clothing: "#8b5cf6",
  Electronics: "#3b82f6", Beauty: "#ec4899", Services: "#10b981", Other: "#6b7280",
};
const CATEGORY_EMOJIS = {
  Cafe: "☕", Restaurant: "🍽️", Clothing: "👕",
  Electronics: "📱", Beauty: "💄", Services: "🔧", Other: "🏪",
};

const CATEGORIES = ["Cafe", "Restaurant", "Clothing", "Electronics", "Beauty", "Services", "Other"];

// ─── Small Utilities ──────────────────────────────────────────────
const StatCard = ({ title, value, sub, icon: Icon, color = "black", badge }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between group transition-all hover:shadow-xl hover:shadow-black/5"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500`}>
        <Icon size={20} />
      </div>
      {badge && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{badge}</span>}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</p>
      <h3 className="text-3xl font-black tracking-tighter text-gray-900 mt-1">{value}</h3>
      <p className="text-[10px] font-medium text-gray-400 mt-2">{sub}</p>
    </div>
  </motion.div>
);

const RateBar = ({ rate }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${rate >= 60 ? "bg-emerald-500" : rate >= 30 ? "bg-amber-500" : "bg-rose-400"}`}
        style={{ width: `${Math.min(rate, 100)}%` }}
      />
    </div>
    <span className="text-[10px] font-black w-8 text-right">{rate}%</span>
  </div>
);

// ─── Modals ───────────────────────────────────────────────────────
const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl"
      >
        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8 sm:hidden" />
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tighter">Identity Card</h2>
            <p className="text-[10px] font-mono text-gray-400 uppercase mt-1">UID: {user._id}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Full Name", val: user.name },
                { label: "Email", val: user.email },
                { label: "Company", val: user.companyName || "N/A" },
                { label: "Phone", val: user.number || "Not set" },
                { label: "Category", val: user.vendorCategory ? `${CATEGORY_EMOJIS[user.vendorCategory] || ""} ${user.vendorCategory}` : "N/A" },
              ].map((item, i) => (
                <div key={i} className="break-words">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-gray-900">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Role</p>
              <span className="text-xs font-bold uppercase bg-black text-white px-3 py-1 rounded-full">{user.role}</span>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
              <span className={cn("text-xs font-bold uppercase tracking-widest", user.isApproved ? "text-emerald-600" : "text-amber-600")}>
                {user.isApproved ? "Verified" : "Pending"}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
          Close
        </button>
      </motion.div>
    </div>
  );
};

const CreateUserModal = ({ isOpen, onClose, onCreate, userType, editingUser }) => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", companyName: "", number: "", vendorCategory: "Cafe" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({ name: editingUser.name, email: editingUser.email, password: "", companyName: editingUser.companyName || "", number: editingUser.number || "", vendorCategory: editingUser.vendorCategory || "Cafe" });
    } else {
      setFormData({ name: "", email: "", password: "", companyName: "", number: "", vendorCategory: "Cafe" });
    }
  }, [editingUser, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData);
      onClose();
      toast.success(editingUser ? "Updated successfully" : "Created successfully");
    } catch (error) {
      toast.error(error.message || "Failed to process");
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;
  const isVendor = userType === "Vendor";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6 sm:hidden" />
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tighter">{editingUser ? "Edit User" : `Create ${userType}`}</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: "Name", key: "name", type: "text", required: true },
            { label: "Email", key: "email", type: "email", required: true },
            { label: `Password${editingUser ? " (leave blank to keep)" : ""}`, key: "password", type: "password", required: !editingUser },
          ].map(field => (
            <div key={field.key} className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{field.label}</label>
              <input type={field.type} required={field.required} value={formData[field.key]}
                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-50 outline-none transition-all" />
            </div>
          ))}
          {isVendor && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Company</label>
                <input type="text" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-50 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                <select value={formData.vendorCategory} onChange={e => setFormData({ ...formData, vendorCategory: e.target.value })}
                  className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-gray-900 focus:bg-white outline-none transition-all">
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/20 hover:bg-gray-800 disabled:opacity-50">
              {loading ? "Processing..." : editingUser ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, entityName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm text-center shadow-2xl">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><Trash2 size={32} /></div>
        <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-2">Delete User?</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
          Permanently delete <span className="text-black font-bold">"{entityName}"</span>? This cannot be undone.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-200 hover:bg-rose-600">Confirm Delete</button>
          <button onClick={onClose} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Analytics Page ───────────────────────────────────────────────
const AnalyticsPage = ({ analytics, loading, onRefresh }) => {
  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
      <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest">Loading Analytics...</p>
    </div>
  );
  if (!analytics) return <div className="p-10 text-center text-gray-400 text-sm">No analytics data available.</div>;

  const { platformHealth, topVouchers, worstVouchers, vendorPerformance, categoryBreakdown, topCustomers } = analytics;

  const COLORS = ["#000", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899"];

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">Analytics</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Business intelligence & platform performance.</p>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-full hover:border-gray-200 transition-all">
          <RefreshCw size={12} /> Refresh
        </button>
      </header>

      {/* Platform Health KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Total Vouchers" value={platformHealth.totalVouchers} sub="Across all vendors" icon={Tag} />
        <StatCard title="Total Redemptions" value={platformHealth.totalRedemptions} sub="Completed transactions" icon={Award} badge="Live" />
        <StatCard title="Redemption Rate" value={`${platformHealth.overallRedemptionRate}%`} sub="Platform average" icon={TrendingUp} />
        <StatCard title="Loyalty Scans" value={platformHealth.totalLoyaltyScans} sub="Stamp card scans" icon={Zap} />
        <StatCard title="Bonus Points" value={platformHealth.totalBonusPoints.toLocaleString()} sub="In circulation" icon={Star} />
        <StatCard title="Vendor Approval" value={`${platformHealth.vendorApprovalRate}%`} sub={`${platformHealth.totalVendors} total vendors`} icon={ShieldCheck} />
        <StatCard title="Customers" value={platformHealth.totalCustomers} sub="Active wallet holders" icon={Users} />
        <StatCard title="Vouchers Sent" value={platformHealth.totalSent} sub="Total distributed" icon={Activity} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Vendors by Redemptions */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400">Top Vendors by Redemptions</h3>
          {vendorPerformance.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-gray-300 text-sm">No vendor data</div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorPerformance.slice(0, 8)} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                  <YAxis type="category" dataKey="vendorName" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" width={90} tickFormatter={v => v.length > 12 ? v.slice(0, 12) + "…" : v} />
                  <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="totalRedeemed" name="Redemptions" fill="#000" radius={[0, 8, 8, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown Pie */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400">Category Distribution</h3>
          {categoryBreakdown.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-gray-300 text-sm">No category data</div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={6} dataKey="totalVouchers">
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[entry.category] || COLORS[i % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n, p) => [v, p.payload.category]} contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
                  <Legend iconType="circle" formatter={v => <span className="text-[10px] font-bold uppercase">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top Vouchers Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">🏆 Most Redeemed Vouchers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/50">
              <tr className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-8 py-4 text-left">Rank</th>
                <th className="px-8 py-4 text-left">Voucher</th>
                <th className="px-8 py-4 text-left">Vendor</th>
                <th className="px-8 py-4 text-left">Category</th>
                <th className="px-8 py-4 text-left">Redeemed</th>
                <th className="px-8 py-4 text-left">Rate</th>
                <th className="px-8 py-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topVouchers.length === 0 ? (
                <tr><td colSpan={7} className="px-8 py-16 text-center text-gray-300 text-sm">No voucher data yet</td></tr>
              ) : topVouchers.map((v, i) => (
                <tr key={v._id} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-4">
                    <span className={cn("text-sm font-black", i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-300")}>
                      #{i + 1}
                    </span>
                  </td>
                  <td className="px-8 py-4"><p className="text-sm font-bold text-gray-900">{v.name}</p></td>
                  <td className="px-8 py-4"><p className="text-xs text-gray-500 font-medium">{v.vendorCompanyName || v.vendorName}</p></td>
                  <td className="px-8 py-4">
                    <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{ background: (CATEGORY_COLORS[v.category] || "#6b7280") + "20", color: CATEGORY_COLORS[v.category] || "#6b7280" }}>
                      {CATEGORY_EMOJIS[v.category] || ""} {v.category}
                    </span>
                  </td>
                  <td className="px-8 py-4"><span className="text-sm font-black text-gray-900">{v.redeemedCount}</span></td>
                  <td className="px-8 py-4 w-36"><RateBar rate={v.redemptionRate} /></td>
                  <td className="px-8 py-4">
                    <span className={cn("text-[9px] font-black uppercase px-2 py-1 rounded-full", v.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400")}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worst Performers + Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Worst Performers */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Underperforming Vouchers</h3>
          </div>
          <div className="p-6 space-y-3">
            {worstVouchers.length === 0 ? (
              <p className="text-center text-gray-300 text-sm py-8">No data</p>
            ) : worstVouchers.map((v, i) => (
              <div key={v._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-xs font-black">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{v.name}</p>
                  <p className="text-[10px] text-gray-400">{v.vendorCompanyName || v.vendorName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-rose-500">{v.redemptionRate}% rate</p>
                  <p className="text-[9px] text-gray-400">{v.redeemedCount} claimed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Top Customers</h3>
          </div>
          <div className="p-6 space-y-3">
            {topCustomers.length === 0 ? (
              <p className="text-center text-gray-300 text-sm py-8">No customer data</p>
            ) : topCustomers.map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black", i === 0 ? "bg-yellow-100 text-yellow-600" : i === 1 ? "bg-gray-100 text-gray-500" : "bg-gray-50 text-gray-400")}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{c.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-gray-900">{c.redemptions} vouchers</p>
                  <p className="text-[9px] text-gray-400">{c.bonusPoints} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">📊 Category Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/50">
              <tr className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-8 py-4 text-left">Category</th>
                <th className="px-8 py-4 text-left">Vouchers</th>
                <th className="px-8 py-4 text-left">Redeemed</th>
                <th className="px-8 py-4 text-left">Redemption Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categoryBreakdown.map((cat, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[cat.category] || "#6b7280" }} />
                      <span className="text-sm font-bold text-gray-900">{CATEGORY_EMOJIS[cat.category]} {cat.category}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm font-medium text-gray-600">{cat.totalVouchers}</td>
                  <td className="px-8 py-4 text-sm font-black text-gray-900">{cat.totalRedeemed}</td>
                  <td className="px-8 py-4 w-48"><RateBar rate={cat.redemptionRate} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Overview with live data ──────────────────────────────────────
const OverviewPage = ({ users, loading, error, analytics }) => {
  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin mr-3" /> Syncing...
    </div>
  );
  if (error) return <div className="text-red-500 font-bold p-8">Failed to load data.</div>;

  const totalRegularUsers = users.filter(u => u.role === "user").length;
  const totalVendors = users.filter(u => u.role === "vendor").length;
  const totalAdmins = users.filter(u => u.role === "admin").length;
  const approvedVendors = users.filter(u => u.role === "vendor" && u.isApproved).length;
  const unapprovedVendors = totalVendors - approvedVendors;

  const userDistributionData = [
    { name: "Customers", value: totalRegularUsers, color: "#2563eb" },
    { name: "Vendors", value: totalVendors, color: "#10b981" },
    { name: "Admins", value: totalAdmins, color: "#000" },
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">Overview</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Platform-wide metrics at a glance.</p>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-full">
          {format(new Date(), "MMMM dd, yyyy")}
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Vendors" value={totalVendors} sub={`${approvedVendors} approved, ${unapprovedVendors} pending`} icon={Users} badge="Live" />
        <StatCard title="Customers" value={totalRegularUsers} sub="Active wallet holders" icon={Activity} />
        <StatCard title="Admins" value={totalAdmins} sub="Platform operators" icon={ShieldCheck} />
        <StatCard title="Network Nodes" value={users.length} sub="Total accounts" icon={TrendingUp} />
        {analytics && <>
          <StatCard title="Total Vouchers" value={analytics.platformHealth.totalVouchers} sub="Across all vendors" icon={Tag} />
          <StatCard title="Redemptions" value={analytics.platformHealth.totalRedemptions} sub="Completed" icon={Award} />
          <StatCard title="Redemption Rate" value={`${analytics.platformHealth.overallRedemptionRate}%`} sub="Platform average" icon={BarChart2} />
          <StatCard title="Loyalty Scans" value={analytics.platformHealth.totalLoyaltyScans} sub="Stamp card scans" icon={Zap} />
        </>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400">User Distribution</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                  {userDistributionData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400">Vendor Approval Status</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: "Approved", value: approvedVendors }, { name: "Pending", value: unapprovedVendors }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                  <Cell fill="#10b981" /><Cell fill="#f59e0b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Vendors Quick View */}
      {analytics?.vendorPerformance?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">🏅 Top Performing Vendors</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {analytics.vendorPerformance.slice(0, 6).map((v, i) => (
              <div key={v.vendorId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0",
                  i === 0 ? "bg-yellow-100 text-yellow-600" : i === 1 ? "bg-gray-100 text-gray-400" : "bg-gray-50 text-gray-300"
                )}>#{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {v.vendorCompanyName || v.vendorName}
                  </p>
                  {v.vendorCompanyName && v.vendorPersonName && v.vendorCompanyName !== v.vendorPersonName && (
                    <p className="text-[10px] text-gray-400 truncate">{v.vendorPersonName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: (CATEGORY_COLORS[v.vendorCategory] || "#6b7280") + "20", color: CATEGORY_COLORS[v.vendorCategory] || "#6b7280" }}>
                      {CATEGORY_EMOJIS[v.vendorCategory]} {v.vendorCategory}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-gray-900">{v.totalRedeemed}</p>
                  <p className="text-[9px] text-gray-400">redeemed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Data Registry (Vendors / Customers / Admins) ─────────────────
function DataRegistry({ type, title, users, searchTerm, setSearchTerm, setCreatingUserType, setEditingUser, setIsCreateModalOpen, setViewingUser, setIsViewModalOpen, setUserToDelete, setIsDeleteModalOpen, toggleApprovalStatus, onCategoryUpdate }) {
  const roleMap = { vendors: "vendor", customers: "user", admins: "admin" };
  const [editingCategoryFor, setEditingCategoryFor] = useState(null);

  const filtered = users
    .filter(u => u.role === roleMap[type])
    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCategoryChange = async (userId, newCategory) => {
    try {
      await api.patch(`/users/${userId}`, { vendorCategory: newCategory });
      onCategoryUpdate(userId, newCategory);
      toast.success("Category updated");
    } catch (err) {
      toast.error("Failed to update category");
    } finally {
      setEditingCategoryFor(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">{title}</h1>
          <p className="text-gray-500 font-medium mt-1">{filtered.length} {type} registered.</p>
        </div>
        <button
          onClick={() => { setCreatingUserType(type === "vendors" ? "Vendor" : type === "admins" ? "Admin" : "Customer"); setEditingUser(null); setIsCreateModalOpen(true); }}
          className="w-full md:w-auto bg-black text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add {type.slice(0, -1)}
        </button>
      </div>

      <div className="relative w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
        <input placeholder={`Search ${type} by name or email...`} className="pl-11 pr-4 py-3.5 w-full bg-white border border-gray-100 rounded-[1.2rem] focus:ring-4 focus:ring-gray-50 outline-none text-sm font-medium transition-all shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-8 py-5 text-left">Identity</th>
                <th className="px-8 py-5 text-left">Contact</th>
                {type === "vendors" && <th className="px-8 py-5 text-left">Category</th>}
                {type === "vendors" && <th className="px-8 py-5 text-left">Status</th>}
                <th className="px-8 py-5 text-left hidden sm:table-cell">Joined</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr key={user._id} className="group hover:bg-gray-50/30 transition-all">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors duration-500 shrink-0">
                        {type === "admins" ? <ShieldCheck size={18} /> : <Users size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        {type === "vendors" && <p className="text-[9px] font-mono text-gray-400 uppercase">{user.companyName || "Independent"}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    <p className="text-[10px] text-gray-400">{user.number || "No phone"}</p>
                  </td>
                  {type === "vendors" && (
                    <td className="px-8 py-4">
                      {editingCategoryFor === user._id ? (
                        <select autoFocus defaultValue={user.vendorCategory || "Other"}
                          onBlur={e => { if (e.target.value !== user.vendorCategory) handleCategoryChange(user._id, e.target.value); else setEditingCategoryFor(null); }}
                          onChange={e => handleCategoryChange(user._id, e.target.value)}
                          className="text-[10px] font-black bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black">
                          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                        </select>
                      ) : (
                        <button onClick={() => setEditingCategoryFor(user._id)} title="Click to edit category"
                          className="group/cat flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all">
                          <span className="text-[10px] font-black" style={{ color: CATEGORY_COLORS[user.vendorCategory] || "#6b7280" }}>
                            {CATEGORY_EMOJIS[user.vendorCategory] || "🏪"} {user.vendorCategory || "Other"}
                          </span>
                          <Edit size={10} className="opacity-0 group-hover/cat:opacity-100 text-gray-400 transition-opacity" />
                        </button>
                      )}
                    </td>
                  )}
                  {type === "vendors" && (
                    <td className="px-8 py-4">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border",
                        user.isApproved ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100")}>
                        {user.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                  )}
                  <td className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase hidden sm:table-cell">
                    {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "N/A"}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {type === "vendors" && (
                        <button onClick={() => toggleApprovalStatus(user._id, !user.isApproved)}
                          className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-gray-100 text-gray-400 hover:text-black transition-colors">
                          {user.isApproved ? <X size={16} /> : <Check size={16} />}
                        </button>
                      )}
                      <button onClick={() => { setViewingUser(user); setIsViewModalOpen(true); }}
                        className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-gray-100 text-gray-400 hover:text-blue-500 transition-colors"><Eye size={16} /></button>
                      <button onClick={() => { setEditingUser(user); setCreatingUserType(type === "vendors" ? "Vendor" : type === "admins" ? "Admin" : "Customer"); setIsCreateModalOpen(true); }}
                        className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-gray-100 text-gray-400 hover:text-emerald-500 transition-colors"><Edit size={16} /></button>
                      <button onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }}
                        className="p-2.5 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">No {type} found.</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────
export default function AdminDashboardContent({
  currentPage, users, setUsers, loading, error,
  analytics, analyticsLoading, onRefreshAnalytics,
  searchTerm, setSearchTerm,
  isCreateModalOpen, setIsCreateModalOpen,
  creatingUserType, setCreatingUserType,
  isViewModalOpen, setIsViewModalOpen,
  viewingUser, setViewingUser,
  editingUser, setEditingUser,
  isDeleteModalOpen, setIsDeleteModalOpen,
  userToDelete, setUserToDelete,
  createUser, handleDeleteUser, toggleApprovalStatus,
}) {
  const handleCategoryUpdate = (userId, newCategory) => {
    if (setUsers) setUsers(prev => prev.map(u => u._id === userId ? { ...u, vendorCategory: newCategory } : u));
  };

  const registryProps = {
    users, searchTerm, setSearchTerm,
    setCreatingUserType, setEditingUser, setIsCreateModalOpen,
    setViewingUser, setIsViewModalOpen,
    setUserToDelete, setIsDeleteModalOpen,
    toggleApprovalStatus, onCategoryUpdate: handleCategoryUpdate,
  };

  return (
    <div className="flex-1 overflow-y-auto relative scroll-smooth bg-[#FBFBFB] pt-20 lg:pt-0 pb-28 lg:pb-0">
      <div className="absolute top-0 right-0 w-full lg:w-[600px] h-[400px] lg:h-[600px] bg-gray-100/30 blur-[80px] lg:blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={currentPage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {currentPage === "dashboard" && <OverviewPage users={users} loading={loading} error={error} analytics={analytics} />}
            {currentPage === "analytics" && <AnalyticsPage analytics={analytics} loading={analyticsLoading} onRefresh={onRefreshAnalytics} />}
            {currentPage === "vendors" && <DataRegistry type="vendors" title="Vendor Management" {...registryProps} />}
            {currentPage === "customers" && <DataRegistry type="customers" title="Customer Directory" {...registryProps} />}
            {currentPage === "admins" && <DataRegistry type="admins" title="Admin Governance" {...registryProps} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isViewModalOpen && <ViewUserModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} user={viewingUser} />}
        {isCreateModalOpen && (
          <CreateUserModal isOpen={isCreateModalOpen}
            onClose={() => { setIsCreateModalOpen(false); setEditingUser(null); }}
            onCreate={createUser} userType={creatingUserType} editingUser={editingUser} />
        )}
        {isDeleteModalOpen && (
          <DeleteConfirmModal isOpen={isDeleteModalOpen}
            onClose={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
            onConfirm={handleDeleteUser} entityName={userToDelete?.name} />
        )}
      </AnimatePresence>
    </div>
  );
}
