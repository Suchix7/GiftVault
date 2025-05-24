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
import KeyVerificationModal from "@/components/OtpVerificationModal";
import { toast } from "sonner";

export default function CustomerDashboard() {
  const [activeView, setActiveView] = useState("vouchers");
  const [activeTab, setActiveTab] = useState("active");
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState({});
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedVoucherForRedemption, setSelectedVoucherForRedemption] =
    useState(null);
  const [redemptionCodes, setRedemptionCodes] = useState({}); // Map to store codes for each voucher
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsUserLoading(true);
        const response = await api.get("/users/profile");
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load user profile");
      } finally {
        setIsUserLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await api.get("/vouchers/public/active");
        setVouchers(response.data.vouchers || []);
        console.log("Fetched vouchers:", response.data.vouchers);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        toast.error("Failed to load vouchers");
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

  // Helper to check if a voucher is redeemed by the current user
  const isVoucherRedeemedByUser = (voucher) => {
    if (!currentUser || !voucher?.redemptions) return false;
    return voucher.redemptions.some((r) => r.userId === currentUser._id);
  };

  // Helper to get redemption date for a voucher
  const getRedemptionDate = (voucher) => {
    if (!currentUser || !voucher?.redemptions) return null;
    const redemption = voucher.redemptions.find(
      (r) => r.userId === currentUser._id
    );
    return redemption ? new Date(redemption.redeemedAt) : null;
  };

  // Filter vouchers based on user's redemptions and codes
  const activeVouchers = vouchers.filter(
    (voucher) =>
      voucher.status === "active" &&
      !isVoucherExpired(voucher) &&
      !isVoucherRedeemedByUser(voucher)
  );

  const redeemedVouchers = vouchers.filter((voucher) =>
    isVoucherRedeemedByUser(voucher)
  );

  const expiredVouchers = vouchers.filter(
    (voucher) => isVoucherExpired(voucher) && !isVoucherRedeemedByUser(voucher)
  );

  const handleRedeemClick = (voucher) => {
    if (!currentUser) {
      toast.error("Please wait while we load your profile");
      return;
    }
    setSelectedVoucherForRedemption(voucher);
    setIsOtpModalOpen(true);
  };

  const handleKeySuccess = (code) => {
    if (!currentUser) {
      toast.error("Please wait while we load your profile");
      return;
    }

    if (selectedVoucherForRedemption) {
      // Store the redemption code for this specific voucher
      setRedemptionCodes((prev) => ({
        ...prev,
        [selectedVoucherForRedemption._id]: code,
      }));

      // Don't update the voucher's redemptions yet - it will be updated when the vendor completes the redemption
      toast.success(
        "Voucher code received! Present this code to the vendor to complete redemption."
      );
    }
  };

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
          const buttonColor = voucher.color || "#2563eb";
          const textColor = "#fff";
          const hasRedemptionCode = redemptionCodes[voucher._id];
          const isRedeemed = isVoucherRedeemedByUser(voucher);
          const redemptionDate = getRedemptionDate(voucher);
          const showRedeemButton = !hasRedemptionCode && !isRedeemed;

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
                      Rs. {voucher.value} Off
                    </div>
                  </div>

                  {(voucher.expiryDate || redemptionDate) && (
                    <div className="text-center text-white/80 text-sm">
                      {hasRedemptionCode
                        ? "Just redeemed"
                        : isRedeemed
                        ? `Redeemed on ${formatDate(redemptionDate)}`
                        : `Valid until ${formatDate(voucher.expiryDate)}`}
                    </div>
                  )}

                  {/* Modified Redeem/Show Voucher Button */}
                  {status !== "expired" && (
                    <div className="pt-4 flex justify-center">
                      {hasRedemptionCode ? (
                        <div className="text-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-2">
                            <p className="text-white text-sm mb-1">
                              Your Redemption Code:
                            </p>
                            <p className="text-white text-xl font-mono font-bold tracking-wider">
                              {redemptionCodes[voucher._id]}
                            </p>
                          </div>
                          <p className="text-white/80 text-sm">
                            Present this code at checkout
                          </p>
                        </div>
                      ) : isRedeemed ? (
                        <div className="text-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-2">
                            <p className="text-white text-sm mb-1">
                              Voucher Redeemed
                            </p>
                            <p className="text-white/80 text-sm">
                              This voucher has been used
                            </p>
                          </div>
                        </div>
                      ) : (
                        <Button
                          style={{
                            backgroundColor: buttonColor,
                            color: textColor,
                            border: "none",
                          }}
                          className="w-full font-semibold shadow hover:opacity-90"
                          disabled={voucher.status !== "active"}
                          onClick={() => handleRedeemClick(voucher)}
                        >
                          Redeem
                        </Button>
                      )}
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

  // Show loading state if either vouchers or user data is loading
  if (isLoading || isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
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

      {/* Add Key Verification Modal */}
      {isOtpModalOpen && (
        <KeyVerificationModal
          onClose={() => {
            setIsOtpModalOpen(false);
            setSelectedVoucherForRedemption(null);
          }}
          onSuccess={handleKeySuccess}
          voucherId={selectedVoucherForRedemption?._id}
        />
      )}
    </div>
  );
}
