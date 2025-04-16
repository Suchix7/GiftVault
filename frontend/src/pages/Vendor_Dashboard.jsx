"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
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
import LogoutButton from "@/components/LogoutButton";
import voucherService from "@/api/vouchers";

const Vendor_Dashboard = () => {
  // Navigation state
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  // Voucher state
  const [vouchers, setVouchers] = useState([]);

  // New voucher form state
  const [newVoucher, setNewVoucher] = useState({
    name: "",
    value: "",
    description: "",
    campaign: "",
    expiryDate: null,
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
    {
      id: "distribution",
      label: "Distribution",
      icon: <Share2 className="h-5 w-5" />,
    },
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
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const data = await voucherService.getVouchers();
        setVouchers(data);
      } catch (error) {
        toast("User Updated", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Remove",
          },
        });
      }
    };
    loadVouchers();
  }, []);

  const handleCreateVoucher = async (e) => {
    if (e) e.preventDefault();

    try {
      // 1) Validate required fields
      if (!newVoucher.name || !newVoucher.value) {
        toast("Please fill in all required fields!");
        return;
      }

      // 2) Generate an ID
      const voucherId = `V-${(1000 + vouchers.length + 1)
        .toString()
        .substring(1)}`;
      console.log("Generated Voucher ID:", voucherId);

      // 3) Format the expiry date
      const formattedExpiry = newVoucher.expiryDate
        ? format(newVoucher.expiryDate, "MM/dd/yyyy")
        : "";

      // 4) Build the single voucher object
      const voucherWithId = {
        id: voucherId,
        name: newVoucher.name,
        value: Number.parseFloat(newVoucher.value),
        description: newVoucher.description,
        campaign: newVoucher.campaign,
        created: new Date().toLocaleString(),
        expiryDate: formattedExpiry, // <-- match your backend field
        sentRedeemed: "0/0",
        status: "draft",
        color: newVoucher.color,
        logo: previewLogo,
      };

      // 5) Send to backend (cookie auth via withCredentials)
      await voucherService.createVoucher(voucherWithId);

      // 6) Update local state
      setVouchers((prev) => [...prev, voucherWithId]);

      // 7) Show toast
      toast("Voucher Created", {
        description: `${
          newVoucher.name
        } created on ${new Date().toLocaleString()}`,
        action: { label: "Remove" },
      });

      // 8) Reset form
      setNewVoucher({
        name: "",
        value: "",
        description: "",
        campaign: "",
        expiryDate: null,
        color: "#3b82f6",
      });
      setPreviewLogo(null);
      setCurrentPage("vouchers");
      setActiveTab("active");
    } catch (error) {
      console.error("Error creating voucher:", error);

      toast("Voucher Creation Failed", {
        description: `An error occurred: ${
          error.response?.data?.message || error.message
        }`,
        action: { label: "Remove" },
      });
    }
  };

  const handleUpdateVoucherStatus = async (id, newStatus) => {
    try {
      // Update in backend
      await voucherService.updateVoucherStatus(id, newStatus);

      // Update local state
      setVouchers(
        vouchers.map((voucher) =>
          voucher.id === id ? { ...voucher, status: newStatus } : voucher
        )
      );
    } catch (error) {
      toast("Error ", {
        description: "Sunday, December 03, 2023 at 9:00 AM",
        action: {
          label: "Remove",
        },
      });
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

  const filteredVouchers = vouchers.filter(
    (voucher) =>
      voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  Value ($)
                </label>
                <input
                  id="value"
                  type="number"
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
                      ${newVoucher.value || "0"}
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

          {viewMode === "list" ? (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y">
                <thead className="bg-accent">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Voucher
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Value
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Expiry
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Sent/Redeemed
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y">
                  {filteredVouchers.map((voucher) => (
                    <tr key={voucher.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{voucher.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {voucher.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${voucher.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={voucher.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {voucher.created}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {voucher.expiry}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {voucher.sentRedeemed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative inline-block text-left">
                          <button
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              handleUpdateVoucherStatus(
                                voucher.id,
                                voucher.status === "active"
                                  ? "expired"
                                  : "active"
                              );
                            }}
                          >
                            <MoreHorizontal className="h-5 w-5" />
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
                  key={voucher.id}
                  className="border rounded-md p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{voucher.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {voucher.id}
                      </p>
                    </div>
                    <div>
                      <StatusBadge status={voucher.status} />
                    </div>
                  </div>
                  <div className="text-xl font-bold">${voucher.value}</div>
                  <div className="grid grid-cols-2 text-sm gap-2">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>{voucher.created}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expires</p>
                      <p>{voucher.expiry}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        handleUpdateVoucherStatus(
                          voucher.id,
                          voucher.status === "active" ? "expired" : "active"
                        );
                      }}
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDashboardContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
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
        <div className="border-b">
          <div className="flex space-x-1">
            <button
              className={`px-4 py-2 ${
                activeTab === "overview"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "vouchers"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("vouchers")}
            >
              My Vouchers
            </button>
          </div>
        </div>
        {activeTab === "overview" && (
          <div className="p-4 bg-card rounded-lg">
            <h2 className="text-xl font-bold">Welcome to your dashboard</h2>
            <p className="text-muted-foreground">
              Here you can manage your vouchers, view analytics, and more.
            </p>
          </div>
        )}
        {activeTab === "vouchers" && (
          <div className="p-4 bg-card rounded-lg">
            <h2 className="text-xl font-bold">Your Vouchers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800">Active Vouchers</h3>
                <p className="text-2xl font-bold">
                  {vouchers.filter((v) => v.status === "active").length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800">Draft Vouchers</h3>
                <p className="text-2xl font-bold">
                  {vouchers.filter((v) => v.status === "draft").length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-800">Expired Vouchers</h3>
                <p className="text-2xl font-bold">
                  {vouchers.filter((v) => v.status === "expired").length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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

  const renderAnalyticsContent = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="p-4 bg-card rounded-lg">
          <h2 className="text-xl font-bold">Analytics Overview</h2>
          <p className="text-muted-foreground">
            View detailed analytics about your voucher performance.
          </p>
        </div>
      </div>
    );
  };

  const renderSettingsContent = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="border-b">
          <div className="flex space-x-1">
            <button
              className={`px-4 py-2 ${
                activeTab === "general"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("general")}
            >
              General
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "notifications"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              Notifications
            </button>
          </div>
        </div>
        <div className="p-4 bg-card rounded-lg">
          <h2 className="text-xl font-bold">
            {activeTab === "general" && "General Settings"}
            {activeTab === "notifications" && "Notification Settings"}
          </h2>
          <p className="text-muted-foreground">
            {activeTab === "general"
              ? "Configure your account settings"
              : "Manage your notification preferences"}
          </p>
        </div>
      </div>
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
      <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
    </div>
  );
};

export default Vendor_Dashboard;
