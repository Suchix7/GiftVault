"use client"
import { LayoutDashboard, Gift, Share2, BarChart3, SettingsIcon, LogOut } from "lucide-react"
import { cn } from "../lib/utils"

const Sidebar = ({ currentPage, onPageChange, vendorLogo }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "vouchers", label: "Vouchers", icon: <Gift className="h-5 w-5" /> },
    { id: "distribution", label: "Distribution", icon: <Share2 className="h-5 w-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon className="h-5 w-5" /> },
  ]

  return (
    (<div
      className="w-56 bg-black text-white flex flex-col h-full border-r border-gray-800">
      <div className="p-4 flex items-center gap-2 border-b border-gray-800">
        <div className="bg-white rounded-md p-1">
          <Gift className="h-5 w-5 text-black" />
        </div>
        <h1 className="text-xl font-bold">GiftVault</h1>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-2 text-sm",
                  currentPage === item.id
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}>
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>)
  );
}

export default Sidebar

