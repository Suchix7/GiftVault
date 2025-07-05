"use client";

import { useState, useEffect, useMemo } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import {
  LayoutDashboard,
  Gift,
  Share2,
  BarChart3,
  SettingsIcon,
  LogOut,
  Upload,
  MoreHorizontal,
  Search,
  List,
  GridIcon,
  Ticket,
  Edit,
  Clock,
  Users,
  Percent,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import api from "@/api/axios";
import LogoutButton from "@/components/LogoutButton";
import voucherService from "@/api/vouchers";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const StatusBadge = ({ status }) => {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    expired: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Vendor_Dashboard = () => {
  // Navigation state
  const [currentPage, setCurrentPage] = useState(() => {
    // Get the saved page from localStorage on initial render
    return localStorage.getItem("currentPage") || "dashboard";
  });
  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  // Voucher state
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New voucher form state
  const [newVoucher, setNewVoucher] = useState({
    name: "",
    value: "",
    description: "",
    campaign: "",
    expiryDate: "",
    color: "#000000",
  });

  const [previewLogo, setPreviewLogo] = useState(null);

  // Navigation items
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    { id: "vouchers", label: "Vouchers", icon: <Gift className="h-5 w-5" /> },
    { id: "redeem", label: "Redeem", icon: <Ticket className="h-5 w-5" /> },
    // Commenting out distribution tab for now
    // {
    //   id: "distribution",
    //   label: "Distribution",
    //   icon: <Share2 className="h-5 w-5" />,
    // },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <SettingsIcon className="h-5 w-5" />,
    },
  ];

  // State for modals and selected voucher
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [voucherCreated, setVoucherCreated] = useState(false);

  // Add new state for redeem form
  const [redeemForm, setRedeemForm] = useState({
    email: "",
    code: "",
  });

  // Add new state for redeem loading
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Load vouchers with optimized loading state
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Add timeout to show loading state for better UX
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(resolve, 500)
        );
        const vouchersPromise = voucherService.getVouchers();

        // Wait for both minimum loading time and data
        const [_, data] = await Promise.all([timeoutPromise, vouchersPromise]);

        if (!data) {
          throw new Error("No data received from server");
        }

        setVouchers(Array.isArray(data) ? data : []);

        // Cache the vouchers in localStorage for faster initial load
        localStorage.setItem("cachedVouchers", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to load vouchers:", err);
        setError("Failed to load vouchers. Please try again later.");

        // Try to load from cache if network request fails
        const cachedData = localStorage.getItem("cachedVouchers");
        if (cachedData) {
          setVouchers(JSON.parse(cachedData));
        } else {
          setVouchers([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Try to show cached data immediately while loading fresh data
    const cachedData = localStorage.getItem("cachedVouchers");
    if (cachedData) {
      setVouchers(JSON.parse(cachedData));
    }

    loadVouchers();
  }, [voucherCreated]);

  // Filter vouchers
  const filteredVouchers = useMemo(() => {
    if (!Array.isArray(vouchers)) return [];

    return vouchers.filter((voucher) => {
      if (!voucher) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        voucher.name?.toLowerCase().includes(searchLower) ||
        voucher._id?.toLowerCase().includes(searchLower)
      );
    });
  }, [vouchers, searchTerm]);

  // View Voucher Details
  const handleViewVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setIsViewModalOpen(true);
  };

  // Edit Voucher
  const handleEditVoucher = (voucher) => {
    setSelectedVoucher({
      ...voucher,
      expiryDate: format(new Date(voucher.expiryDate), "yyyy-MM-dd'T'HH:mm"),
    });
    setIsEditModalOpen(true);
  };

  // Delete Voucher
  const handleDeleteVoucher = async () => {
    setIsLoading(true);
    try {
      await voucherService.deleteVoucher(selectedVoucher._id);
      setVouchers(vouchers.filter((v) => v._id !== selectedVoucher._id));
      toast.success("Voucher deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete voucher");
      console.error("Delete error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Optimize update voucher function
  const handleUpdateVoucher = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Show immediate feedback
    toast.loading("Updating voucher...");

    try {
      const updatedVoucher = {
        ...selectedVoucher,
        value: Number(selectedVoucher.value),
        expiryDate: new Date(selectedVoucher.expiryDate),
      };

      const response = await voucherService.updateVoucher(
        selectedVoucher._id,
        updatedVoucher
      );

      // Update local state immediately for better UX
      const updated = response.data || updatedVoucher;
      setVouchers((prev) =>
        prev.map((v) => (v._id === selectedVoucher._id ? updated : v))
      );

      // Update cache
      const cachedData = localStorage.getItem("cachedVouchers");
      if (cachedData) {
        const cached = JSON.parse(cachedData);
        localStorage.setItem(
          "cachedVouchers",
          JSON.stringify(
            cached.map((v) => (v._id === selectedVoucher._id ? updated : v))
          )
        );
      }

      toast.dismiss();
      toast.success("Voucher updated successfully");
      setIsEditModalOpen(false);
      setSelectedVoucher(null);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to update voucher");
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!newVoucher.name || !newVoucher.value || !newVoucher.expiryDate) {
        toast.error("Please fill in all required fields!");
        return;
      }

      const voucherData = {
        ...newVoucher,
        value: Number(newVoucher.value),
        expiryDate: new Date(newVoucher.expiryDate),
        status: "draft",
        logo: previewLogo,
      };

      const response = await voucherService.createVoucher(voucherData);
      // The response is the voucher object directly
      setVouchers((prevVouchers) => [...prevVouchers, response]);
      setVoucherCreated((prev) => !prev);
      toast.success("Voucher created successfully");

      // Reset form
      setNewVoucher({
        name: "",
        value: "",
        description: "",
        campaign: "",
        expiryDate: "",
        color: "#000000",
      });
      setPreviewLogo(null);

      setCurrentPage("vouchers");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create voucher");
      console.error("Create voucher error:", error);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add handleRedeem function
  const handleRedeem = async (e) => {
    e.preventDefault();
    setIsRedeeming(true);
    try {
      // First find the voucher by code
      const findVoucherResponse = await voucherService.findVoucherByCode(
        redeemForm.code
      );

      if (!findVoucherResponse.success) {
        toast.error(findVoucherResponse.message || "Failed to find voucher");
        return;
      }

      // Now complete the redemption with the voucher ID
      const response = await voucherService.completeRedemption({
        customerEmail: redeemForm.email,
        voucherCode: redeemForm.code,
        voucherId: findVoucherResponse.voucher._id,
      });

      if (response.success) {
        toast.success(response.message || "Voucher redeemed successfully!");
        setRedeemForm({ email: "", code: "" });

        // Refresh vouchers list to show updated status
        const updatedVouchers = await voucherService.getVouchers();
        setVouchers(updatedVouchers);
      } else {
        toast.error(response.message || "Failed to redeem voucher");
      }
    } catch (error) {
      console.error("Redemption error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to redeem voucher"
      );
    } finally {
      setIsRedeeming(false);
    }
  };

  const renderCreateVoucherContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Create New Voucher</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleCreateVoucher} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Voucher Name
                </label>
                <input
                  id="name"
                  value={newVoucher.name}
                  onChange={(e) =>
                    setNewVoucher({ ...newVoucher, name: e.target.value })
                  }
                  placeholder="Holiday Special $50"
                  className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="value"
                  className="block text-sm font-medium mb-1"
                >
                  Value (Rs.)
                </label>
                <input
                  id="value"
                  type="number"
                  min="10"
                  max="100000"
                  value={newVoucher.value}
                  onChange={(e) =>
                    setNewVoucher({ ...newVoucher, value: e.target.value })
                  }
                  placeholder="50"
                  className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={newVoucher.description}
                  onChange={(e) =>
                    setNewVoucher({
                      ...newVoucher,
                      description: e.target.value,
                    })
                  }
                  placeholder="Special holiday gift voucher"
                  className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>

              <div>
                <label
                  htmlFor="campaign"
                  className="block text-sm font-medium mb-1"
                >
                  Campaign (Optional)
                </label>
                <select
                  id="campaign"
                  value={newVoucher.campaign}
                  onChange={(e) =>
                    setNewVoucher({ ...newVoucher, campaign: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a campaign</option>
                  <option value="holiday">Holiday Campaign</option>
                  <option value="birthday">Birthday Rewards</option>
                  <option value="welcome">Welcome Bonus</option>
                  <option value="loyalty">Loyalty Program</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="expiry"
                  className="block text-sm font-medium mb-1"
                >
                  Expiry Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="expiry"
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      setNewVoucher({ ...newVoucher, expiryDate: date });
                    }}
                    className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="logo"
                  className="block text-sm font-medium mb-1"
                >
                  Custom Logo (Optional)
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-background border rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring flex items-center gap-2"
                    onClick={() =>
                      document.getElementById("logo-upload").click()
                    }
                  >
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {previewLogo && (
                    <div className="h-10 w-10 rounded-md overflow-hidden border">
                      <img
                        src={previewLogo}
                        alt="Logo preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="color"
                  className="block text-sm font-medium mb-1"
                >
                  Voucher Color
                </label>
                <div className="flex gap-4 mt-2">
                  <input
                    id="color"
                    type="color"
                    value={newVoucher.color}
                    onChange={(e) =>
                      setNewVoucher({ ...newVoucher, color: e.target.value })
                    }
                    className="w-12 h-10 p-1 bg-transparent border-0"
                  />
                  <input
                    value={newVoucher.color}
                    onChange={(e) =>
                      setNewVoucher({ ...newVoucher, color: e.target.value })
                    }
                    placeholder="#1e293b"
                    className="flex-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Create Voucher
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 bg-transparent border text-foreground rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={() => {
                  setCurrentPage("vouchers");
                  setActiveTab("active");
                }}
              >
                Cancel
              </button>
            </div>
          </form>

          <div>
            <h2 className="text-lg font-medium mb-4">Voucher Preview</h2>
            <div
              className="w-full rounded-lg overflow-hidden"
              style={{ backgroundColor: newVoucher.color }}
            >
              <div className="p-6">
                <div className="bg-black/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
                  {previewLogo && (
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-white/90 p-2">
                        <img
                          src={previewLogo}
                          alt="Vendor logo"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold text-white">
                      {newVoucher.name || "Voucher Name"}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {newVoucher.description ||
                        "Voucher description will appear here"}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white font-bold text-2xl">
                      Rs.{newVoucher.value || "0"}
                    </div>
                  </div>

                  {newVoucher.expiryDate && (
                    <div className="text-center text-white/80 text-sm">
                      Valid until{" "}
                      {format(newVoucher.expiryDate, "MMMM dd, yyyy")}
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/20 text-center">
                    <p className="text-white/80 text-xs">
                      Scan or present this voucher at checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add loading skeleton for vouchers list
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

  const renderVouchersContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Vouchers</h1>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            onClick={() => {
              setCurrentPage("createVoucher");
              setActiveTab("createVoucher");
            }}
          >
            Create New Voucher
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                  viewMode === "list" ? "bg-accent" : "bg-transparent"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </button>
              <button
                className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                  viewMode === "grid" ? "bg-accent" : "bg-transparent"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <GridIcon className="h-4 w-4" />
                <span>Grid</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => {
                  localStorage.removeItem("cachedVouchers");
                  window.location.reload();
                }}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Retry Loading
              </button>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No vouchers match your search criteria"
                  : "No vouchers found. Create your first voucher!"}
              </p>
            </div>
          ) : viewMode === "list" ? (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Voucher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Expiry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Redeemed
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y">
                  {filteredVouchers.map((voucher) => (
                    <tr key={voucher._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{voucher.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {voucher._id}
                          </div>
                          {voucher.decryptedCode && (
                            <div className="text-sm text-blue-600 font-mono mt-1">
                              Code: {voucher.decryptedCode}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">
                            {voucher.vendor?.name || "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {voucher.vendor?.email || ""}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        Rs.{voucher.value.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={voucher.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(
                          new Date(voucher.createdAt),
                          "MM/dd/yyyy hh:mm a"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(
                          new Date(voucher.expiryDate),
                          "MM/dd/yyyy hh:mm a"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">
                            Redeemed:
                          </span>
                          <span className="font-medium">
                            {voucher.redeemedCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewVoucher(voucher)}
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <FaEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditVoucher(voucher)}
                            className="text-green-400 hover:text-green-600 transition-colors"
                            title="Edit"
                          >
                            <FaEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVoucher(voucher);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVouchers.map((voucher) => (
                <div
                  key={voucher._id}
                  className="border rounded-md p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{voucher.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {voucher._id}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        By: {voucher.vendor?.name || "N/A"}
                      </p>
                      {voucher.decryptedCode && (
                        <p className="text-sm text-blue-600 font-mono mt-1">
                          Code: {voucher.decryptedCode}
                        </p>
                      )}
                    </div>
                    <div>
                      <StatusBadge status={voucher.status} />
                    </div>
                  </div>
                  <div className="text-xl font-bold">
                    Rs. {voucher.value.toFixed(2)}
                  </div>
                  <div className="grid grid-cols-2 text-sm gap-2">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>
                        {format(
                          new Date(voucher.createdAt),
                          "MM/dd/yyyy hh:mm a"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expires</p>
                      <p>
                        {format(
                          new Date(voucher.expiryDate),
                          "MM/dd/yyyy hh:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewVoucher(voucher)}
                      className="text-blue-400 hover:text-blue-600 transition-colors"
                      title="View"
                    >
                      <FaEye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditVoucher(voucher)}
                      className="text-green-400 hover:text-green-600 transition-colors"
                      title="Edit"
                    >
                      <FaEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVoucher(voucher);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <FaTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Modal */}
        {isViewModalOpen && selectedVoucher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedVoucher.name}</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Voucher ID</p>
                  <p className="font-mono text-sm">{selectedVoucher._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <p className="font-medium">
                    {selectedVoucher.vendor?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedVoucher.vendor?.email || ""}
                  </p>
                </div>
                {selectedVoucher.decryptedCode && (
                  <div>
                    <p className="text-sm text-gray-500">Decrypted Code</p>
                    <p className="font-mono text-blue-600">
                      {selectedVoucher.decryptedCode}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Value</p>
                  <p>${selectedVoucher.value.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={selectedVoucher.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p>{selectedVoucher.description || "No description"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Campaign</p>
                  <p>{selectedVoucher.campaign || "No campaign"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p>
                    {format(
                      new Date(selectedVoucher.createdAt),
                      "MM/dd/yyyy hh:mm a"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expires</p>
                  <p>
                    {format(
                      new Date(selectedVoucher.expiryDate),
                      "MM/dd/yyyy hh:mm a"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Usage</p>
                  <p>
                    Redeemed:{" "}
                    <span className="font-medium">
                      {selectedVoucher.redeemedCount || 0}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedVoucher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Voucher</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleUpdateVoucher}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={selectedVoucher.name}
                      onChange={(e) =>
                        setSelectedVoucher({
                          ...selectedVoucher,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Value (Rs.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedVoucher.value}
                      onChange={(e) =>
                        setSelectedVoucher({
                          ...selectedVoucher,
                          value: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedVoucher.description || ""}
                      onChange={(e) =>
                        setSelectedVoucher({
                          ...selectedVoucher,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Campaign
                    </label>
                    <input
                      type="text"
                      value={selectedVoucher.campaign || ""}
                      onChange={(e) =>
                        setSelectedVoucher({
                          ...selectedVoucher,
                          campaign: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={selectedVoucher.status}
                      onChange={(e) =>
                        setSelectedVoucher({
                          ...selectedVoucher,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      value={format(
                        new Date(selectedVoucher.expiryDate),
                        "yyyy-MM-dd'T'HH:mm"
                      )}
                      onChange={(e) =>
                        setSelectedVoucher({
                          ...selectedVoucher,
                          expiryDate: new Date(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedVoucher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Delete Voucher</h2>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <p className="mb-6">
                Are you sure you want to delete the voucher{" "}
                <strong>"{selectedVoucher.name}"</strong>? This action cannot be
                undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVoucher}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add renderRedeemContent function
  const renderRedeemContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Redeem Voucher</h1>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Customer Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={redeemForm.email}
                  onChange={(e) =>
                    setRedeemForm({ ...redeemForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="customer@example.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium mb-1"
                >
                  Voucher Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={redeemForm.code}
                  onChange={(e) =>
                    setRedeemForm({ ...redeemForm, code: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring uppercase"
                  placeholder="Enter voucher code"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isRedeeming}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRedeeming ? "Redeeming..." : "Verify & Redeem"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Add animation variants
  const pageTransition = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  };

  // Update renderDashboardContent
  const renderDashboardContent = () => {
    return (
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={pageTransition}
      >
        <div className="flex justify-between items-center">
          <motion.h1
            className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            variants={cardVariants}
          >
            Vendor Dashboard
          </motion.h1>
          <motion.button
            variants={cardVariants}
            whileHover="hover"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            onClick={() => {
              setCurrentPage("createVoucher");
              setActiveTab("createVoucher");
            }}
          >
            Create New Voucher
          </motion.button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading vouchers...</p>
          </div>
        ) : error ? (
          <motion.div
            className="text-center py-8 text-red-500"
            variants={cardVariants}
          >
            <p>{error}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-lg border border-green-200 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Gift className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">
                    Active Vouchers
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {vouchers.filter((v) => v?.status === "active").length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-6 rounded-lg border border-yellow-200 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <Edit className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium text-yellow-800">
                    Draft Vouchers
                  </h3>
                  <p className="text-3xl font-bold text-yellow-600">
                    {vouchers.filter((v) => v?.status === "draft").length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-red-50 to-red-100/50 p-6 rounded-lg border border-red-200 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-red-800">Expired Vouchers</h3>
                  <p className="text-3xl font-bold text-red-600">
                    {vouchers.filter((v) => v?.status === "expired").length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <motion.div
          variants={cardVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
        >
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {vouchers.slice(0, 5).map((voucher) => (
                <motion.div
                  key={voucher._id}
                  variants={cardVariants}
                  whileHover="hover"
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{voucher.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Created{" "}
                        {format(new Date(voucher.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={voucher.status} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-bold">
                  Rs.
                  {vouchers
                    .reduce((acc, v) => acc + (v?.value || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="text-muted-foreground">Total Redeemed</span>
                <span className="font-bold">
                  {vouchers.reduce(
                    (acc, v) => acc + (v?.redeemedCount || 0),
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="text-muted-foreground">Average Value</span>
                <span className="font-bold">
                  Rs.
                  {(
                    vouchers.reduce((acc, v) => acc + (v?.value || 0), 0) /
                    (vouchers.length || 1)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Update renderDistributionContent
  const renderDistributionContent = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Distribution</h1>
        <div className="border-b">
          <div className="flex space-x-1">
            <button
              className={`px-4 py-2 ${
                activeTab === "send"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("send")}
            >
              Send
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "history"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </div>
        </div>
        <div className="p-4 bg-card rounded-lg">
          <h2 className="text-xl font-bold">
            {activeTab === "send" && "Send Vouchers"}
            {activeTab === "history" && "Distribution History"}
          </h2>
          <p className="text-muted-foreground">
            {activeTab === "send"
              ? "Select vouchers to send to your customers"
              : "View your voucher distribution history"}
          </p>
        </div>
      </div>
    );
  };

  // Update renderAnalyticsContent
  const renderAnalyticsContent = () => {
    return (
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={pageTransition}
      >
        <motion.h1
          className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          variants={cardVariants}
        >
          Analytics
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-card border rounded-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  Rs.
                  {vouchers
                    .reduce(
                      (acc, v) =>
                        acc + (v?.redeemedCount || 0) * (v?.value || 0),
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-card border rounded-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">
                  {
                    new Set(
                      vouchers.flatMap(
                        (v) => v.redemptions?.map((r) => r.userId) || []
                      )
                    ).size
                  }
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-card border rounded-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Vouchers</p>
                <p className="text-2xl font-bold">
                  {vouchers.filter((v) => v?.status === "active").length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-card border rounded-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Percent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Redemption Rate</p>
                <p className="text-2xl font-bold">
                  {(
                    (vouchers.reduce(
                      (acc, v) => acc + (v?.redeemedCount || 0),
                      0
                    ) /
                      vouchers.reduce(
                        (acc, v) => acc + (v?.sentCount || 0),
                        0
                      )) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            variants={cardVariants}
            className="bg-card border rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-6">Redemption Timeline</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vouchers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="redeemedCount"
                    fill="#2563eb"
                    name="Redemptions"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="bg-card border rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-6">Status Distribution</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Active",
                        value: vouchers.filter((v) => v?.status === "active")
                          .length,
                      },
                      {
                        name: "Draft",
                        value: vouchers.filter((v) => v?.status === "draft")
                          .length,
                      },
                      {
                        name: "Expired",
                        value: vouchers.filter((v) => v?.status === "expired")
                          .length,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vouchers.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#2563eb", "#eab308", "#ef4444"][index % 3]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Update renderSettingsContent
  const renderSettingsContent = () => {
    return (
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={pageTransition}
      >
        <motion.h1
          className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          variants={cardVariants}
        >
          Settings
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-card border rounded-lg p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold">Account Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full mt-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full mt-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Save Changes
                </button>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-card border rounded-lg p-6 space-y-6 mt-6"
            >
              <h2 className="text-xl font-semibold">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your vouchers
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Redemption Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when vouchers are redeemed
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Receive marketing tips and updates
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-card border rounded-lg p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold">Account Status</h2>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Active</p>
                  <p className="text-xs text-green-600">
                    Your account is in good standing
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </p>
                  <p className="text-lg">January 2024</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Subscription Plan
                  </p>
                  <p className="text-lg">Business Pro</p>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-white hover:bg-destructive/90">
                  Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return renderDashboardContent();
      case "createVoucher":
        return renderCreateVoucherContent();
      case "vouchers":
        return renderVouchersContent();
      case "redeem":
        return renderRedeemContent();
      case "distribution":
        return renderDistributionContent();
      case "analytics":
        return renderAnalyticsContent();
      case "settings":
        return renderSettingsContent();
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-56 bg-muted/50 flex flex-col h-full border-r">
        <div className="p-4 flex items-center gap-2 border-b">
          <div className="bg-primary rounded-md p-1">
            <Gift className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">GiftVault</h1>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setCurrentPage(item.id);
                    // Reset to first tab when changing pages
                    if (item.id === "dashboard") setActiveTab("overview");
                    if (item.id === "vouchers") setActiveTab("active");
                    if (item.id === "distribution") setActiveTab("send");
                    if (item.id === "settings") setActiveTab("general");
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-2 text-sm ${
                    currentPage === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <div className="mt-auto">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {currentPage === "dashboard" && renderDashboardContent()}
        {currentPage === "createVoucher" && renderCreateVoucherContent()}
        {currentPage === "vouchers" && renderVouchersContent()}
        {currentPage === "redeem" && renderRedeemContent()}
        {currentPage === "distribution" && renderDistributionContent()}
        {currentPage === "analytics" && renderAnalyticsContent()}
        {currentPage === "settings" && renderSettingsContent()}
      </main>
    </div>
  );
};

export default Vendor_Dashboard;
