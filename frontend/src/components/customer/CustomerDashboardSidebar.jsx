import { motion } from "framer-motion";
import { Gift, Zap } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import React from "react";

export default function CustomerDashboardSidebar({
  activeView,
  setActiveView,
  currentUser,
  navItems,
  globalTotalPoints = 0,
}) {
  return (
    <>
      <aside className="hidden lg:flex w-64 border-r border-gray-100 bg-white flex-col z-50">
        <div className="p-8 mb-4 flex items-center gap-3">
          <div className="bg-black p-2 rounded-xl shadow-lg">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">
            GiftVault
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`relative flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all rounded-2xl group ${
                activeView === item.id
                  ? "text-black"
                  : "text-gray-400 hover:text-gray-900"
              }`}
            >
              {activeView === item.id && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-gray-50 rounded-2xl -z-10 border border-gray-100"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {item.icon} {item.label}
              {activeView === item.id && (
                <div className="ml-auto w-1 h-1 bg-black rounded-full" />
              )}
            </button>
          ))}
        </nav>
        <div className="p-6 mt-auto border-t border-gray-50">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-4 text-[10px] font-bold">
            <p className="text-gray-400 uppercase mb-1">Verified User</p>
            <p className="text-gray-900 truncate">{currentUser?.name}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 flex items-center justify-between px-6 lg:px-10 font-black uppercase tracking-tighter">
        <div className="flex items-center gap-2 lg:hidden">
          <Gift size={18} />
          <span>GiftVault</span>
        </div>
        <div className="hidden lg:block text-xs text-gray-500">
          Global Wallet
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-400 font-bold hidden lg:inline">TOTAL LOYALTY POINTS</span>
          <div className="text-[10px] lg:text-xs bg-black text-white px-3 py-1 lg:py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Zap size={12} className="text-yellow-400" />
            <span>{globalTotalPoints} PTS</span>
          </div>
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="relative flex flex-col items-center justify-center w-12 h-12 transition-all"
            >
              <span className={isActive ? "text-black scale-110" : "text-gray-400"}>
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
