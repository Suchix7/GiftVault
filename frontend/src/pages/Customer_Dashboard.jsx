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

export default function CustomerDashboard() {
  const [activeView, setActiveView] = useState("vouchers");
  const [activeTab, setActiveTab] = useState("active");
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch("/vouchers");
        const data = await response.json();
        setVouchers(data);

        // // Mock data - remove when using real API
        // const mockVouchers = [
        //   {
        //     id: "1",
        //     amount: 50,
        //     merchant: "Acme Gift Co",
        //     description: "Holiday Special - Use for any holiday purchase",
        //     expiryDate: "2025-05-02",
        //     status: "active",
        //     code: "GIFT50",
        //   },
        //   {
        //     id: "2",
        //     amount: 25,
        //     merchant: "Premium Vouchers Ltd",
        //     description: "Birthday Gift - Happy Birthday!",
        //     expiryDate: "2025-06-01",
        //     status: "active",
        //   },
        //   {
        //     id: "3",
        //     amount: 100,
        //     merchant: "Luxury Gifts",
        //     description: "Anniversary Special - Celebrate your day",
        //     expiryDate: "2024-12-31",
        //     status: "expired",
        //   },
        //   {
        //     id: "4",
        //     amount: 75,
        //     merchant: "Global Gifts",
        //     description: "Summer Sale - Limited time offer",
        //     expiryDate: "2024-08-15",
        //     status: "redeemed",
        //   },
        // ];

        // setVouchers(mockVouchers);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const filteredVouchers = vouchers.filter(
    (voucher) => voucher.status === activeTab
  );

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        {vouchers.map((voucher) => (
          <Card
            key={voucher.id}
            className="border-border hover:shadow-md transition-shadow"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <span className="font-bold">${voucher.amount}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {voucher.status.charAt(0).toUpperCase() +
                    voucher.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {voucher.merchant}
              </p>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <p className="text-sm line-clamp-2">{voucher.description}</p>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <span className="mr-1">📅</span>
                Expires: {formatDate(voucher.expiryDate)}
              </div>
              {voucher.code && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">Code:</p>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {voucher.code}
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button
                size="sm"
                className="w-full"
                disabled={voucher.status !== "active"}
              >
                {voucher.status === "active" ? "Redeem" : "Already Redeemed"}
              </Button>
            </CardFooter>
          </Card>
        ))}
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
                  <VoucherCards vouchers={filteredVouchers} status="active" />
                )}
              </TabsContent>

              <TabsContent value="redeemed" className="mt-4 pb-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Redeemed Vouchers
                </h2>
                {isLoading ? (
                  <p>Loading vouchers...</p>
                ) : (
                  <VoucherCards vouchers={filteredVouchers} status="redeemed" />
                )}
              </TabsContent>

              <TabsContent value="expired" className="mt-4 pb-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Expired Vouchers
                </h2>
                {isLoading ? (
                  <p>Loading vouchers...</p>
                ) : (
                  <VoucherCards vouchers={filteredVouchers} status="expired" />
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
