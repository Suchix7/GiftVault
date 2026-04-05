import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import React from "react";

export default function VendorDashboardSidebar({
  navItems,
  currentPage,
  setCurrentPage,
  setActiveTab,
}) {
  return (
    <>
      <aside className="hidden lg:flex w-64 border-r border-gray-100 bg-white flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-xl shadow-lg shadow-black/10 transition-transform hover:scale-105">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">
              GiftVault
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      if (item.id === "dashboard") setActiveTab("overview");
                      if (item.id === "vouchers") setActiveTab("active");
                      if (item.id === "distribution") setActiveTab("send");
                      if (item.id === "settings") setActiveTab("general");
                    }}
                    className={`relative flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all rounded-2xl group ${
                      isActive ? "text-black" : "text-gray-400 hover:text-gray-900"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-pill"
                        className="absolute inset-0 bg-gray-50 rounded-2xl -z-10 border border-gray-100"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className={`transition-colors ${isActive ? "text-black" : "text-gray-400 group-hover:text-gray-600"}`}>
                      {item.icon}
                    </span>
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="ml-auto w-1 h-1 bg-black rounded-full"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 mt-auto border-t border-gray-50">
          <div className="bg-gray-50/50 rounded-3xl p-4 border border-gray-100">
            <div className="mb-4 px-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                Identity Verified
              </p>
              <p className="text-xs font-bold text-gray-900 truncate uppercase tracking-tighter">
                Vendor Account
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-black" />
          <span className="text-sm font-black tracking-tighter uppercase">GiftVault</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">
          VA
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className="relative flex flex-col items-center justify-center w-12 h-12 transition-all"
            >
              <span className={isActive ? "text-black" : "text-gray-400"}>
                {React.cloneElement(item.icon, { size: 20 })}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-dot"
                  className="absolute -bottom-1 w-1 h-1 bg-black rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
