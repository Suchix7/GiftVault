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
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { useToast } from "../hooks/use-toast";
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
                  <p className="text-sm text-muted-foreground mt-1 ">
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
        // Update existing user
        const response = await axios.put(`/users/${editingUser._id}`, {
          ...userData,
          role: editingUser.role, // Keep the original role when editing
        });
        setUsers(
          users.map((user) =>
            user._id === editingUser._id ? response.data : user
          )
        );
      } else {
        // Create new user
        const response = await axios.post("/users", {
          ...userData,
          role,
          isApproved: creatingUserType === "Vendor" ? false : true, // Vendors need approval
        });
        setUsers([...users, response.data]);
      }

      toast({
        title: "Success",
        description: editingUser
          ? "User updated successfully"
          : `${creatingUserType} created successfully`,
        type: "success",
      });

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
    const { toast } = useToast();

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
          toast({
            title: "Success",
            description: "User updated successfully",
            type: "success",
          });
        } else {
          toast({
            title: "Success",
            description: `${userType} created successfully`,
            type: "success",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error.message ||
            (editingUser
              ? "Failed to update user"
              : `Failed to create ${userType}`),
          type: "error",
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
      toast({
        title: "Success",
        description: "User deleted successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        type: "error",
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

  const toggleApprovalStatus = async (vendorId, newStatus) => {
    try {
      const response = await axios.patch(`/users/${vendorId}`, {
        isApproved: newStatus,
      });

      // Update the local state to reflect the change
      setUsers(
        users.map((user) =>
          user._id === vendorId ? { ...user, isApproved: newStatus } : user
        )
      );

      toast({
        title: "Success",
        description: `Vendor ${newStatus ? true : false} successfully`,
        type: "success",
      });
    } catch (err) {
      console.error("Error updating vendor status:", err);
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        type: "error",
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
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
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
                        Vouchers Used
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
                      .filter((user) => user.role === "user")
                      .filter((customer) => {
                        const matchesSearch =
                          searchTerm === "" ||
                          customer.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          (customer.companyName &&
                            customer.companyName
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()));

                        return matchesSearch;
                      })
                      .map((customer) => (
                        <tr key={customer._id} className="hover:bg-muted/50 ">
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
                            <div className="text-sm ">
                              {customer.vouchersRedeemed || 0} redeemed
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {customer.createdAt
                              ? new Date(customer.createdAt).toLocaleString()
                              : "Never logged in"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
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
          </div>
        );
      case "admins":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Admin Management</h1>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
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
                        Vouchers Used
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
                      .filter((user) => user.role === "admin")
                      .filter((admin) => {
                        const matchesSearch =
                          searchTerm === "" ||
                          admin.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          (admin.companyName &&
                            admin.companyName
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()));

                        return matchesSearch;
                      })
                      .map((admin) => (
                        <tr key={admin._id} className="hover:bg-muted/50 ">
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
                            <div className="text-sm ">
                              {admin.vouchersRedeemed || 0} redeemed
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {admin.createdAt
                              ? new Date(admin.createdAt).toLocaleString()
                              : "Never logged in"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
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
