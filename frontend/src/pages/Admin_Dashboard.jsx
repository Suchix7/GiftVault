"use client";
import LogoutButton from "@/components/LogoutButton";
import { useState, useEffect } from "react";
import axios from "axios";
import { Filter, Check, X, Search } from "lucide-react";
import { LayoutDashboard, Plus, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { useToast } from "../hooks/use-toast";

function UserList({ users, loading, error }) {
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading users</p>;

  // Approved & Unapproved Users
  const approvedUsers = users.filter((user) => user.isApproved);
  const unapprovedUsers = users.filter((user) => !user.isApproved);

  // Count by Role (Approved)
  const approvedAdmins = approvedUsers.filter((u) => u.role === "admin").length;
  const approvedVendors = approvedUsers.filter(
    (u) => u.role === "vendor"
  ).length;
  const approvedRegularUsers = approvedUsers.filter(
    (u) => u.role === "user"
  ).length;

  // Count by Role (Unapproved)
  const unapprovedVendors = unapprovedUsers.filter(
    (u) => u.role === "vendor"
  ).length;

  // Total Users (Regardless of Approval)
  const totalRegularUsers = users.filter((u) => u.role === "user").length;
  const totalVendors = users.filter((u) => u.role === "vendor").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;

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
            <p>Total Users: {totalRegularUsers}</p>
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
                    {approvedVendors} Approved, {unapprovedVendors} Unapproved
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
                  <h3 className="text-3xl font-bold mt-2">
                    {totalRegularUsers}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 ">
                    Total: {approvedRegularUsers}
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
                    Total Admin
                  </p>
                  <h3 className="text-3xl font-bold mt-2">{totalAdmins}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total: {approvedAdmins}
                  </p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Admin_Dashboard = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const { toast } = useToast();
  const [toasts, setToasts] = useState([]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "vendors", label: "Vendors", icon: Users },
    { id: "customers", label: "Customers", icon: Users },
    { id: "admins", label: "Admins", icon: Users },
  ];

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setActiveTab(getDefaultTabForPage(page));
  };

  const getDefaultTabForPage = (page) => {
    switch (page) {
      case "dashboard":
        return "overview";
      case "vendors":
        return "allVendors";
      case "customers":
        return "allCustomers";
      case "admins":
        return "allAdmins";
      default:
        return "overview";
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <div>
            <UserList users={users} loading={loading} error={error} />
          </div>
        );

      case "vendors":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Vendor Management</h1>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2 inline-block" />
                Add Vendor
              </button>
            </div>
            <div className="border-b border-border">
              <div className="flex space-x-1">
                <button
                  className={`px-4 py-2 ${
                    activeTab === "allVendors"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("allVendors")}
                >
                  All Vendors
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "activeVendors"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("activeVendors")}
                >
                  Approved Vendors
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "inactiveVendors"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("inactiveVendors")}
                >
                  Unapproved Vendors
                </button>
              </div>
            </div>
            {(activeTab === "allVendors" ||
              activeTab === "activeVendors" ||
              activeTab === "inactiveVendors") && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search vendors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="unapproved">Unapproved</option>
                    </select>

                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("");
                      }}
                      className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-1"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Reset Filters</span>
                    </button>
                  </div>
                </div>

                <div className="border border-border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Vendor
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Contact
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Vouchers
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
                          Created At
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {users
                        .filter((user) => user.role === "vendor")
                        .filter((vendor) => {
                          const matchesSearch =
                            searchTerm === "" ||
                            vendor.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (vendor.companyName &&
                              vendor.companyName
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()));

                          const matchesStatus =
                            filterStatus === "" ||
                            (filterStatus === "approved" &&
                              vendor.isApproved) ||
                            (filterStatus === "unapproved" &&
                              !vendor.isApproved);

                          const matchesTab =
                            activeTab === "allVendors" ||
                            (activeTab === "activeVendors" &&
                              vendor.isApproved) ||
                            (activeTab === "inactiveVendors" &&
                              !vendor.isApproved);

                          return matchesSearch && matchesStatus && matchesTab;
                        })
                        .map((vendor) => (
                          <tr
                            key={vendor._id}
                            className="hover:bg-muted/50 cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium">
                                    {vendor.companyName || "Individual Vendor"}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {vendor.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">{vendor.email}</div>
                              <div className="text-sm text-muted-foreground">
                                {vendor.phone || "No phone"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                {vendor.vouchersCreated || 0} created
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vendor.vouchersRedeemed || 0} redeemed
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  vendor.isApproved
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {vendor.isApproved
                                  ? "Approved"
                                  : "Pending Approval"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {vendor.createdAt
                                ? new Date(vendor.createdAt).toLocaleString()
                                : "Never logged in"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
                              {vendor.isApproved ? (
                                <X className="h-5 w-5 text-red-500" />
                              ) : (
                                <Check className="h-5 w-5 text-green-500" />
                              )}
                              <button className="text-primary hover:text-primary/80">
                                View
                              </button>
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
      case "customers":
        return <div>Customers Content</div>;
      case "admins":
        return <div>Admins Content</div>;
      default:
        return <div>Dashboard Content</div>;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
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

      <main className="flex-1 overflow-y-auto p-8">{renderContent()}</main>

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
