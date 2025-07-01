import React from "react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import {
  GiftIcon,
  ShieldCheckIcon,
  UsersIcon,
  SmileIcon,
  StarIcon,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GiftIcon className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GiftVault</span>
          </div>
          <div className="space-x-2">
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Secure Gift Voucher Distribution
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Create, manage, and distribute digital gift vouchers with advanced
              security and tracking features.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:scale-[1.01] transition-transform hover:bg-gray-50">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Secure Encryption
                </h3>
                <p className="text-muted-foreground">
                  All vouchers are protected with AES encryption and image
                  steganography for maximum security.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:scale-[1.01] transition-transform hover:bg-gray-50">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <UsersIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Multi-User Platform
                </h3>
                <p className="text-muted-foreground">
                  Dedicated interfaces for admins, vendors, and users with
                  role-specific features.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:scale-[1.01] transition-transform hover:bg-gray-50">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <GiftIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Redemption</h3>
                <p className="text-muted-foreground">
                  Users can quickly redeem vouchers through our web or mobile
                  interface with instant verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* New: Testimonials Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              What Our Customers & Vendors Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border rounded-lg p-6 bg-card shadow hover:scale-[1.01] transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <SmileIcon className="h-5 w-5 text-primary" />
                  <p className="font-semibold">Sita R., Customer</p>
                </div>
                <p className="text-muted-foreground italic">
                  "GiftVault made it easy to send birthday vouchers to my team.
                  They loved the experience!"
                </p>
              </div>
              <div className="border rounded-lg p-6 bg-card shadow hover:scale-[1.01] transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <StarIcon className="h-5 w-5 text-primary" />
                  <p className="font-semibold">Ram B., Vendor - Burger Hub</p>
                </div>
                <p className="text-muted-foreground italic">
                  "As a vendor, managing vouchers is now streamlined. The
                  redemption tracking feature is incredibly helpful."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* New: Brands Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Brands That Work With Us
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              Proudly partnered with some of Nepal’s most loved food and
              beverage brands:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10 items-center justify-center">
              {[
                { src: "src/assets/brands/1.png", alt: "KFC" },
                { src: "src/assets/brands/2.png", alt: "Kafemandu" },
                { src: "src/assets/brands/3.png", alt: "Himalayan Java" },
                { src: "src/assets/brands/4.png", alt: "Silk" },
              ].map((brand, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center p-4 bg-white rounded-lg  hover:scale-[1.02] transition-transform"
                >
                  <img
                    src={brand.src}
                    alt={brand.alt}
                    className="h-32 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 bg-muted/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} GiftVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
