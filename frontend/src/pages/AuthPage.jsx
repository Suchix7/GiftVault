import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Gift, ArrowLeft } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("user");
  const navigate = useNavigate();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  const validateForm = (formData) => {
    const newErrors = {};
    const email = formData.get("email");
    const password = formData.get("password");

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = "Password must contain at least one symbol";
    }

    if (!isLogin) {
      const name = formData.get("name");
      const confirmPassword = formData.get("confirmPassword");

      // Name validation
      if (!name) {
        newErrors.name =
          activeTab === "vendor"
            ? "Business name is required"
            : "Full name is required";
      }

      // Confirm password validation
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const email = formData.get("email");
      const password = formData.get("password");
      const role = activeTab;

      if (isLogin) {
        // Simulate login API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate username taken error (for demo)
        if (email === "taken@example.com") {
          throw new Error("Email is already registered");
        }

        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "vendor") navigate("/vendor/dashboard");
        else navigate("/user/dashboard");
      } else {
        // Register logic
        const name = formData.get("name");

        // Simulate registration API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate username taken error (for demo)
        if (email === "taken@example.com") {
          throw new Error("Email is already registered");
        }

        if (role === "vendor") {
          setErrors({
            ...errors,
            form: "Vendor account submitted for approval",
          });
        } else {
          setErrors({ ...errors, form: "Account created successfully!" });
        }
        setIsLogin(true);
      }
    } catch (err) {
      setErrors({ ...errors, form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Link
          to="/landingpage"
          className="absolute top-4 left-4 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex flex-col items-center mb-8">
          <Gift className="h-10 w-10 text-black mb-2" />
          <h1 className="text-3xl font-bold text-gray-800">GiftVault</h1>
          <p className="text-gray-500 mt-1">
            {isLogin ? "Welcome back!" : "Join us today"}
          </p>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? "Login" : "Register"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Access your account to continue"
                : "Create a new account to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full mb-6">
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="vendor">Vendor</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login" : "register"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleSubmit}>
                    <input type="hidden" name="role" value={activeTab} />
                    <div className="space-y-4">
                      {errors.form && (
                        <p
                          className={`text-sm text-center ${
                            errors.form.includes("success")
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {errors.form}
                        </p>
                      )}

                      {!isLogin && (
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            {activeTab === "vendor"
                              ? "Business Name"
                              : "Full Name"}
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder={
                              activeTab === "vendor"
                                ? "Your business name"
                                : "Your full name"
                            }
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">
                              {errors.name}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                        />
                        {errors.password && (
                          <p className="text-sm text-red-500">
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {!isLogin && (
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirm Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                          />
                          {errors.confirmPassword && (
                            <p className="text-sm text-red-500">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      )}

                      {activeTab === "vendor" && !isLogin && (
                        <p className="text-sm text-gray-500">
                          Vendor accounts require administrator approval.
                        </p>
                      )}

                      <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={isLoading}
                      >
                        {isLoading
                          ? isLogin
                            ? "Signing in..."
                            : "Creating account..."
                          : isLogin
                          ? "Sign In"
                          : "Create Account"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-center">
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Sign in"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
