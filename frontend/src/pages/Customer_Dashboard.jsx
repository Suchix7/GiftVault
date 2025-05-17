import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, History, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "@/components/LogoutButton";
import { useState, useEffect } from "react";
import api from "@/api/axios";

export default function CustomerDashboard() {
  const [activeView, setActiveView] = useState("vouchers");
  const [activeTab, setActiveTab] = useState("active");
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState({});

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await api.get("/vouchers/public/active");
        setVouchers(response.data.vouchers || []);
        console.log("Fetched vouchers:", response.data.vouchers);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await api.get("/users/vendors/all");
        const vendorMap = {};
        (response.data.users || []).forEach((v) => {
          vendorMap[v._id] = v.name;
        });
        setVendors(vendorMap);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  const filteredVouchers = vouchers.filter(
    (voucher) => voucher.status === activeTab
  );

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper to check if a voucher is expired
  const isVoucherExpired = (voucher) => {
    if (voucher.status === "expired") return true;
    if (!voucher.expiryDate) return false;
    const expiry = new Date(voucher.expiryDate);
    const now = new Date();
    return expiry < now;
  };

  const activeVouchers = vouchers.filter(
    (voucher) => voucher.status === "active" && !isVoucherExpired(voucher)
  );

  const expiredVouchers = vouchers.filter((voucher) =>
    isVoucherExpired(voucher)
  );

  const redeemedVouchers = vouchers.filter(
    (voucher) => voucher.status === "redeemed"
  );

  const VoucherCards = ({ vouchers, status }) => {
    if (vouchers.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          No {status} vouchers
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.map((voucher) => {
          const buttonColor = voucher.color || "#2563eb"; // fallback to blue-600
          const textColor = "#fff";
          return (
            <div
              key={voucher._id}
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: voucher.color || "#1e293b" }}
            >
              <div className="p-6">
                <div className="bg-black/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-white/90 p-2 flex items-center justify-center">
                      {voucher.logo ? (
                        <img
                          src={voucher.logo}
                          alt="Vendor logo"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Gift className="h-10 w-10 text-primary" />
                      )}
                    </div>
                    <div className="mt-2 text-white text-sm font-medium">
                      {vendors[voucher.vendorId] || "Vendor"}
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold text-white">
                      {voucher.name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {voucher.description ||
                        "Voucher description will appear here"}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white font-bold text-2xl">
                      ${voucher.value}
                    </div>
                  </div>

                  {voucher.expiryDate && (
                    <div className="text-center text-white/80 text-sm">
                      Valid until {formatDate(voucher.expiryDate)}
                    </div>
                  )}

                  {voucher.code && (
                    <div className="pt-4 border-t border-white/20 text-center">
                      <p className="text-white/80 text-xs">Code:</p>
                      <p className="font-mono text-sm bg-white/10 px-2 py-1 rounded text-white">
                        {voucher.code}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/20 text-center">
                    <p className="text-white/80 text-xs">
                      Scan or present this voucher at checkout
                    </p>
                  </div>

                  {/* Redeem Button */}
                  {status !== "expired" && (
                    <div className="pt-4 flex justify-center">
                      <Button
                        style={{
                          backgroundColor: buttonColor,
                          color: textColor,
                          border: "none",
                        }}
                        className="w-full font-semibold shadow hover:opacity-90"
                        disabled={voucher.status !== "active"}
                      >
                        Redeem
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-[205px] border-r border-border bg-foreground text-background flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b border-border">
          <Gift className="h-5 w-5" />
          <span className="font-semibold">GiftVault</span>
        </div>

        <nav className="flex flex-col flex-1">
          <Button
            variant="ghost"
            className={`justify-start rounded-none h-12 px-4 ${
              activeView === "vouchers" ? "bg-accent text-black" : ""
            }`}
            onClick={() => setActiveView("vouchers")}
          >
            <Gift className="h-5 w-5 mr-2" />
            My Vouchers
          </Button>
          <Button
            variant="ghost"
            className={`justify-start rounded-none h-12 px-4 ${
              activeView === "history" ? "bg-accent text-black" : ""
            }`}
            onClick={() => setActiveView("history")}
          >
            <History className="h-5 w-5 mr-2" />
            History
          </Button>
          <Button
            variant="ghost"
            className={`justify-start rounded-none h-12 px-4 ${
              activeView === "profile" ? "bg-accent text-black" : ""
            }`}
            onClick={() => setActiveView("profile")}
          >
            <User className="h-5 w-5 mr-2" />
            Profile
          </Button>
        </nav>

        <div className="p-4 border-t">
          <div className="mt-auto">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === "vouchers" && (
          <>
            <div className="p-6">
              <h1 className="text-3xl font-bold">My Vouchers</h1>
              <p className="text-muted-foreground">
                Manage and redeem your gift vouchers
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="px-6 flex-1 overflow-auto"
            >
              <TabsList className="w-full justify-start">
                <TabsTrigger value="active" className="flex-1">
                  Active Vouchers
                </TabsTrigger>
                <TabsTrigger value="redeemed" className="flex-1">
                  Redeemed
                </TabsTrigger>
                <TabsTrigger value="expired" className="flex-1">
                  Expired
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-4 pb-6">
                <h2 className="text-2xl font-semibold mb-4">Active Vouchers</h2>
                {isLoading ? (
                  <p>Loading vouchers...</p>
                ) : (
                  <VoucherCards vouchers={activeVouchers} status="active" />
                )}
              </TabsContent>

              <TabsContent value="redeemed" className="mt-4 pb-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Redeemed Vouchers
                </h2>
                {isLoading ? (
                  <p>Loading vouchers...</p>
                ) : (
                  <VoucherCards vouchers={redeemedVouchers} status="redeemed" />
                )}
              </TabsContent>

              <TabsContent value="expired" className="mt-4 pb-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Expired Vouchers
                </h2>
                {isLoading ? (
                  <p>Loading vouchers...</p>
                ) : (
                  <VoucherCards vouchers={expiredVouchers} status="expired" />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {activeView === "history" && (
          <div className="p-6">
            <h1 className="text-3xl font-bold">Purchase History</h1>
            <p className="text-muted-foreground mt-2">
              View your past voucher purchases and redemptions
            </p>
            <div className="mt-8">
              <p>This would show your complete transaction history</p>
            </div>
          </div>
        )}

        {activeView === "profile" && (
          <div className="p-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account information and preferences
            </p>
            <div className="mt-8">
              <p>This would show your profile information and settings</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
