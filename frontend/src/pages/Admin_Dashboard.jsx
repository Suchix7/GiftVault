"use client";

import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import { toast } from "sonner";
import AdminDashboardSidebar from "@/components/admin/AdminDashboardSidebar";
import AdminDashboardContent from "@/components/admin/AdminDashboardContent";
import { LayoutDashboard, Users, ShieldCheck, BarChart2 } from "lucide-react";

// ==========================================
// SUB-COMPONENTS: MODALS & CARDS
// ==========================================

// ==========================================
// MAIN COMPONENT EXPORT
// ==========================================

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

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
    fetchAnalytics();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api
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

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.get("/vouchers/admin/analytics");
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error("Analytics fetch failed", err);
    } finally {
      setAnalyticsLoading(false);
    }
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

        const res = await api.patch(`/users/${editingUser._id}`, updateData);
        setUsers(
          users.map((user) =>
            user._id === editingUser._id ? res.data.user : user,
          ),
        );
      } else {
        if (!userData.name || !userData.email || !userData.password)
          throw new Error("All fields required");
        const res = await api.post("/users", {
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
      await api.delete(`/users/${userToDelete._id}`);
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
      await api.patch(`/users/approve/${vendorId}`, {
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
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "vendors", label: "Vendors", icon: Users },
    { id: "customers", label: "Customers", icon: Users },
    { id: "admins", label: "Admins", icon: ShieldCheck },
  ];


  return (
    <div className="flex h-screen bg-[#FBFBFB] text-[#1D1D1F] font-sans selection:bg-black selection:text-white overflow-hidden relative">
      <AdminDashboardSidebar
        navItems={navItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setSearchTerm={setSearchTerm}
      />

      <AdminDashboardContent
        currentPage={currentPage}
        users={users}
        setUsers={setUsers}
        loading={loading}
        error={error}
        analytics={analytics}
        analyticsLoading={analyticsLoading}
        onRefreshAnalytics={fetchAnalytics}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        creatingUserType={creatingUserType}
        setCreatingUserType={setCreatingUserType}
        isViewModalOpen={isViewModalOpen}
        setIsViewModalOpen={setIsViewModalOpen}
        viewingUser={viewingUser}
        setViewingUser={setViewingUser}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        userToDelete={userToDelete}
        setUserToDelete={setUserToDelete}
        createUser={createUser}
        handleDeleteUser={handleDeleteUser}
        toggleApprovalStatus={toggleApprovalStatus}
      />
    </div>
  );
}
