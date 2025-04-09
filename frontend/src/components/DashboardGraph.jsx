// filepath: e:\GiftVault\frontend\src\components\DashboardGraph.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DashboardGraph = ({ stats }) => {
  const data = [
    { name: "Total Users", value: stats.totalUsers },
    { name: "Customers", value: stats.totalCustomers },
    { name: "Vendors", value: stats.totalVendors },
    { name: "Pending Vendors", value: stats.pendingVendors },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DashboardGraph;