import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, History, User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "@/components/LogoutButton";

export default function Customer_Dashboard() {
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
            className="justify-start rounded-none h-12 text-black px-4 bg-accent"
          >
            <Gift className="h-5 w-5 mr-2" />
            My Vouchers
          </Button>
          <Button
            variant="ghost"
            className="justify-start rounded-none h-12 px-4"
          >
            <History className="h-5 w-5 mr-2" />
            History
          </Button>
          <Button
            variant="ghost"
            className="justify-start rounded-none h-12 px-4"
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
        <div className="p-6">
          <h1 className="text-3xl font-bold">My Vouchers</h1>
          <p className="text-muted-foreground">
            Manage and redeem your gift vouchers
          </p>
        </div>

        <Tabs defaultValue="active" className="px-6 flex-1 overflow-auto">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Voucher Card 1 */}
              <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      <span className="font-bold">$50</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Acme Gift Co
                  </p>
                </CardHeader>

                <CardContent className="p-3 pt-0">
                  <p className="text-sm line-clamp-2">
                    Holiday Special - Use for any holiday purchase
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <span className="mr-1">📅</span>
                    Expires: 5/2/2025
                  </div>
                </CardContent>

                <CardFooter className="p-3 pt-0">
                  <Button size="sm" className="w-full">
                    Redeem
                  </Button>
                </CardFooter>
              </Card>

              {/* Voucher Card 2 */}
              <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      <span className="font-bold">$25</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Premium Vouchers Ltd
                  </p>
                </CardHeader>

                <CardContent className="p-3 pt-0">
                  <p className="text-sm line-clamp-2">
                    Birthday Gift - Happy Birthday!
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <span className="mr-1">📅</span>
                    Expires: 6/1/2025
                  </div>
                </CardContent>

                <CardFooter className="p-3 pt-0">
                  <Button size="sm" className="w-full">
                    Redeem
                  </Button>
                </CardFooter>
              </Card>

              {/* Voucher Card 3 */}
              <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      <span className="font-bold">$100</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Luxury Gifts
                  </p>
                </CardHeader>

                <CardContent className="p-3 pt-0">
                  <p className="text-sm line-clamp-2">
                    Anniversary Special - Celebrate your day
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <span className="mr-1">📅</span>
                    Expires: 12/31/2025
                  </div>
                </CardContent>

                <CardFooter className="p-3 pt-0">
                  <Button size="sm" className="w-full">
                    Redeem
                  </Button>
                </CardFooter>
              </Card>

              {/* Voucher Card 4 */}
              <Card className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      <span className="font-bold">$75</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Global Gifts
                  </p>
                </CardHeader>

                <CardContent className="p-3 pt-0">
                  <p className="text-sm line-clamp-2">
                    Summer Sale - Limited time offer
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <span className="mr-1">📅</span>
                    Expires: 8/15/2025
                  </div>
                </CardContent>

                <CardFooter className="p-3 pt-0">
                  <Button size="sm" className="w-full">
                    Redeem
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="redeemed" className="pb-6">
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              No redeemed vouchers
            </div>
          </TabsContent>

          <TabsContent value="expired" className="pb-6">
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              No expired vouchers
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
