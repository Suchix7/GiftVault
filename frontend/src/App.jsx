import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EditBook from "./pages/EditBook";
import DeleteBook from "./pages/DeleteBook";
import CreateBook from "./pages/CreateBook";
import ShowBook from "./pages/ShowBook";
import LandingPage from "./pages/LandingPage";
// import NotFoundPage from "./pages/NotFoundPage";
import AuthPage from "./pages/AuthPage";
import Customer_Dashboard from "./pages/Customer_Dashboard";
import Vendor_Dashboard from "./pages/Vendor_Dashboard";
import Admin_Dashboard from "./pages/Admin_Dashboard";
import Forbidden from "./pages/Forbidden";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/landingpage" element={<LandingPage />} />
      <Route path="/books/create" element={<CreateBook />} />
      <Route path="/books/edit/:id" element={<EditBook />} />
      <Route path="/books/details/:id" element={<ShowBook />} />
      <Route path="/books/delete/:id" element={<DeleteBook />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/customer_dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <Customer_Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor_dashboard"
        element={
          <ProtectedRoute requiredRole="vendor">
            <Vendor_Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin_dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <Admin_Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/forbidden" element={<Forbidden />} />
      {/* <Route path="*" element={<NotFoundPage />} />  */}
    </Routes>
  );
};

export default App;
