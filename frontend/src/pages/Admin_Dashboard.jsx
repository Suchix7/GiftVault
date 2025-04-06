"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Activity,
  CheckCircle,
  Download,
  Edit,
  Filter,
  Gift,
  Key,
  LogOut,
  Search,
  Tag,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

const Admin_Dashboard = () => {
  // State management
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("allAdmins");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    status: "active",
  });
  const [toasts, setToasts] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "vendors", label: "Vendors", icon: Tag },
    { id: "customers", label: "Customers", icon: Gift },
    { id: "admins", label: "Admins", icon: Key },
    { id: "vouchers", label: "Vouchers", icon: Gift },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Activity },
  ];

  // Sample data
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      department: "Management",
      status: "active",
      actionsPerformed: 42,
      permissions: ["users:read", "users:write", "settings:read"],
    },
    // Add more sample users as needed
  ];

  const availablePermissions = [
    { id: "users:read", label: "View Users" },
    { id: "users:write", label: "Manage Users" },
    { id: "settings:read", label: "View Settings" },
    { id: "settings:write", label: "Manage Settings" },
  ];

  // Helper functions
  const timeAgo = (timestamp) => {
    // Implement your time ago logic
    return "2 hours ago";
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setActiveTab(page === "admins" ? "allAdmins" : "overview");
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleDeleteUser = (userId) => {
    // Implement delete user logic
    setToasts([
      ...toasts,
      {
        id: Date.now(),
        title: "User Deleted",
        description: "The user has been successfully deleted.",
        type: "success",
      },
    ]);
  };

  const handleUserStatusChange = (userId, newStatus) => {
    // Implement status change logic
    setToasts([
      ...toasts,
      {
        id: Date.now(),
        title: `User ${newStatus === "active" ? "Activated" : "Deactivated"}`,
        description: `User status has been updated to ${newStatus}.`,
        type: "success",
      },
    ]);
  };

  const handleCreateUser = () => {
    // Implement create user logic
    setIsCreatingUser(false);
    setActiveTab("allAdmins");
    setToasts([
      ...toasts,
      {
        id: Date.now(),
        title: "User Created",
        description: "The new admin user has been created.",
        type: "success",
      },
    ]);
  };

  // Component rendering functions
  const StatusBadge = ({ status }) => {
    const statusClasses = {
      active: "bg-green-500/10 text-green-500",
      inactive: "bg-yellow-500/10 text-yellow-500",
      pending: "bg-blue-500/10 text-blue-500",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderDashboardContent = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      {/* Dashboard content goes here */}
    </div>
  );

  const renderAdminsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          onClick={() => {
            setIsCreatingUser(true);
            setActiveTab("createAdmin");
          }}
        >
          + Create Admin
        </button>
      </div>

      <div className="border-b border-border">
        <div className="flex space-x-1">
          <button
            className={`px-4 py-2 ${
              activeTab === "allAdmins"
                ? "border-b-2 border-primary font-medium"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("allAdmins")}
          >
            All Admins
          </button>
          {selectedUser && (
            <button
              className={`px-4 py-2 ${
                activeTab === "adminDetails"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("adminDetails")}
            >
              Admin Details
            </button>
          )}
          {isCreatingUser && (
            <button
              className={`px-4 py-2 ${
                activeTab === "createAdmin"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("createAdmin")}
            >
              Create Admin
            </button>
          )}
        </div>
      </div>

      {activeTab === "allAdmins" && (
        <div className="space-y-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search admins..."
              className="pl-10 pr-4 py-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      handleUserSelect(user);
                      setActiveTab("adminDetails");
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "adminDetails" && selectedUser && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Admin Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Actions Performed
                  </h4>
                  <p>{selectedUser.actionsPerformed}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Permissions
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser.permissions.map((permission) => {
                  const permInfo = availablePermissions.find(
                    (p) => p.id === permission
                  );
                  return (
                    <span
                      key={permission}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                    >
                      {permInfo ? permInfo.label : permission}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activityLogs
                  .filter((log) => log.userId === selectedUser.id)
                  .slice(0, 3)
                  .map((log) => (
                    <div key={log.id} className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium">{log.action}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {log.details}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {timeAgo(log.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                {activityLogs.filter((log) => log.userId === selectedUser.id)
                  .length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Account Actions</h3>
              <div className="space-y-2">
                <button
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center justify-center"
                  onClick={() => {
                    setToasts([
                      ...toasts,
                      {
                        id: Date.now(),
                        title: "Password Reset Email Sent",
                        description: `A password reset link has been sent to ${selectedUser.email}.`,
                        type: "success",
                      },
                    ]);
                  }}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Reset Password
                </button>

                <button
                  className={`w-full px-4 py-2 rounded-md flex items-center justify-center ${
                    selectedUser.status === "active"
                      ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                      : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                  }`}
                  onClick={() =>
                    handleUserStatusChange(
                      selectedUser.id,
                      selectedUser.status === "active" ? "inactive" : "active"
                    )
                  }
                >
                  {selectedUser.status === "active" ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Deactivate Account
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate Account
                    </>
                  )}
                </button>

                <button
                  className="w-full px-4 py-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 flex items-center justify-center"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "createAdmin" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Create New Admin</h2>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select Role</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium mb-1"
                >
                  Department
                </label>
                <select
                  id="department"
                  value={newUser.department}
                  onChange={(e) =>
                    setNewUser({ ...newUser, department: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Management">Management</option>
                  <option value="Vendor Relations">Vendor Relations</option>
                  <option value="Support">Support</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={newUser.status}
                  onChange={(e) =>
                    setNewUser({ ...newUser, status: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={() => {
                  setIsCreatingUser(false);
                  setActiveTab("allAdmins");
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                disabled={!newUser.name || !newUser.email}
              >
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Other content rendering functions would go here...

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
          <div className="p-4 border-t border-border">
            <button className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        {currentPage === "dashboard" && renderDashboardContent()}
        {currentPage === "admins" && renderAdminsContent()}
        {/* Add other content renderers here */}
      </main>

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
