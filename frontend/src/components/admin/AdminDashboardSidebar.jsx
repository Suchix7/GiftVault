import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AdminDashboardSidebar({
  navItems,
  currentPage,
  setCurrentPage,
  setSearchTerm,
}) {
  return (
    <>
      <aside className="hidden lg:flex w-64 border-r border-gray-100 bg-white flex-col z-50 shrink-0">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-black p-2 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">AdminVault</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setSearchTerm("");
              }}
              className={cn(
                "relative flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all rounded-2xl group",
                currentPage === item.id
                  ? "text-black"
                  : "text-gray-400 hover:text-gray-900",
              )}
            >
              {currentPage === item.id && (
                <motion.div
                  layoutId="admin-nav"
                  className="absolute inset-0 bg-gray-50 rounded-2xl -z-10 border border-gray-100"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon size={18} /> {item.label}
              {currentPage === item.id && (
                <div className="ml-auto w-1 h-1 bg-black rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-gray-50">
          <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100 mb-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Session Active
            </p>
            <p className="text-xs font-bold text-gray-900 truncate uppercase tracking-tighter">
              Root Admin
            </p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 flex items-center justify-between px-6 font-black uppercase tracking-tighter">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} />
          <span>AdminVault</span>
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setSearchTerm("");
              }}
              className="relative flex flex-col items-center justify-center w-12 h-12 transition-all"
            >
              <span className={isActive ? "text-black scale-110" : "text-gray-400"}>
                <item.icon size={20} />
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
