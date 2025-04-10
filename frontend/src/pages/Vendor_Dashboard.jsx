"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Gift,
  Share2,
  BarChart3,
  SettingsIcon,
  LogOut,
  Search,
  List,
  GridIcon,
  MoreHorizontal,
  PlusCircle,
  Send,
  UserPlus,
  Upload,
  Save,
  X,
} from "lucide-react";
import { format } from "date-fns";
import LogoutButton from "@/components/LogoutButton";
// Mock data for the application
const voucherData = [
  {
    id: "V-1001",
    name: "Holiday Special $50",
    value: 50,
    status: "active",
    created: "11/15/2023",
    expiry: "1/15/2024",
    sentRedeemed: "5/0",
    campaign: "holiday",
  },
  {
    id: "V-1002",
    name: "Birthday Gift $25",
    value: 25,
    status: "active",
    created: "10/22/2023",
    expiry: "10/22/2024",
    sentRedeemed: "10/3",
    campaign: "birthday",
  },
  {
    id: "V-1003",
    name: "Anniversary Special",
    value: 100,
    status: "expired",
    created: "5/10/2023",
    expiry: "11/10/2023",
    sentRedeemed: "12/8",
    campaign: "anniversary",
  },
  {
    id: "V-1004",
    name: "Welcome Bonus",
    value: 20,
    status: "draft",
    created: "11/28/2023",
    expiry: "5/28/2024",
    sentRedeemed: "0/0",
    campaign: "welcome",
  },
];

const userData = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    vouchersReceived: 5,
    vouchersRedeemed: 3,
    lastActivity: "11/20/2023",
  },
  {
    id: 2,
    name: "Emily Johnson",
    email: "emily.j@example.com",
    vouchersReceived: 3,
    vouchersRedeemed: 2,
    lastActivity: "11/15/2023",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.b@example.com",
    vouchersReceived: 4,
    vouchersRedeemed: 0,
    lastActivity: "10/05/2023",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.w@example.com",
    vouchersReceived: 2,
    vouchersRedeemed: 1,
    lastActivity: "11/22/2023",
  },
  {
    id: 5,
    name: "David Lee",
    email: "david.l@example.com",
    vouchersReceived: 6,
    vouchersRedeemed: 4,
    lastActivity: "11/25/2023",
  },
];

const distributionData = [
  {
    id: 1,
    date: "11/15/2023",
    voucherName: "Holiday Special $50",
    recipients: 5,
    status: "Sent",
    redeemed: 0,
  },
  {
    id: 2,
    date: "10/22/2023",
    voucherName: "Birthday Gift $25",
    recipients: 10,
    status: "Sent",
    redeemed: 3,
  },
  {
    id: 3,
    date: "5/10/2023",
    voucherName: "Anniversary Special",
    recipients: 12,
    status: "Completed",
    redeemed: 8,
  },
  {
    id: 4,
    date: "11/28/2023",
    voucherName: "Welcome Bonus",
    recipients: 0,
    status: "Draft",
    redeemed: 0,
  },
];

// Utility function to conditionally join class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Main component
const Vendor_Dashboard = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [vouchers, setVouchers] = useState(voucherData);
  const [users, setUsers] = useState(userData);
  const [distributions, setDistributions] = useState(distributionData);
  const [vendorLogo, setVendorLogo] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState("myVouchers");

  // Dashboard specific states
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  // Create voucher specific states
  const [newVoucher, setNewVoucher] = useState({
    name: "",
    value: "",
    description: "",
    campaign: "",
    expiryDate: null,
    color: "#000000",
  });

  // Distribution specific states
  const [selectedVoucher, setSelectedVoucher] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [emailList, setEmailList] = useState("");
  const [distributionMethod, setDistributionMethod] = useState("individual");

  // Analytics specific states
  const [timeRange, setTimeRange] = useState("30days");

  // Settings specific states
  const [companyName, setCompanyName] = useState("My Company");
  const [email, setEmail] = useState("admin@company.com");
  const [notifyOnRedemption, setNotifyOnRedemption] = useState(true);
  const [notifyOnExpiry, setNotifyOnExpiry] = useState(true);
  const [autoRenewVouchers, setAutoRenewVouchers] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(vendorLogo);

  // Toast notification function
  const toast = ({ title, description }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 3000);

    return id;
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (page === "dashboard" || page === "vouchers") {
      setActiveTab("myVouchers");
    }
  };

  // Handle create voucher
  const handleCreateVoucher = (e) => {
    if (e) e.preventDefault();

    const voucherId = `V-${(1000 + vouchers.length + 1)
      .toString()
      .substring(1)}`;
    const formattedExpiry = newVoucher.expiryDate
      ? format(newVoucher.expiryDate, "MM/dd/yyyy")
      : "";

    const voucherWithId = {
      id: voucherId,
      name: newVoucher.name,
      value: Number.parseFloat(newVoucher.value),
      description: newVoucher.description,
      campaign: newVoucher.campaign,
      created: new Date().toLocaleDateString(),
      expiry: formattedExpiry,
      sentRedeemed: "0/0",
      status: "draft",
      color: newVoucher.color,
      logo: previewLogo,
    };

    setVouchers([...vouchers, voucherWithId]);
    toast({
      title: "Voucher Created",
      description: `${newVoucher.name} voucher has been created successfully.`,
    });

    // Reset form
    setNewVoucher({
      name: "",
      value: "",
      description: "",
      campaign: "",
      expiryDate: null,
      color: "bg-primary",
    });

    setCurrentPage("vouchers");
  };

  // Handle update voucher status
  const handleUpdateVoucherStatus = (id, newStatus) => {
    setVouchers(
      vouchers.map((voucher) =>
        voucher.id === id ? { ...voucher, status: newStatus } : voucher
      )
    );
    toast({
      title: "Status Updated",
      description: `Voucher status has been updated to ${newStatus}.`,
    });
  };

  // Handle delete voucher
  const handleDeleteVoucher = (id) => {
    setVouchers(vouchers.filter((voucher) => voucher.id !== id));
    toast({
      title: "Voucher Deleted",
      description: "Voucher has been deleted successfully.",
    });
  };

  // Handle logo upload
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

  // Handle save settings
  const handleSaveSettings = () => {
    setVendorLogo(previewLogo);
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };

  // Handle send vouchers
  const handleSendVouchers = () => {
    toast({
      title: "Vouchers Sent",
      description: `Vouchers sent to ${selectedUsers.length} users.`,
    });
    setSelectedUsers([]);
    setSelectedVoucher("");
  };

  // Handle bulk import
  const handleBulkImport = () => {
    const emails = emailList.split(/[\n,]/).filter((email) => email.trim());
    toast({
      title: "Emails Imported",
      description: `Imported ${emails.length} email addresses.`,
    });
  };

  // Filter vouchers based on search term
  const filteredVouchers = vouchers.filter(
    (voucher) =>
      voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate analytics data
  const activeVouchers = vouchers.filter((v) => v.status === "active").length;
  const redeemedVouchers = vouchers.filter(
    (v) => v.status === "redeemed"
  ).length;
  const expiredVouchers = vouchers.filter((v) => v.status === "expired").length;
  const redemptionRate =
    vouchers.length > 0
      ? Math.round((redeemedVouchers / vouchers.length) * 100)
      : 0;

  // Calculate vouchers created in the last month
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const newVouchers = vouchers.filter((v) => {
    const createdDate = new Date(v.created);
    return createdDate > lastMonth;
  }).length;

  // Count unique campaigns
  const campaigns = [...new Set(vouchers.map((v) => v.campaign))].filter(
    Boolean
  ).length;

  // Total distributed and redeemed
  const totalDistributed = distributions.reduce(
    (sum, dist) => sum + dist.recipients,
    0
  );
  const totalRedeemed = distributions.reduce(
    (sum, dist) => sum + dist.redeemed,
    0
  );

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

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800 hover:bg-green-100",
      expired: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      draft: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      redeemed: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          statusStyles[status] || ""
        }`}
      >
        {status}
      </span>
    );
  };

  // Render dashboard content
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card text-card-foreground border-2 p-6 rounded-lg hover:scale-[1.01] transition-transform">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Total Vouchers
            </div>
            <div className="text-3xl font-bold">{vouchers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{newVouchers} from last month
            </p>
          </div>

          <div className="bg-card text-card-foreground border-2 p-6 rounded-lg hover:scale-[1.01] transition-transform">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Redeemed Vouchers
            </div>
            <div className="text-3xl font-bold">{redeemedVouchers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {redemptionRate}% redemption rate
            </p>
          </div>

          <div className="bg-card text-card-foreground border-2 p-6 rounded-lg hover:scale-[1.01] transition-transform">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Active Users
            </div>
            <div className="text-3xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {campaigns} campaigns
            </p>
          </div>
        </div>

        <div className="border-b">
          <div className="flex space-x-1">
            <button
              className={`px-4 py-2 ${
                activeTab === "myVouchers"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("myVouchers")}
            >
              My Vouchers
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "createVoucher"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => {
                setCurrentPage("createVoucher");
                setActiveTab("createVoucher");
              }}
            >
              Create Voucher
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "analytics"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => {
                setCurrentPage("analytics");
                setActiveTab("analytics");
              }}
            >
              Analytics
            </button>
          </div>
        </div>

        {activeTab === "myVouchers" && (
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
                            <button className="text-muted-foreground hover:text-foreground">
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
                      <button className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render create voucher content
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
                        src={previewLogo || "/placeholder.svg"}
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
                  setActiveTab("myVouchers");
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
                          src={previewLogo || "/placeholder.svg"}
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

  // Render vouchers content
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

  // Render distribution content
  const renderDistributionContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Distribution</h1>
        </div>

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
              Send Vouchers
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "history"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("history")}
            >
              Distribution History
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "users"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("users")}
            >
              Manage Users
            </button>
          </div>
        </div>

        {activeTab === "send" && (
          <div className="bg-card text-card-foreground border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold">Send Vouchers</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="voucher"
                  className="block text-sm font-medium mb-1"
                >
                  Select Voucher
                </label>
                <select
                  id="voucher"
                  value={selectedVoucher}
                  onChange={(e) => setSelectedVoucher(e.target.value)}
                  className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a voucher</option>
                  {vouchers
                    .filter((v) => v.status === "active")
                    .map((voucher) => (
                      <option key={voucher.id} value={voucher.id}>
                        {voucher.name} (${voucher.value})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="distribution-method"
                  className="block text-sm font-medium mb-1"
                >
                  Distribution Method
                </label>
                <select
                  id="distribution-method"
                  value={distributionMethod}
                  onChange={(e) => setDistributionMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="individual">Select Individual Users</option>
                  <option value="bulk">Bulk Import</option>
                </select>
              </div>

              {distributionMethod === "individual" ? (
                <div className="space-y-4">
                  <label className="block text-sm font-medium">
                    Select Users
                  </label>
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2 py-2"
                      >
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(
                                selectedUsers.filter((id) => id !== user.id)
                              );
                            }
                          }}
                          className="h-4 w-4 rounded border-primary"
                        />
                        <label htmlFor={`user-${user.id}`} className="text-sm">
                          {user.name} ({user.email})
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedUsers.length} users selected
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <label
                    htmlFor="email-list"
                    className="block text-sm font-medium mb-1"
                  >
                    Bulk Import Emails
                  </label>
                  <textarea
                    id="email-list"
                    placeholder="Enter email addresses (one per line or comma-separated)"
                    value={emailList}
                    onChange={(e) => setEmailList(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={handleBulkImport}
                    className="w-full px-4 py-2 bg-transparent border text-foreground rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Import Email List
                  </button>
                </div>
              )}

              <button
                onClick={handleSendVouchers}
                disabled={
                  !selectedVoucher ||
                  (distributionMethod === "individual" &&
                    selectedUsers.length === 0)
                }
                className={`w-full px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
                  !selectedVoucher ||
                  (distributionMethod === "individual" &&
                    selectedUsers.length === 0)
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <Send className="h-4 w-4" />
                Send Vouchers
              </button>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-card text-card-foreground border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Distribution History</h2>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y">
                <thead className="bg-accent">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Date
                    </th>
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
                      Recipients
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
                      Redeemed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y">
                  {distributions.map((dist) => (
                    <tr key={dist.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {dist.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {dist.voucherName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {dist.recipients}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {dist.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {dist.redeemed}/{dist.recipients}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-card text-card-foreground border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Management</h2>
              <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                Add User
              </button>
            </div>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y">
                <thead className="bg-accent">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Vouchers Received
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Vouchers Redeemed
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.vouchersReceived}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.vouchersRedeemed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.lastActivity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render analytics content
  const renderAnalyticsContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <div className="flex items-center gap-2">
            <label htmlFor="time-range" className="text-sm">
              Time Range:
            </label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="year">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card text-card-foreground border rounded-lg p-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Total Vouchers
            </div>
            <div className="text-3xl font-bold">{vouchers.length}</div>
          </div>

          <div className="bg-card text-card-foreground border rounded-lg p-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Redemption Rate
            </div>
            <div className="text-3xl font-bold">{redemptionRate}%</div>
          </div>

          <div className="bg-card text-card-foreground border rounded-lg p-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Active Users
            </div>
            <div className="text-3xl font-bold">{users.length}</div>
          </div>

          <div className="bg-card text-card-foreground border rounded-lg p-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Total Value Distributed
            </div>
            <div className="text-3xl font-bold">
              ${vouchers.reduce((sum, v) => sum + v.value, 0)}
            </div>
          </div>
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
                activeTab === "voucherAnalytics"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("voucherAnalytics")}
            >
              Voucher Analytics
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "userAnalytics"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("userAnalytics")}
            >
              User Analytics
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-card text-card-foreground border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                Voucher Status Distribution
              </h2>
              <div className="h-80 flex items-center justify-center">
                <div className="flex gap-4 w-full max-w-md">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active</span>
                      <span>{activeVouchers}</span>
                    </div>
                    <div
                      className="bg-green-500 h-4 rounded-full"
                      style={{
                        width: `${(activeVouchers / vouchers.length) * 100}%`,
                      }}
                    ></div>

                    <div className="flex justify-between text-sm mt-4">
                      <span>Redeemed</span>
                      <span>{redeemedVouchers}</span>
                    </div>
                    <div
                      className="bg-blue-500 h-4 rounded-full"
                      style={{
                        width: `${(redeemedVouchers / vouchers.length) * 100}%`,
                      }}
                    ></div>

                    <div className="flex justify-between text-sm mt-4">
                      <span>Expired</span>
                      <span>{expiredVouchers}</span>
                    </div>
                    <div
                      className="bg-gray-500 h-4 rounded-full"
                      style={{
                        width: `${(expiredVouchers / vouchers.length) * 100}%`,
                      }}
                    ></div>

                    <div className="flex justify-between text-sm mt-4">
                      <span>Draft</span>
                      <span>
                        {vouchers.length -
                          activeVouchers -
                          redeemedVouchers -
                          expiredVouchers}
                      </span>
                    </div>
                    <div
                      className="bg-yellow-500 h-4 rounded-full"
                      style={{
                        width: `${
                          ((vouchers.length -
                            activeVouchers -
                            redeemedVouchers -
                            expiredVouchers) /
                            vouchers.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card text-card-foreground border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">
                  Distribution Overview
                </h2>
                <div className="h-60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold">{totalDistributed}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Total vouchers distributed
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">{totalRedeemed}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Vouchers redeemed
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">User Engagement</h2>
                <div className="h-60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold">{users.length}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Total users
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        {users.filter((u) => u.vouchersRedeemed > 0).length}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Active users
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "voucherAnalytics" && (
          <div className="bg-card text-card-foreground border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Voucher Performance</h2>
            <div className="space-y-8">
              {vouchers.slice(0, 5).map((voucher) => (
                <div key={voucher.id} className="space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{voucher.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${voucher.value}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {voucher.sentRedeemed.split("/")[1] || "0"}/
                        {voucher.sentRedeemed.split("/")[0] || "0"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Redeemed
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full"
                      style={{
                        width: `${
                          voucher.sentRedeemed.split("/")[1] > 0
                            ? (Number.parseInt(
                                voucher.sentRedeemed.split("/")[1]
                              ) /
                                Number.parseInt(
                                  voucher.sentRedeemed.split("/")[0]
                                )) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "userAnalytics" && (
          <div className="bg-card text-card-foreground border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">User Engagement</h2>
            <div className="space-y-8">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {user.vouchersRedeemed}/{user.vouchersReceived}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Redeemed
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full"
                      style={{
                        width: `${
                          user.vouchersReceived > 0
                            ? (user.vouchersRedeemed / user.vouchersReceived) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render settings content
  const renderSettingsContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Settings</h1>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2"
            onClick={handleSaveSettings}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>

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
                activeTab === "branding"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("branding")}
            >
              Branding
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

        {activeTab === "general" && (
          <div className="bg-card text-card-foreground border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold mb-2">General Settings</h2>
            <div>
              <label
                htmlFor="company-name"
                className="block text-sm font-medium mb-1"
              >
                Company Name
              </label>
              <input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="auto-renew"
                  className="block text-sm font-medium"
                >
                  Auto-renew Expired Vouchers
                </label>
                <p className="text-sm text-muted-foreground">
                  Automatically create new vouchers when they expire
                </p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="auto-renew"
                  checked={autoRenewVouchers}
                  onChange={() => setAutoRenewVouchers(!autoRenewVouchers)}
                  className="sr-only"
                />
                <div
                  className={`block h-6 rounded-full w-10 ${
                    autoRenewVouchers ? "bg-primary" : "bg-muted"
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    autoRenewVouchers ? "transform translate-x-4" : ""
                  }`}
                ></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "branding" && (
          <div className="bg-card text-card-foreground border rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold mb-2">Branding</h2>
            <div>
              <label htmlFor="logo" className="block text-sm font-medium mb-1">
                Company Logo
              </label>
              <div className="flex items-center gap-4 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-background border rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring flex items-center gap-2"
                  onClick={() => document.getElementById("logo-upload").click()}
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
                  <div className="h-16 w-16 rounded-md overflow-hidden border">
                    <img
                      src={previewLogo || "/placeholder.svg"}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Recommended size: 200x200px. PNG or JPG format.
              </p>
            </div>

            <div>
              <label
                htmlFor="voucher-preview"
                className="block text-sm font-medium mb-1"
              >
                Voucher Preview
              </label>
              <div className="mt-2 border rounded-md p-6 flex justify-center">
                <div className="bg-primary/10 rounded-lg p-6 w-72">
                  {previewLogo && (
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-white/90 p-2">
                        <img
                          src={previewLogo || "/placeholder.svg"}
                          alt="Vendor logo"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold">Sample Voucher</h3>
                    <p className="text-muted-foreground text-sm">
                      This is how your voucher will look
                    </p>
                  </div>

                  <div className="flex justify-center mt-4">
                    <div className="bg-primary/20 backdrop-blur-sm rounded-full px-6 py-2 font-bold text-2xl">
                      $50
                    </div>
                  </div>

                  <div className="text-center text-muted-foreground text-sm mt-4">
                    Valid until December 31, 2023
                  </div>

                  <div className="pt-4 border-t border-primary/20 text-center mt-4">
                    <p className="text-muted-foreground text-xs">
                      Scan or present this voucher at checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="bg-card text-card-foreground border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold mb-2">Notification Settings</h2>
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="notify-redemption"
                  className="block text-sm font-medium"
                >
                  Voucher Redemption
                </label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a voucher is redeemed
                </p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="notify-redemption"
                  checked={notifyOnRedemption}
                  onChange={() => setNotifyOnRedemption(!notifyOnRedemption)}
                  className="sr-only"
                />
                <div
                  className={`block h-6 rounded-full w-10 ${
                    notifyOnRedemption ? "bg-primary" : "bg-muted"
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    notifyOnRedemption ? "transform translate-x-4" : ""
                  }`}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="notify-expiry"
                  className="block text-sm font-medium"
                >
                  Voucher Expiry
                </label>
                <p className="text-sm text-muted-foreground">
                  Get notified when vouchers are about to expire
                </p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="notify-expiry"
                  checked={notifyOnExpiry}
                  onChange={() => setNotifyOnExpiry(!notifyOnExpiry)}
                  className="sr-only"
                />
                <div
                  className={`block h-6 rounded-full w-10 ${
                    notifyOnExpiry ? "bg-primary" : "bg-muted"
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    notifyOnExpiry ? "transform translate-x-4" : ""
                  }`}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render content based on current page
  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return renderDashboardContent();
      case "vouchers":
        return renderVouchersContent();
      case "distribution":
        return renderDistributionContent();
      case "analytics":
        return renderAnalyticsContent();
      case "settings":
        return renderSettingsContent();
      case "createVoucher":
        return renderCreateVoucherContent();
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
                  onClick={() => handlePageChange(item.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2 text-sm",
                    currentPage === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
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

      {/* Toast notifications */}
      <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-card text-card-foreground border rounded-md shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right-5"
          >
            <div className="flex-1">
              {toast.title && <div className="font-medium">{toast.title}</div>}
              {toast.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setToasts(toasts.filter((t) => t.id !== toast.id))}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vendor_Dashboard;
