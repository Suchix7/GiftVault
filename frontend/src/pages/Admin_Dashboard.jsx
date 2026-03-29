"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";
import LogoutButton from "@/components/LogoutButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  Users,
  ShieldCheck,
  TrendingUp,
  Activity,
  Check,
  Gift,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- UTILITY ---
// Replace this with your actual cn utility or just use template literals if you don't have it
const cn = (...classes) => classes.filter(Boolean).join(" ");

// ==========================================
// SUB-COMPONENTS: MODALS & CARDS
// ==========================================

const StatCard = ({ title, value, sub, icon: Icon, trend }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between group transition-all hover:shadow-xl hover:shadow-black/5"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-colors duration-500">
        <Icon size={20} />
      </div>
      {trend && (
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
          ACTIVE
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        {title}
      </p>
      <h3 className="text-3xl font-black tracking-tighter text-gray-900 mt-1">
        {value}
      </h3>
      <p className="text-[10px] font-medium text-gray-400 mt-2">{sub}</p>
    </div>
  </motion.div>
);

const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl"
      >
        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8 sm:hidden" />

        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tighter">
              Identity Card
            </h2>
            <p className="text-[10px] font-mono text-gray-400 uppercase mt-1">
              UID: {user._id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Full Name", val: user.name },
                { label: "Email Hash", val: user.email },
                { label: "Corporate Entity", val: user.companyName || "N/A" },
                { label: "Authorized Phone", val: user.number || "Not synced" },
              ].map((item, i) => (
                <div key={i} className="break-words">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-gray-900">{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Role Classification
              </p>
              <span className="text-xs font-bold uppercase bg-black text-white px-3 py-1 rounded-full">
                {user.role}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Protocol Status
              </p>
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  user.isApproved ? "text-emerald-600" : "text-amber-600",
                )}
              >
                {user.isApproved ? "Verified" : "Pending Sync"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
        >
          Close Identity File
        </button>
      </motion.div>
    </div>
  );
};

const CreateUserModal = ({
  isOpen,
  onClose,
  onCreate,
  userType,
  editingUser,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    number: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        companyName: editingUser.companyName || "",
        number: editingUser.number || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        companyName: "",
        number: "",
      });
    }
  }, [editingUser, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData);
      onClose();
      toast.success(
        editingUser
          ? "Entity Modified Successfully"
          : "Entity Provisioned Successfully",
      );
    } catch (error) {
      toast.error(error.message || "Failed to process entity");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6 sm:hidden" />

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tighter">
            {editingUser ? "Modify Entity" : `Provision ${userType}`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Entity Name
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-50 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Email Hash
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-50 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Security Key {editingUser && "(Leave blank to keep)"}
            </label>
            <input
              required={!editingUser}
              minLength={editingUser ? 0 : 6}
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {userType === "Vendor" && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Corporate Org
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-50 outline-none transition-all"
                />
              </div>
            )}
            <div className="space-y-2 flex-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Auth Phone
              </label>
              <input
                type="tel"
                name="number"
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
                className="w-full h-14 px-5 bg-gray-50 rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/20 hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              {loading ? "Processing..." : "Commit Entity"}
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
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Trash2 size={32} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-2">
          Terminate Node?
        </h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
          You are about to permanently purge{" "}
          <span className="text-black font-bold">"{entityName}"</span>. This
          protocol cannot be reversed.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
          >
            Confirm Purge
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all"
          >
            Cancel Protocol
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// DASHBOARD & LIST VIEWS
// ==========================================

function UserList({ users, loading, error }) {
  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin mr-3" />{" "}
        Syncing Ledger...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 font-bold p-8">
        Protocol Interrupted: Cannot fetch ledger.
      </div>
    );

  const totalRegularUsers = users.filter((u) => u.role === "user").length;
  const totalVendors = users.filter((u) => u.role === "vendor").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const approvedVendors = users.filter(
    (u) => u.role === "vendor" && u.isApproved,
  ).length;
  const unapprovedVendors = totalVendors - approvedVendors;

  const userDistributionData = [
    { name: "Customers", value: totalRegularUsers, color: "#2563eb" },
    { name: "Vendors", value: totalVendors, color: "#10b981" },
    { name: "Admins", value: totalAdmins, color: "#000000" },
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
            Overview
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            System-wide biometric and commercial metrics.
          </p>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-full">
          {format(new Date(), "MMMM dd, yyyy")}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Global Vendors"
          value={totalVendors}
          sub={`${approvedVendors} Verified / ${unapprovedVendors} Pending`}
          icon={Users}
          trend
        />
        <StatCard
          title="Platform Customers"
          value={totalRegularUsers}
          sub="Wallet Holders"
          icon={Activity}
        />
        <StatCard
          title="Root Admins"
          value={totalAdmins}
          sub="Security Clearance"
          icon={ShieldCheck}
        />
        <StatCard
          title="Total Network"
          value={users.length}
          sub="Synchronized Nodes"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400">
            Node Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400">
            Vendor Verification
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Approved", value: approvedVendors },
                  { name: "Pending", value: unapprovedVendors },
                ]}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  fontWeight="bold"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  fontWeight="bold"
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT EXPORT
// ==========================================

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingUserType, setCreatingUserType] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    axios
      .get("/users")
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        toast.error("Ledger Sync Failure");
        setLoading(false);
      });
  };

  const createUser = async (userData) => {
    try {
      let role =
        creatingUserType === "Vendor"
          ? "vendor"
          : creatingUserType === "Admin"
            ? "admin"
            : "user";

      if (editingUser) {
        if (!userData.name || !userData.email)
          throw new Error("Name and email are required");
        const updateData = { ...userData };
        if (!updateData.password || updateData.password.trim() === "")
          delete updateData.password;

        const res = await axios.patch(`/users/${editingUser._id}`, updateData, {
          withCredentials: true,
        });
        setUsers(
          users.map((user) =>
            user._id === editingUser._id ? res.data.user : user,
          ),
        );
      } else {
        if (!userData.name || !userData.email || !userData.password)
          throw new Error("All fields required");
        const res = await axios.post("/users", {
          ...userData,
          role,
          isApproved: creatingUserType === "Vendor" ? false : true,
        });
        setUsers([...users, res.data]);
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to process entity",
      );
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`/users/${userToDelete._id}`);
      setUsers(users.filter((user) => user._id !== userToDelete._id));
      toast.success("Entity Purged Successfully");
    } catch (error) {
      toast.error("Error Purging Entity");
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const toggleApprovalStatus = async (vendorId, newStatus) => {
    try {
      await axios.patch(`/users/approve/${vendorId}`, {
        isApproved: newStatus,
      });
      setUsers(
        users.map((u) =>
          u._id === vendorId ? { ...u, isApproved: newStatus } : u,
        ),
      );
      toast.success(newStatus ? "Entity Authorized" : "Entity Restricted");
    } catch (err) {
      toast.error("Approval Override Failed");
    }
  };

  const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "vendors", label: "Vendors", icon: Users },
    { id: "customers", label: "Customers", icon: Users },
    { id: "admins", label: "Admins", icon: ShieldCheck },
  ];

  // --- Dynamic Table View ---
  const DataRegistry = ({ type, title }) => {
    const roleMap = { vendors: "vendor", customers: "user", admins: "admin" };
    const filtered = users
      .filter((u) => u.role === roleMap[type])
      .filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    return (
      <div className="space-y-8 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
              {title}
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Registry of all authorized {type}.
            </p>
          </div>
          <button
            onClick={() => {
              setCreatingUserType(
                type === "vendors"
                  ? "Vendor"
                  : type === "admins"
                    ? "Admin"
                    : "Customer",
              );
              setEditingUser(null);
              setIsCreateModalOpen(true);
            }}
            className="w-full md:w-auto bg-black text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Forge {type.slice(0, -1)}
          </button>
        </div>

        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
          <input
            placeholder={`Search ${type} by name or email...`}
            className="pl-11 pr-4 py-3.5 w-full bg-white border border-gray-100 rounded-[1.2rem] focus:ring-4 focus:ring-gray-50 outline-none text-sm font-medium transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50/50">
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-8 py-5 text-left">Identity</th>
                  <th className="px-8 py-5 text-left">Contact Matrix</th>
                  {type === "vendors" && (
                    <th className="px-8 py-5 text-left">Clearance</th>
                  )}
                  <th className="px-8 py-5 text-left hidden sm:table-cell">
                    Genesis Date
                  </th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user) => (
                  <tr
                    key={user._id}
                    className="group hover:bg-gray-50/30 transition-all"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors duration-500 shrink-0">
                          {type === "admins" ? (
                            <ShieldCheck size={18} />
                          ) : (
                            <Users size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {user.name}
                          </p>
                          {type === "vendors" && (
                            <p className="text-[9px] font-mono text-gray-400 uppercase leading-none truncate">
                              {user.companyName || "Independent"}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {user.number || "No Phone"}
                      </p>
                    </td>
                    {type === "vendors" && (
                      <td className="px-8 py-4">
                        <span
                          className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border",
                            user.isApproved
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100",
                          )}
                        >
                          {user.isApproved ? "Verified" : "Pending"}
                        </span>
                      </td>
                    )}
                    <td className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase hidden sm:table-cell">
                      {user.createdAt
                        ? format(new Date(user.createdAt), "MMM dd, yyyy")
                        : "N/A"}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-100 transition-opacity">
                        {type === "vendors" && (
                          <button
                            onClick={() =>
                              toggleApprovalStatus(user._id, !user.isApproved)
                            }
                            className="p-2.5 hover:bg-white rounded-xl shadow-none hover:shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-black"
                          >
                            {user.isApproved ? (
                              <X size={16} />
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setViewingUser(user);
                            setIsViewModalOpen(true);
                          }}
                          className="p-2.5 hover:bg-white rounded-xl shadow-none hover:shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setCreatingUserType(
                              type === "vendors"
                                ? "Vendor"
                                : type === "admins"
                                  ? "Admin"
                                  : "Customer",
                            );
                            setIsCreateModalOpen(true);
                          }}
                          className="p-2.5 hover:bg-white rounded-xl shadow-none hover:shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-emerald-500 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2.5 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                No {type} found in registry.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#FBFBFB] text-[#1D1D1F] font-sans selection:bg-black selection:text-white overflow-hidden relative">
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:flex w-64 border-r border-gray-100 bg-white flex-col z-50 shrink-0">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-black p-2 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">
              AdminVault
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setSearchTerm("");
              }}
              className={cn(
                "relative flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all rounded-2xl group",
                currentPage === item.id
                  ? "text-black"
                  : "text-gray-400 hover:text-gray-900",
              )}
            >
              {currentPage === item.id && (
                <motion.div
                  layoutId="admin-nav"
                  className="absolute inset-0 bg-gray-50 rounded-2xl -z-10 border border-gray-100"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon size={18} /> {item.label}
              {currentPage === item.id && (
                <div className="ml-auto w-1 h-1 bg-black rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-gray-50">
          <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100 mb-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Session Active
            </p>
            <p className="text-xs font-bold text-gray-900 truncate uppercase tracking-tighter">
              Root Admin
            </p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* --- Mobile Top Header --- */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 flex items-center justify-between px-6 font-black uppercase tracking-tighter">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} />
          <span>AdminVault</span>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth bg-[#FBFBFB] pt-20 lg:pt-0 pb-28 lg:pb-0">
        <div className="absolute top-0 right-0 w-full lg:w-[600px] h-[400px] lg:h-[600px] bg-gray-100/30 blur-[80px] lg:blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {currentPage === "dashboard" && (
                <UserList users={users} loading={loading} error={error} />
              )}
              {currentPage === "vendors" && (
                <DataRegistry type="vendors" title="Vendor Management" />
              )}
              {currentPage === "customers" && (
                <DataRegistry type="customers" title="Customer Directory" />
              )}
              {currentPage === "admins" && (
                <DataRegistry type="admins" title="Admin Governance" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* --- Mobile Bottom Nav Bar --- */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setSearchTerm("");
              }}
              className="relative flex flex-col items-center justify-center w-12 h-12 transition-all"
            >
              <span
                className={isActive ? "text-black scale-110" : "text-gray-400"}
              >
                {React.createElement(item.icon, { size: 20 })}
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

      {/* --- Modal Container System --- */}
      <AnimatePresence>
        {isViewModalOpen && (
          <ViewUserModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            user={viewingUser}
          />
        )}
        {isCreateModalOpen && (
          <CreateUserModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setEditingUser(null);
            }}
            onCreate={createUser}
            userType={creatingUserType}
            editingUser={editingUser}
          />
        )}
        {isDeleteModalOpen && (
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setUserToDelete(null);
            }}
            onConfirm={handleDeleteUser}
            entityName={userToDelete?.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
