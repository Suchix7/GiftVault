"use client";
import LogoutButton from "@/components/LogoutButton";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart3,
  Gift,
  LayoutDashboard,
  Plus,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { useToast } from "../hooks/use-toast";

function UserList() {
  // Fetch user data from the backend
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("/users")
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError(err);
        toast({
          title: "Error",
          description: "Failed to load user data.",
          type: "error",
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading users</p>;
  // Filter approved users
  const approvedUsers = users.filter((user) => user.isApproved === true);

  // Count by role
  const totalAdmins = approvedUsers.filter(
    (user) => user.role === "admin"
  ).length;
  const totalVendors = approvedUsers.filter(
    (user) => user.role === "vendor"
  ).length;
  const totalUsers = approvedUsers.filter(
    (user) => user.role === "user"
  ).length;

  return (
    <div className="user-list">
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="text-sm text-muted-foreground">
              {format(new Date(), "MMMM dd, yyyy")}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
            <p>Total Users: {totalUsers}</p>
            <p>Total Vendors: {totalVendors}</p>
            <p>Total Admins: {totalAdmins}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Vendors
                  </p>
                  <h3 className="text-3xl font-bold mt-2">{totalVendors}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {/* {activeVendors} active */}
                  </p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Customers
                  </p>
                  <h3 className="text-3xl font-bold mt-2">{totalUsers}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {/* {activeCustomers} active */}
                  </p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>
          {/* <ul>
            {users.map((user) => (
              <li key={user._id}>
                {" "}
                <div>
                  <h3>Name: {user.name}</h3>
                  <p>Email: {user.email}</p>
                  <p>Role: {user.role}</p>
                </div>
              </li>
            ))}
          </ul> */}
        </div>
      )}
    </div>
  );
}

// Main component
const Admin_Dashboard = () => {
  // State for navigation and content
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("overview");

  // State for data fetched from the backend
  const [roles, setRoles] = useState([]);
  const [voucherCampaigns, setVoucherCampaigns] = useState([]);
  const [voucherTemplates, setVoucherTemplates] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [availablePermissions, setAvailablePermissions] = useState([]);

  // State for selected items
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // State for creation forms
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  // State for form data
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    type: "vendor",
    role: "",
    status: "active",
    companyName: "",
    department: "",
  });

  const [newRole, setNewRole] = useState({
    name: "",
    type: "vendor",
    description: "",
    permissions: [],
  });

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    vendor: "",
    startDate: "",
    endDate: "",
    vouchersToCreate: "",
    voucherValue: "",
    template: "",
  });

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "Seasonal",
    description: "",
  });

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Toast notifications
  const { toast } = useToast();
  const [toasts, setToasts] = useState([]);

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "vendors", label: "Vendors", icon: Users },
    { id: "customers", label: "Customers", icon: Users },
    { id: "admins", label: "Admins", icon: Shield },
    { id: "vouchers", label: "Vouchers", icon: Gift },
  ];

  // // Fetch data from the backend

  // Helper functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setActiveTab(getDefaultTabForPage(page));
    resetSelections();
  };

  const getDefaultTabForPage = (page) => {
    switch (page) {
      case "dashboard":
        return "overview";
      case "vendors":
      case "customers":
      case "admins":
        return "all" + page.charAt(0).toUpperCase() + page.slice(1);
      case "vouchers":
        return "campaigns";
      default:
        return "overview";
    }
  };

  const resetSelections = () => {
    setSelectedUser(null);
    setSelectedRole(null);
    setSelectedCampaign(null);
    setSelectedTemplate(null);
    setIsCreatingUser(false);
    setIsCreatingRole(false);
    setIsCreatingCampaign(false);
    setIsCreatingTemplate(false);
  };

  // Render content based on the current page
  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <div>
            <UserList />
          </div>
        );

      case "vendors":
        return <div>Vendors Content</div>;
      case "customers":
        return <div>Customers Content</div>;
      case "admins":
        return <div>Admins Content</div>;
      case "vouchers":
        return <div>Vouchers Content</div>;
      default:
        return <div>Dashboard Content</div>;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex-shrink-0">
        <div className="h-full flex flex-col">
          <div className="px-4 py-6 flex items-center justify-center">
            <h1 className="text-lg font-semibold">GiftVault Admin</h1>
          </div>
          <nav className="flex-1 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handlePageChange(item.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground",
                      currentPage === item.id
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto border-t border-border">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">{renderContent()}</main>

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "bg-card border border-border rounded-md shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right-5",
              toast.type === "success" && "border-green-500",
              toast.type === "error" && "border-red-500"
            )}
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

export default Admin_Dashboard;
