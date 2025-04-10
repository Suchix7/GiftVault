"use client";
import LogoutButton from "@/components/LogoutButton";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Filter,
  Check,
  X,
  Search,
  Edit,
  Trash2,
  Eye,
  LayoutDashboard,
  Plus,
  Users,
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
import { format } from "date-fns";
import { cn } from "../lib/utils";

import { toast } from "sonner";
const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">User Details</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Name
            </label>
            <p className="mt-1 text-sm">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="mt-1 text-sm">{user.email}</p>
          </div>
          {user.companyName && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Company Name
              </label>
              <p className="mt-1 text-sm">{user.companyName}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Phone
            </label>
            <p className="mt-1 text-sm">{user.number || "Not provided"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Role
            </label>
            <p className="mt-1 text-sm capitalize">{user.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Status
            </label>
            <p className="mt-1 text-sm">
              {user.isApproved ? "Approved" : "Pending Approval"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Created At
            </label>
            <p className="mt-1 text-sm">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleString()
                : "Unknown"}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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

  // Data for charts
  const userDistributionData = [
    { name: "Customers", value: totalRegularUsers },
    { name: "Vendors", value: totalVendors },
    { name: "Admins", value: totalAdmins },
  ];

  const vendorApprovalData = [
    { name: "Approved", value: approvedVendors },
    { name: "Pending", value: unapprovedVendors },
  ];

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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-6 hover:scale-[1.01] transition-transform">
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

            <div className="bg-card border border-border rounded-lg p-6 hover:scale-[1.01] transition-transform">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Customers
                  </p>
                  <h3 className="text-3xl font-bold mt-2">
                    {totalRegularUsers}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total: {approvedRegularUsers}
                  </p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 hover:scale-[1.01] transition-transform">
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

            <div className="bg-card border border-border rounded-lg p-6 hover:scale-[1.01] transition-transform">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </p>
                  <h3 className="text-3xl font-bold mt-2">{users.length}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Across all roles
                  </p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Distribution Pie Chart */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][
                              index % 4
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Vendor Approval Status Bar Chart */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Vendor Approval Status
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorApprovalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Vendors">
                      {vendorApprovalData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#00C49F" : "#FF8042"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingUserType, setCreatingUserType] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const createUser = async (userData) => {
    try {
      // Determine the role based on the user type being created
      let role;
      switch (creatingUserType) {
        case "Vendor":
          role = "vendor";
          break;
        case "Admin":
          role = "admin";
          break;
        default:
          role = "user";
      }

      if (editingUser) {
        try {
          const response = await axios.patch(
            `/users/${editingUser._id}`,
            {
              ...userData,
              role: editingUser.role, // Keep the original role when editing
            },
            {
              withCredentials: true,
            }
          );

          console.log(response.data); // Check the structure of the response

          // Update state with the new user data
          setUsers(
            users.map((user) =>
              user._id === editingUser._id ? response.data : user
            )
          );
        } catch (error) {
          console.error("Error updating user:", error);
          // Handle any error that occurs
        }
      } else {
        // Create new user
        const response = await axios.post("/users", {
          ...userData,
          role,
          isApproved: creatingUserType === "Vendor" ? false : true, // Vendors need approval
        });
        setUsers([...users, response.data]);
      }

      return true;
    } catch (error) {
      console.error("Error creating/updating user:", error);
      throw new Error(
        error.response?.data?.message ||
          (editingUser ? "Failed to update user" : "Failed to create user")
      );
    }
  };
  const CreateUserModal = ({
    isOpen,
    onClose,
    onCreate,
    userType,
    editingUser, // Add this prop
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
          password: "", // Leave password blank for edits
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
    }, [editingUser]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await onCreate(formData);
        onClose();
        if (editingUser) {
          toast("User Updated", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
              label: "Remove",
            },
          });
        } else {
          toast("User Created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
              label: "Remove",
            },
          });
        }
      } catch (error) {
        toast("Error while Updating", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Remove",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {editingUser ? "Edit User" : `Create New ${userType}`}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-input rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-input rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Password{editingUser ? " (Leave blank to keep current)" : ""}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!editingUser}
                minLength="6"
                className="w-full px-3 py-2 border border-input rounded-md"
              />
            </div>
            {userType === "Vendor" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                name="number"
                value={formData.number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-input rounded-md hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {loading
                  ? editingUser
                    ? "Updating..."
                    : "Creating..."
                  : editingUser
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  const handleCreateClick = (userType) => {
    setCreatingUserType(userType);
    setIsCreateModalOpen(true);
  };
  const handleViewUser = (user) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setCreatingUserType(
      user.role === "vendor"
        ? "Vendor"
        : user.role === "admin"
        ? "Admin"
        : "Customer"
    );
    setIsCreateModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/users/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      toast("User Deleted Successfully", {
        description: "Sunday, December 03, 2023 at 9:00 AM",
        action: {
          label: "Remove",
        },
      });
    } catch (error) {
      toast("Error Deleting User ", {
        description: "Sunday, December 03, 2023 at 9:00 AM",
        action: {
          label: "Remove",
        },
      });
    }
  };
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
        setError(err);
        toast("Error Fetching Users", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Remove",
          },
        });
        setLoading(false);
      });
  }, []);

  const toggleApprovalStatus = async (vendorId, newStatus) => {
    try {
      const response = await axios.patch(`/users/approve/${vendorId}`, {
        isApproved: newStatus,
      });

      // Update the local state to reflect the change
      setUsers(
        users.map((user) =>
          user._id === vendorId ? { ...user, isApproved: newStatus } : user
        )
      );

      toast("Approval Toggled", {
        description: "Sunday, December 03, 2023 at 9:00 AM",
        action: {
          label: "Remove",
        },
      });
    } catch (err) {
      console.error("Error updating vendor status:", err);
      toast("Error Approving User", {
        description: "Sunday, December 03, 2023 at 9:00 AM",
        action: {
          label: "Remove",
        },
      });
    }
  };

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
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 "
                onClick={() => handleCreateClick("Vendor")}
              >
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
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Approve
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider "
                        >
                          Actions
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
                          <tr key={vendor._id} className="hover:bg-muted/50 ">
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
                                {vendor.number || "No phone"}
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleApprovalStatus(
                                    vendor._id,
                                    !vendor.isApproved
                                  );
                                }}
                                className="text-primary hover:text-primary/80 cursor-pointer"
                              >
                                {vendor.isApproved ? (
                                  <X className="h-5 w-5 text-red-500" />
                                ) : (
                                  <Check className="h-5 w-5 text-green-500" />
                                )}
                              </button>
                            </td>
                            <td className="px-2 py-8 whitespace-nowrap flex justify-center gap-4 items-center text-right">
                              <button
                                onClick={() => handleViewUser(vendor)}
                                className="text-primary hover:text-primary/80"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditUser(vendor)}
                                className="text-primary hover:text-primary/80"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(vendor._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
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
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Customer Management</h1>
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                onClick={() => handleCreateClick("Customer")}
              >
                <Plus className="h-4 w-4 mr-2 inline-block" />
                Add Customer
              </button>
            </div>
            <div className="border-b border-border">
              <div className="flex space-x-1">
                <button
                  className={`px-4 py-2 ${
                    activeTab === "allCustomers"
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("allCustomers")}
                >
                  All Customers
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
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
                        Customer
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
                        Vouchers Used
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        Created At
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {users
                      .filter((user) => user.role === "user")
                      .filter((customer) => {
                        const matchesSearch =
                          searchTerm === "" ||
                          customer.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          customer.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase());

                        return matchesSearch;
                      })
                      .map((customer) => (
                        <tr key={customer._id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium">
                                  {customer.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{customer.email}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.number || "No phone"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {customer.vouchersRedeemed || 0} redeemed
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {customer.createdAt
                              ? new Date(customer.createdAt).toLocaleString()
                              : "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewUser(customer)}
                              className="text-primary hover:text-primary/80"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(customer)}
                              className="text-primary hover:text-primary/80"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(customer._id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "admins":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Admin Management</h1>
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                onClick={() => handleCreateClick("Admin")}
              >
                <Plus className="h-4 w-4 mr-2 inline-block" />
                Add Admin
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
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
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
                        Admin
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
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        Created At
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {users
                      .filter((user) => user.role === "admin")
                      .filter((admin) => {
                        const matchesSearch =
                          searchTerm === "" ||
                          admin.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          admin.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase());

                        return matchesSearch;
                      })
                      .map((admin) => (
                        <tr key={admin._id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium">{admin.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{admin.email}</div>
                            <div className="text-sm text-muted-foreground">
                              {admin.number || "No phone"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {admin.createdAt
                              ? new Date(admin.createdAt).toLocaleString()
                              : "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewUser(admin)}
                              className="text-primary hover:text-primary/80"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(admin)}
                              className="text-primary hover:text-primary/80"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(admin._id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
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
          <div className="p-4 border-t">
            <div className="mt-auto">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreatingUserType(null);
          setEditingUser(null); // Also reset editingUser when closing
        }}
        onCreate={createUser}
        userType={creatingUserType}
        editingUser={editingUser} // Pass the editingUser prop
      />
      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingUser(null);
        }}
        user={viewingUser}
      />
      <main className="flex-1 overflow-y-auto p-8">{renderContent()}</main>
    </div>
  );
};

export default Admin_Dashboard;
