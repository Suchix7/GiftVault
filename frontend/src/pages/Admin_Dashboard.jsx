"use client";
import LogoutButton from "@/components/LogoutButton";
import { useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  BarChart3,
  CheckCircle,
  Filter,
  Gift,
  Key,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  Users,
  XCircle,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useToast } from "../hooks/use-toast";

// Mock data for the application
const mockVendors = [
  {
    id: 1,
    name: "Acme Inc",
    email: "contact@acmeinc.com",
    companyName: "Acme Inc",
    status: "active",
    type: "vendor",
    vouchersCreated: 25,
    vouchersRedeemed: 12,
    lastLogin: "2023-11-20T10:30:00Z",
    joinDate: "2023-01-15T08:00:00Z",
    contactPerson: "John Smith",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, Suite 100, New York, NY 10001",
    permissions: ["create_vouchers", "view_analytics", "manage_campaigns"],
    actionsPerformed: 47,
  },
  {
    id: 2,
    name: "TechGadgets",
    email: "support@techgadgets.com",
    companyName: "TechGadgets LLC",
    status: "active",
    type: "vendor",
    vouchersCreated: 18,
    vouchersRedeemed: 7,
    lastLogin: "2023-11-18T14:45:00Z",
    joinDate: "2023-02-20T09:30:00Z",
    contactPerson: "Sarah Johnson",
    phone: "+1 (555) 987-6543",
    address: "456 Tech Blvd, San Francisco, CA 94107",
    permissions: ["create_vouchers", "view_analytics"],
    actionsPerformed: 32,
  },
  {
    id: 3,
    name: "FoodDelight",
    email: "orders@fooddelight.com",
    companyName: "Food Delight Restaurants",
    status: "inactive",
    type: "vendor",
    vouchersCreated: 10,
    vouchersRedeemed: 3,
    lastLogin: "2023-10-05T11:20:00Z",
    joinDate: "2023-03-10T10:15:00Z",
    contactPerson: "Michael Brown",
    phone: "+1 (555) 456-7890",
    address: "789 Culinary St, Chicago, IL 60607",
    permissions: ["create_vouchers"],
    actionsPerformed: 15,
  },
  {
    id: 4,
    name: "FashionTrends",
    email: "info@fashiontrends.com",
    companyName: "Fashion Trends Co.",
    status: "active",
    type: "vendor",
    vouchersCreated: 32,
    vouchersRedeemed: 21,
    lastLogin: "2023-11-21T09:10:00Z",
    joinDate: "2023-01-05T11:45:00Z",
    contactPerson: "Emily Wilson",
    phone: "+1 (555) 789-0123",
    address: "321 Style Ave, Los Angeles, CA 90028",
    permissions: ["create_vouchers", "view_analytics", "manage_campaigns"],
    actionsPerformed: 56,
  },
  {
    id: 5,
    name: "HomeEssentials",
    email: "service@homeessentials.com",
    companyName: "Home Essentials Inc",
    status: "active",
    type: "vendor",
    vouchersCreated: 15,
    vouchersRedeemed: 9,
    lastLogin: "2023-11-15T16:30:00Z",
    joinDate: "2023-04-12T13:20:00Z",
    contactPerson: "David Lee",
    phone: "+1 (555) 234-5678",
    address: "567 Home St, Boston, MA 02108",
    permissions: ["create_vouchers", "view_analytics"],
    actionsPerformed: 28,
  },
];

const mockCustomers = [
  {
    id: 6,
    name: "Alice Johnson",
    email: "alice.j@example.com",
    type: "customer",
    status: "active",
    vouchersReceived: 8,
    vouchersRedeemed: 5,
    lastLogin: "2023-11-19T15:45:00Z",
    joinDate: "2023-02-10T09:20:00Z",
    phone: "+1 (555) 111-2222",
    address: "123 Main St, Apt 4B, Seattle, WA 98101",
    permissions: ["redeem_vouchers", "view_history"],
    actionsPerformed: 12,
  },
  {
    id: 7,
    name: "Robert Martinez",
    email: "robert.m@example.com",
    type: "customer",
    status: "active",
    vouchersReceived: 12,
    vouchersRedeemed: 10,
    lastLogin: "2023-11-21T10:30:00Z",
    joinDate: "2023-01-15T11:30:00Z",
    phone: "+1 (555) 333-4444",
    address: "456 Oak Ave, Miami, FL 33130",
    permissions: ["redeem_vouchers", "view_history"],
    actionsPerformed: 18,
  },
  {
    id: 8,
    name: "Jennifer Lee",
    email: "jennifer.l@example.com",
    type: "customer",
    status: "inactive",
    vouchersReceived: 5,
    vouchersRedeemed: 1,
    lastLogin: "2023-09-30T14:15:00Z",
    joinDate: "2023-03-20T10:45:00Z",
    phone: "+1 (555) 555-6666",
    address: "789 Pine St, Denver, CO 80202",
    permissions: ["redeem_vouchers"],
    actionsPerformed: 4,
  },
  {
    id: 9,
    name: "Thomas Wilson",
    email: "thomas.w@example.com",
    type: "customer",
    status: "active",
    vouchersReceived: 15,
    vouchersRedeemed: 12,
    lastLogin: "2023-11-18T09:20:00Z",
    joinDate: "2023-01-05T08:15:00Z",
    phone: "+1 (555) 777-8888",
    address: "321 Maple Rd, Austin, TX 78701",
    permissions: ["redeem_vouchers", "view_history"],
    actionsPerformed: 22,
  },
  {
    id: 10,
    name: "Sophia Garcia",
    email: "sophia.g@example.com",
    type: "customer",
    status: "active",
    vouchersReceived: 10,
    vouchersRedeemed: 7,
    lastLogin: "2023-11-20T16:40:00Z",
    joinDate: "2023-02-25T13:10:00Z",
    phone: "+1 (555) 999-0000",
    address: "654 Cedar Ln, Portland, OR 97201",
    permissions: ["redeem_vouchers", "view_history"],
    actionsPerformed: 15,
  },
];

const mockAdmins = [
  {
    id: 11,
    name: "Admin User",
    email: "admin@giftvault.com",
    type: "admin",
    role: "System Administrator",
    status: "active",
    department: "Management",
    lastLogin: "2023-11-21T08:30:00Z",
    joinDate: "2023-01-01T09:00:00Z",
    permissions: [
      "manage_users",
      "manage_vouchers",
      "manage_settings",
      "view_analytics",
      "manage_campaigns",
    ],
    actionsPerformed: 87,
  },
  {
    id: 12,
    name: "Support Admin",
    email: "support@giftvault.com",
    type: "admin",
    role: "Support Specialist",
    status: "active",
    department: "Support",
    lastLogin: "2023-11-20T09:15:00Z",
    joinDate: "2023-01-10T10:30:00Z",
    permissions: ["manage_users", "view_analytics"],
    actionsPerformed: 45,
  },
  {
    id: 13,
    name: "Marketing Admin",
    email: "marketing@giftvault.com",
    type: "admin",
    role: "Marketing Manager",
    status: "active",
    department: "Marketing",
    lastLogin: "2023-11-19T14:20:00Z",
    joinDate: "2023-02-05T11:45:00Z",
    permissions: ["manage_campaigns", "view_analytics"],
    actionsPerformed: 38,
  },
];

const mockRoles = [
  {
    id: 1,
    name: "System Administrator",
    type: "admin",
    description: "Full access to all system features and settings",
    permissions: [
      "manage_users",
      "manage_vouchers",
      "manage_settings",
      "view_analytics",
      "manage_campaigns",
    ],
    userCount: 1,
  },
  {
    id: 2,
    name: "Support Specialist",
    type: "admin",
    description: "Manage users and view analytics",
    permissions: ["manage_users", "view_analytics"],
    userCount: 1,
  },
  {
    id: 3,
    name: "Marketing Manager",
    type: "admin",
    description: "Manage campaigns and view analytics",
    permissions: ["manage_campaigns", "view_analytics"],
    userCount: 1,
  },
  {
    id: 4,
    name: "Vendor Admin",
    type: "vendor",
    description: "Create and manage vouchers, view analytics",
    permissions: ["create_vouchers", "view_analytics", "manage_campaigns"],
    userCount: 3,
  },
  {
    id: 5,
    name: "Vendor Basic",
    type: "vendor",
    description: "Create vouchers only",
    permissions: ["create_vouchers"],
    userCount: 2,
  },
  {
    id: 6,
    name: "Customer Premium",
    type: "customer",
    description: "Redeem vouchers and view history",
    permissions: ["redeem_vouchers", "view_history"],
    userCount: 4,
  },
  {
    id: 7,
    name: "Customer Basic",
    type: "customer",
    description: "Redeem vouchers only",
    permissions: ["redeem_vouchers"],
    userCount: 1,
  },
];

const mockActivityLogs = [
  {
    id: 1,
    userId: 11,
    userName: "Admin User",
    action: "User Created",
    timestamp: "2023-11-21T10:30:00Z",
    details: "Created new vendor account: TechGadgets",
  },
  {
    id: 2,
    userId: 11,
    userName: "Admin User",
    action: "Settings Updated",
    timestamp: "2023-11-21T09:45:00Z",
    details: "Updated system security settings",
  },
  {
    id: 3,
    userId: 1,
    userName: "Acme Inc",
    action: "Voucher Created",
    timestamp: "2023-11-20T15:20:00Z",
    details: "Created 10 new vouchers for Holiday Campaign",
  },
  {
    id: 4,
    userId: 7,
    userName: "Robert Martinez",
    action: "Voucher Redeemed",
    timestamp: "2023-11-20T14:10:00Z",
    details: "Redeemed voucher #V-1002 from TechGadgets",
  },
  {
    id: 5,
    userId: 12,
    userName: "Support Admin",
    action: "User Updated",
    timestamp: "2023-11-20T11:30:00Z",
    details: "Updated account details for Jennifer Lee",
  },
  {
    id: 6,
    userId: 4,
    userName: "FashionTrends",
    action: "Campaign Created",
    timestamp: "2023-11-19T16:45:00Z",
    details: "Created new Winter Sale campaign",
  },
  {
    id: 7,
    userId: 13,
    userName: "Marketing Admin",
    action: "Template Created",
    timestamp: "2023-11-19T13:15:00Z",
    details: "Created new Holiday Gift template",
  },
  {
    id: 8,
    userId: 9,
    userName: "Thomas Wilson",
    action: "Voucher Redeemed",
    timestamp: "2023-11-18T12:40:00Z",
    details: "Redeemed voucher #V-1005 from FashionTrends",
  },
  {
    id: 9,
    userId: 11,
    userName: "Admin User",
    action: "Role Created",
    timestamp: "2023-11-18T10:20:00Z",
    details: "Created new role: Marketing Manager",
  },
  {
    id: 10,
    userId: 2,
    userName: "TechGadgets",
    action: "Voucher Created",
    timestamp: "2023-11-17T14:50:00Z",
    details: "Created 5 new vouchers for Black Friday Campaign",
  },
];

const mockVoucherCampaigns = [
  {
    id: 1,
    name: "Holiday Special",
    vendor: "Acme Inc",
    status: "active",
    startDate: "2023-11-15T00:00:00Z",
    endDate: "2023-12-31T23:59:59Z",
    vouchersCreated: 50,
    vouchersRedeemed: 12,
    totalValue: 2500,
  },
  {
    id: 2,
    name: "Black Friday Sale",
    vendor: "TechGadgets LLC",
    status: "active",
    startDate: "2023-11-20T00:00:00Z",
    endDate: "2023-11-30T23:59:59Z",
    vouchersCreated: 30,
    vouchersRedeemed: 8,
    totalValue: 1500,
  },
  {
    id: 3,
    name: "New Year Promotion",
    vendor: "Fashion Trends Co.",
    status: "scheduled",
    startDate: "2023-12-26T00:00:00Z",
    endDate: "2024-01-15T23:59:59Z",
    vouchersCreated: 40,
    vouchersRedeemed: 0,
    totalValue: 2000,
  },
  {
    id: 4,
    name: "Summer Sale",
    vendor: "Home Essentials Inc",
    status: "completed",
    startDate: "2023-06-01T00:00:00Z",
    endDate: "2023-08-31T23:59:59Z",
    vouchersCreated: 60,
    vouchersRedeemed: 45,
    totalValue: 3000,
  },
  {
    id: 5,
    name: "Customer Appreciation",
    vendor: "Food Delight Restaurants",
    status: "completed",
    startDate: "2023-09-01T00:00:00Z",
    endDate: "2023-10-31T23:59:59Z",
    vouchersCreated: 25,
    vouchersRedeemed: 18,
    totalValue: 1250,
  },
];

const mockVoucherTemplates = [
  {
    id: 1,
    name: "Holiday Gift",
    category: "Seasonal",
    description: "Festive design for holiday season gifts",
    usageCount: 120,
    createdAt: "2023-10-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Birthday Celebration",
    category: "Occasion",
    description: "Colorful design for birthday gifts",
    usageCount: 85,
    createdAt: "2023-09-20T14:45:00Z",
  },
  {
    id: 3,
    name: "Corporate Reward",
    category: "Business",
    description: "Professional design for business rewards",
    usageCount: 65,
    createdAt: "2023-08-10T09:15:00Z",
  },
  {
    id: 4,
    name: "Thank You",
    category: "Occasion",
    description: "Elegant design to express gratitude",
    usageCount: 50,
    createdAt: "2023-07-05T11:20:00Z",
  },
  {
    id: 5,
    name: "Winter Sale",
    category: "Seasonal",
    description: "Winter themed design for seasonal promotions",
    usageCount: 40,
    createdAt: "2023-11-01T13:10:00Z",
  },
  {
    id: 6,
    name: "Welcome Gift",
    category: "Business",
    description: "Welcoming design for new customers",
    usageCount: 30,
    createdAt: "2023-06-15T10:45:00Z",
  },
  {
    id: 7,
    name: "Anniversary",
    category: "Occasion",
    description: "Celebratory design for anniversaries",
    usageCount: 25,
    createdAt: "2023-05-20T09:30:00Z",
  },
  {
    id: 8,
    name: "Summer Promotion",
    category: "Seasonal",
    description: "Bright summer themed design",
    usageCount: 35,
    createdAt: "2023-04-10T14:20:00Z",
  },
];

const mockSystemSettings = {
  companyName: "GiftVault",
  supportEmail: "support@giftvault.com",
  userRegistration: true,
  emailNotifications: true,
  twoFactorAuth: false,
  sessionTimeout: 30,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    expiryDays: 90,
  },
  voucherSettings: {
    defaultExpiryDays: 90,
    allowGifting: true,
    requireApproval: false,
    maxVoucherValue: 1000,
    minVoucherValue: 5,
  },
};

const mockAvailablePermissions = [
  {
    id: "manage_users",
    label: "Manage Users",
    description: "Create, edit, and delete user accounts",
  },
  {
    id: "manage_vouchers",
    label: "Manage Vouchers",
    description: "Create, edit, and delete vouchers",
  },
  {
    id: "manage_settings",
    label: "Manage Settings",
    description: "Edit system settings",
  },
  {
    id: "view_analytics",
    label: "View Analytics",
    description: "Access analytics and reports",
  },
  {
    id: "manage_campaigns",
    label: "Manage Campaigns",
    description: "Create and manage voucher campaigns",
  },
  {
    id: "create_vouchers",
    label: "Create Vouchers",
    description: "Create new vouchers",
  },
  {
    id: "redeem_vouchers",
    label: "Redeem Vouchers",
    description: "Redeem vouchers",
  },
  {
    id: "view_history",
    label: "View History",
    description: "View voucher history",
  },
];

// Main component
const Admin_Dashboard = () => {
  // State for navigation and content
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("overview");

  // State for user data
  const [users, setUsers] = useState([
    ...mockVendors,
    ...mockCustomers,
    ...mockAdmins,
  ]);
  const [roles, setRoles] = useState(mockRoles);
  const [activityLogs, setActivityLogs] = useState(mockActivityLogs);
  const [voucherCampaigns, setVoucherCampaigns] =
    useState(mockVoucherCampaigns);
  const [voucherTemplates, setVoucherTemplates] =
    useState(mockVoucherTemplates);
  const [systemSettings, setSystemSettings] = useState(mockSystemSettings);
  const [availablePermissions] = useState(mockAvailablePermissions);

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
    { id: "activity", label: "Activity Log", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

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
      case "activity":
        return "allActivity";
      case "settings":
        return "general";
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

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setActiveTab("userDetails");
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setActiveTab("roleDetails");
  };

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
    setActiveTab("campaignDetails");
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setActiveTab("templateDetails");
  };

  const handleCreateUserForm = (type) => {
    setNewUser({
      name: "",
      email: "",
      type: type,
      role: "",
      status: "active",
      companyName: "",
      department: "",
    });
    setIsCreatingUser(true);
    setActiveTab(`create${type.charAt(0).toUpperCase() + type.slice(1)}`);
  };

  const handleCreateRoleForm = () => {
    setNewRole({
      name: "",
      type: "vendor",
      description: "",
      permissions: [],
    });
    setIsCreatingRole(true);
    setActiveTab("createRole");
  };

  const handleCreateCampaignForm = () => {
    setNewCampaign({
      name: "",
      vendor: "",
      startDate: "",
      endDate: "",
      vouchersToCreate: "",
      voucherValue: "",
      template: "",
    });
    setIsCreatingCampaign(true);
    setActiveTab("createCampaign");
  };

  const handleCreateTemplateForm = () => {
    setNewTemplate({
      name: "",
      category: "Seasonal",
      description: "",
    });
    setIsCreatingTemplate(true);
    setActiveTab("createTemplate");
  };

  const handleCreateUser = () => {
    const id = users.length + 1;
    const newUserObj = {
      id,
      ...newUser,
      joinDate: new Date().toISOString(),
      lastLogin: null,
      permissions: getRolePermissions(newUser.role),
      vouchersCreated: 0,
      vouchersRedeemed: 0,
      actionsPerformed: 0,
    };

    setUsers([...users, newUserObj]);

    toast({
      title: "User Created",
      description: `${newUser.name} has been created successfully.`,
      type: "success",
    });

    // Log this activity
    const newActivity = {
      id: activityLogs.length + 1,
      userId: 11, // Admin user
      userName: "Admin User",
      action: "User Created",
      timestamp: new Date().toISOString(),
      details: `Created new ${newUser.type} account: ${newUser.name}`,
    };

    setActivityLogs([newActivity, ...activityLogs]);

    setIsCreatingUser(false);
    setActiveTab(
      `all${newUser.type.charAt(0).toUpperCase() + newUser.type.slice(1)}s`
    );
  };

  const handleCreateRole = () => {
    const id = roles.length + 1;
    const newRoleObj = {
      id,
      ...newRole,
      userCount: 0,
    };

    setRoles([...roles, newRoleObj]);

    toast({
      title: "Role Created",
      description: `${newRole.name} role has been created successfully.`,
      type: "success",
    });

    // Log this activity
    const newActivity = {
      id: activityLogs.length + 1,
      userId: 11, // Admin user
      userName: "Admin User",
      action: "Role Created",
      timestamp: new Date().toISOString(),
      details: `Created new role: ${newRole.name}`,
    };

    setActivityLogs([newActivity, ...activityLogs]);

    setIsCreatingRole(false);
    setActiveTab("allRoles");
  };

  const handleCreateCampaign = () => {
    const id = voucherCampaigns.length + 1;
    const newCampaignObj = {
      id,
      name: newCampaign.name,
      vendor: newCampaign.vendor,
      status: "scheduled",
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
      vouchersCreated: Number.parseInt(newCampaign.vouchersToCreate),
      vouchersRedeemed: 0,
      totalValue:
        Number.parseInt(newCampaign.vouchersToCreate) *
        Number.parseInt(newCampaign.voucherValue),
    };

    setVoucherCampaigns([...voucherCampaigns, newCampaignObj]);

    toast({
      title: "Campaign Created",
      description: `${newCampaign.name} campaign has been created successfully.`,
      type: "success",
    });

    // Log this activity
    const newActivity = {
      id: activityLogs.length + 1,
      userId: 11, // Admin user
      userName: "Admin User",
      action: "Campaign Created",
      timestamp: new Date().toISOString(),
      details: `Created new campaign: ${newCampaign.name}`,
    };

    setActivityLogs([newActivity, ...activityLogs]);

    setIsCreatingCampaign(false);
    setActiveTab("campaigns");
  };

  const handleCreateTemplate = () => {
    const id = voucherTemplates.length + 1;
    const newTemplateObj = {
      id,
      name: newTemplate.name,
      category: newTemplate.category,
      description: newTemplate.description,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };

    setVoucherTemplates([...voucherTemplates, newTemplateObj]);

    toast({
      title: "Template Created",
      description: `${newTemplate.name} template has been created successfully.`,
      type: "success",
    });

    // Log this activity
    const newActivity = {
      id: activityLogs.length + 1,
      userId: 11, // Admin user
      userName: "Admin User",
      action: "Template Created",
      timestamp: new Date().toISOString(),
      details: `Created new template: ${newTemplate.name}`,
    };

    setActivityLogs([newActivity, ...activityLogs]);

    setIsCreatingTemplate(false);
    setActiveTab("templates");
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId));

    toast({
      title: "User Deleted",
      description: "User has been deleted successfully.",
      type: "success",
    });

    // Log this activity
    const deletedUser = users.find((user) => user.id === userId);
    const newActivity = {
      id: activityLogs.length + 1,
      userId: 11, // Admin user
      userName: "Admin User",
      action: "User Deleted",
      timestamp: new Date().toISOString(),
      details: `Deleted user: ${deletedUser.name}`,
    };

    setActivityLogs([newActivity, ...activityLogs]);

    setSelectedUser(null);
    setActiveTab(
      `all${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}`
    );
  };

  const handleUserStatusChange = (userId, newStatus) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, status: newStatus } : user
    );

    setUsers(updatedUsers);

    if (selectedUser) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }

    toast({
      title: "Status Updated",
      description: `User status has been updated to ${newStatus}.`,
      type: "success",
    });

    // Log this activity
    const updatedUser = users.find((user) => user.id === userId);
    const newActivity = {
      id: activityLogs.length + 1,
      userId: 11, // Admin user
      userName: "Admin User",
      action: "Status Updated",
      timestamp: new Date().toISOString(),
      details: `Updated status for ${updatedUser.name} to ${newStatus}`,
    };

    setActivityLogs([newActivity, ...activityLogs]);
  };

  const handleUpdateSettings = () => {
    toast({
      title: "Settings Updated",
      description: "System settings have been updated successfully.",
      type: "success",
    });

    // Log this activity
    const newActivity = {
      id: activityLogs.length + 1,
      userId: 11, // Admin user
      userName: "Admin User",
      action: "Settings Updated",
      timestamp: new Date().toISOString(),
      details: "Updated system settings",
    };

    setActivityLogs([newActivity, ...activityLogs]);
  };

  const getRolesByType = (type) => {
    return roles.filter((role) => role.type === type);
  };

  const getRolePermissions = (roleName) => {
    const role = roles.find((r) => r.name === roleName);
    return role ? role.permissions : [];
  };

  const getUsersByType = (type) => {
    return users.filter((user) => user.type === type);
  };

  const getFilteredUsers = (type) => {
    let filteredUsers = getUsersByType(type);

    if (searchTerm) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.companyName &&
            user.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus) {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === filterStatus
      );
    }

    return filteredUsers;
  };

  const timeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} year${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} month${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} day${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} hour${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minute${interval === 1 ? "" : "s"} ago`;
    }

    return `${Math.floor(seconds)} second${seconds === 1 ? "" : "s"} ago`;
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      active: "bg-green-500/10 text-green-500",
      inactive: "bg-gray-500/10 text-gray-500",
      scheduled: "bg-blue-500/10 text-blue-500",
      completed: "bg-yellow-500/10 text-yellow-500",
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
    const vendorCount = getUsersByType("vendor").length;
    const customerCount = getUsersByType("customer").length;
    const adminCount = getUsersByType("admin").length;

    const activeVendors = getUsersByType("vendor").filter(
      (v) => v.status === "active"
    ).length;
    const activeCustomers = getUsersByType("customer").filter(
      (c) => c.status === "active"
    ).length;

    const totalVouchers = voucherCampaigns.reduce(
      (sum, campaign) => sum + campaign.vouchersCreated,
      0
    );
    const redeemedVouchers = voucherCampaigns.reduce(
      (sum, campaign) => sum + campaign.vouchersRedeemed,
      0
    );
    const redemptionRate =
      totalVouchers > 0
        ? Math.round((redeemedVouchers / totalVouchers) * 100)
        : 0;

    const totalValue = voucherCampaigns.reduce(
      (sum, campaign) => sum + campaign.totalValue,
      0
    );
    const redeemedValue = voucherCampaigns.reduce(
      (sum, campaign) =>
        sum +
        (campaign.vouchersRedeemed / campaign.vouchersCreated) *
          campaign.totalValue,
      0
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            {format(new Date(), "MMMM dd, yyyy")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Vendors
                </p>
                <h3 className="text-3xl font-bold mt-2">{vendorCount}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeVendors} active
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
                <h3 className="text-3xl font-bold mt-2">{customerCount}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeCustomers} active
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
                  Total Vouchers
                </p>
                <h3 className="text-3xl font-bold mt-2">{totalVouchers}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {redemptionRate}% redeemed
                </p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Gift className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Value
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {formatCurrency(totalValue)}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(redeemedValue)} redeemed
                </p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-border">
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
                activeTab === "recentActivity"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("recentActivity")}
            >
              Recent Activity
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "activeCampaigns"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("activeCampaigns")}
            >
              Active Campaigns
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">User Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Vendors</span>
                      <span>{vendorCount}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${
                            (vendorCount /
                              (vendorCount + customerCount + adminCount)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Customers</span>
                      <span>{customerCount}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${
                            (customerCount /
                              (vendorCount + customerCount + adminCount)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Admins</span>
                      <span>{adminCount}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${
                            (adminCount /
                              (vendorCount + customerCount + adminCount)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Voucher Redemption</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Redeemed Vouchers</span>
                      <span>
                        {redeemedVouchers} / {totalVouchers}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${redemptionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {totalVouchers - redeemedVouchers}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pending Redemption
                      </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {formatCurrency(totalValue - redeemedValue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Unredeemed Value
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Recent Users</h3>
                  <button
                    className="text-sm text-primary hover:underline"
                    onClick={() => {
                      setCurrentPage("vendors");
                      setActiveTab("allVendors");
                    }}
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {users
                    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
                    .slice(0, 5)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">
                              {user.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.type}
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={user.status} />
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Active Campaigns</h3>
                  <button
                    className="text-sm text-primary hover:underline"
                    onClick={() => {
                      setCurrentPage("vouchers");
                      setActiveTab("campaigns");
                    }}
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {voucherCampaigns
                    .filter((campaign) => campaign.status === "active")
                    .slice(0, 3)
                    .map((campaign) => (
                      <div
                        key={campaign.id}
                        className="border border-border rounded-md p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium">
                              {campaign.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {campaign.vendor}
                            </div>
                          </div>
                          <StatusBadge status={campaign.status} />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {format(new Date(campaign.endDate), "MMM dd, yyyy")}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "recentActivity" && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              <button
                className="text-sm text-primary hover:underline"
                onClick={() => {
                  setCurrentPage("activity");
                  setActiveTab("allActivity");
                }}
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {activityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">{log.userName}</div>
                      <div className="text-xs text-muted-foreground">
                        {timeAgo(log.timestamp)}
                      </div>
                    </div>
                    <div className="text-sm">{log.action}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {log.details}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "activeCampaigns" && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Active Campaigns</h3>
              <button
                className="text-sm text-primary hover:underline"
                onClick={() => {
                  setCurrentPage("vouchers");
                  setActiveTab("campaigns");
                }}
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {voucherCampaigns
                .filter((campaign) => campaign.status === "active")
                .map((campaign) => (
                  <div
                    key={campaign.id}
                    className="border border-border rounded-md p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-lg font-medium">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.vendor}
                        </div>
                      </div>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <div className="mt-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Period</span>
                        <span>
                          {format(new Date(campaign.startDate), "MMM dd")} -{" "}
                          {format(new Date(campaign.endDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Redemption Rate</span>
                        <span>
                          {campaign.vouchersRedeemed} /{" "}
                          {campaign.vouchersCreated} (
                          {campaign.vouchersCreated > 0
                            ? Math.round(
                                (campaign.vouchersRedeemed /
                                  campaign.vouchersCreated) *
                                  100
                              )
                            : 0}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{
                            width:
                              campaign.vouchersCreated > 0
                                ? `${
                                    (campaign.vouchersRedeemed /
                                      campaign.vouchersCreated) *
                                    100
                                  }%`
                                : "0%",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render vendors content
  const renderVendorsContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Vendor Management</h1>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            onClick={() => handleCreateUserForm("vendor")}
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
              Active Vendors
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "inactiveVendors"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("inactiveVendors")}
            >
              Inactive Vendors
            </button>
            {selectedUser && (
              <button
                className={`px-4 py-2 ${
                  activeTab === "userDetails"
                    ? "border-b-2 border-primary font-medium"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("userDetails")}
              >
                Vendor Details
              </button>
            )}
            {isCreatingUser && (
              <button
                className={`px-4 py-2 ${
                  activeTab === "createVendor"
                    ? "border-b-2 border-primary font-medium"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("createVendor")}
              >
                Create Vendor
              </button>
            )}
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                      Last Login
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {getFilteredUsers("vendor")
                    .filter(
                      (vendor) =>
                        activeTab === "allVendors" ||
                        (activeTab === "activeVendors" &&
                          vendor.status === "active") ||
                        (activeTab === "inactiveVendors" &&
                          vendor.status === "inactive")
                    )
                    .map((vendor) => (
                      <tr
                        key={vendor.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleUserSelect(vendor)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium">
                                {vendor.companyName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vendor.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">{vendor.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {vendor.vouchersCreated} created
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {vendor.vouchersRedeemed} redeemed
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={vendor.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {vendor.lastLogin
                            ? timeAgo(vendor.lastLogin)
                            : "Never"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-primary hover:text-primary/80"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserSelect(vendor);
                            }}
                          >
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

        {activeTab === "userDetails" && selectedUser && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedUser.companyName}</h2>
              <div className="space-x-2">
                <button
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80"
                  onClick={() => {
                    setSelectedUser(null);
                    setActiveTab("allVendors");
                  }}
                >
                  Back to List
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
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
                  {selectedUser.status === "active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6 md:col-span-2">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground mt-1">
                      {selectedUser.email}
                    </p>
                    <div className="flex items-center mt-2">
                      <StatusBadge status={selectedUser.status} />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Joined{" "}
                        {format(
                          new Date(selectedUser.joinDate),
                          "MMMM dd, yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Contact Person
                    </h4>
                    <p>{selectedUser.contactPerson || selectedUser.name}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Phone
                    </h4>
                    <p>{selectedUser.phone || "Not provided"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Address
                    </h4>
                    <p>{selectedUser.address || "Not provided"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Last Login
                    </h4>
                    <p>
                      {selectedUser.lastLogin
                        ? timeAgo(selectedUser.lastLogin)
                        : "Never"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Vouchers Created
                    </h4>
                    <p>{selectedUser.vouchersCreated}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Vouchers Redeemed
                    </h4>
                    <p>{selectedUser.vouchersRedeemed}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Actions Performed
                    </h4>
                    <p>{selectedUser.actionsPerformed}</p>
                  </div>

                  <div className="mt-6">
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
                  <div className="bg-card border border-border rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-medium mb-4">
                      Recent Activity
                    </h3>
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
                              <div className="text-sm font-medium">
                                {log.action}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {log.details}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {timeAgo(log.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))}
                      {activityLogs.filter(
                        (log) => log.userId === selectedUser.id
                      ).length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          No recent activity
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">
                      Account Actions
                    </h3>
                    <div className="space-y-2">
                      <button
                        className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center justify-center"
                        onClick={() => {
                          toast({
                            title: "Password Reset Email Sent",
                            description: `A password reset link has been sent to ${selectedUser.email}.`,
                            type: "success",
                          });

                          // Log this activity
                          const newActivity = {
                            id: activityLogs.length + 1,
                            userId: 11, // Admin user
                            userName: "Admin User",
                            action: "Password Reset",
                            timestamp: new Date().toISOString(),
                            details: `Initiated password reset for ${selectedUser.name}`,
                          };

                          setActivityLogs([newActivity, ...activityLogs]);
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
                            selectedUser.status === "active"
                              ? "inactive"
                              : "active"
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
                        onClick={() => {
                          handleDeleteUser(selectedUser.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "createVendor" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Create New Vendor</h2>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium mb-1"
                  >
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    value={newUser.companyName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, companyName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1"
                  >
                    Contact Person
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
                    htmlFor="phone"
                    className="block text-sm font-medium mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    value={newUser.phone || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium mb-1"
                  >
                    Address
                  </label>
                  <input
                    id="address"
                    value={newUser.address || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, address: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
                    <option value="">Select a role</option>
                    {getRolesByType("vendor").map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
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
                    setActiveTab("allVendors");
                  }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  disabled={
                    !newUser.name ||
                    !newUser.email ||
                    !newUser.companyName ||
                    !newUser.role
                  }
                >
                  Create Vendor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render customers content
  const renderCustomersContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            onClick={() => handleCreateUserForm("customer")}
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
            <button
              className={`px-4 py-2 ${
                activeTab === "activeCustomers"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("activeCustomers")}
            >
              Active Customers
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "inactiveCustomers"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("inactiveCustomers")}
            >
              Inactive Customers
            </button>
            {selectedUser && (
              <button
                className={`px-4 py-2 ${
                  activeTab === "userDetails"
                    ? "border-b-2 border-primary font-medium"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("userDetails")}
              >
                Customer Details
              </button>
            )}
            {isCreatingUser && (
              <button
                className={`px-4 py-2 ${
                  activeTab === "createCustomer"
                    ? "border-b-2 border-primary font-medium"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("createCustomer")}
              >
                Create Customer
              </button>
            )}
          </div>
        </div>

        {(activeTab === "allCustomers" ||
          activeTab === "activeCustomers" ||
          activeTab === "inactiveCustomers") && (
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
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                      Last Login
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {getFilteredUsers("customer")
                    .filter(
                      (customer) =>
                        activeTab === "allCustomers" ||
                        (activeTab === "activeCustomers" &&
                          customer.status === "active") ||
                        (activeTab === "inactiveCustomers" &&
                          customer.status === "inactive")
                    )
                    .map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleUserSelect(customer)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium">{customer.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">{customer.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.phone || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {customer.vouchersReceived} received
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.vouchersRedeemed} redeemed
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={customer.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {customer.lastLogin
                            ? timeAgo(customer.lastLogin)
                            : "Never"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-primary hover:text-primary/80"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserSelect(customer);
                            }}
                          >
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

        {activeTab === "createCustomer" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Create New Customer</h2>
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
                    htmlFor="phone"
                    className="block text-sm font-medium mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    value={newUser.phone || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium mb-1"
                  >
                    Address
                  </label>
                  <input
                    id="address"
                    value={newUser.address || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, address: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
                    <option value="">Select a role</option>
                    {getRolesByType("customer").map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
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
                    setActiveTab("allCustomers");
                  }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  disabled={!newUser.name || !newUser.email || !newUser.role}
                >
                  Create Customer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render admins content
  const renderAdminsContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <div className="space-x-2">
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              onClick={() => handleCreateUserForm("admin")}
            >
              <Plus className="h-4 w-4 mr-2 inline-block" />
              Add Admin
            </button>
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              onClick={handleCreateRoleForm}
            >
              <Plus className="h-4 w-4 mr-2 inline-block" />
              Add Role
            </button>
          </div>
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
            <button
              className={`px-4 py-2 ${
                activeTab === "allRoles"
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("allRoles")}
            >
              Roles
            </button>
            {selectedUser && (
              <button
                className={`px-4 py-2 ${
                  activeTab === "userDetails"
                    ? "border-b-2 border-primary font-medium"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("userDetails")}
              >
                Admin Details
              </button>
            )}
            {selectedRole && (
              <button
                className={`px-4 py-2 ${
                  activeTab === "roleDetails"
                    ? "border-b-2 border-primary font-medium"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("roleDetails")}
              >
                Role Details
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
            {isCreatingRole && (
              <button
                className={`px-4 py-2 ${
                  activeTab === "createRole"
                    ? "border-b-2 border-primary font-medium"
                    : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("createRole")}
              >
                Create Role
              </button>
            )}
          </div>
        </div>

        {activeTab === "allAdmins" && (
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
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                      Admin
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Department
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
                      Last Login
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {getFilteredUsers("admin").map((admin) => (
                    <tr
                      key={admin.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleUserSelect(admin)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium">{admin.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{admin.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{admin.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={admin.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {admin.lastLogin ? timeAgo(admin.lastLogin) : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-primary hover:text-primary/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserSelect(admin);
                          }}
                        >
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

        {activeTab === "allRoles" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Types</option>
                  <option value="admin">Admin</option>
                  <option value="vendor">Vendor</option>
                  <option value="customer">Customer</option>
                </select>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("");
                  }}
                  className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-1"
                >
                  <Filter className="h-4 w-4" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles
                .filter(
                  (role) =>
                    (!searchTerm ||
                      role.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())) &&
                    (!filterType || role.type === filterType)
                )
                .map((role) => (
                  <div
                    key={role.id}
                    className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold">{role.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {role.type}
                        </p>
                      </div>
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <p className="text-sm mt-4">{role.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {role.permissions.slice(0, 3).map((permission) => {
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
                      {role.permissions.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {role.userCount} {role.userCount === 1 ? "user" : "users"}
                    </div>
                  </div>
                ))}
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
                    {getRolesByType("admin").map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
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
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return renderDashboardContent();
      case "vendors":
        return renderVendorsContent();
      case "customers":
        return renderCustomersContent();
      case "admins":
        return renderAdminsContent();
      case "vouchers":
        return <div>Vouchers Content</div>;
      case "activity":
        return <div>Activity Log Content</div>;
      case "settings":
        return <div>Settings Content</div>;
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
