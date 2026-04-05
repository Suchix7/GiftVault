import { Button } from "@/components/ui/button";
import { Gift, ChevronRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

export default function CustomerVoucherCard({
  voucher,
  type,
  vendors,
  redemptionCodes,
  onRedeem,
  formatDate,
  getRedemptionDate,
}) {
  const hasCode = redemptionCodes[voucher._id];
  const isRedeemed = type === "redeemed";
  const isExpired = type === "expired";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <div
        className="w-full aspect-[1.6/1] rounded-[2rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden group"
        style={{ backgroundColor: voucher.color || "#1e293b" }}
      >
        <div className="absolute inset-2 md:inset-3 bg-black/10 backdrop-blur-md rounded-[1.8rem] md:rounded-[2rem] border border-white/10 p-5 md:p-8 flex flex-col justify-between z-10 overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-white/90 rounded-xl p-2 flex items-center justify-center shadow-lg">
              {voucher.logo ? (
                <img src={voucher.logo} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <Gift className="text-black w-5 h-5" />
              )}
            </div>
            <div className="text-right">
              <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-white/50 leading-none mb-1">
                Secure Asset
              </p>
              <p className="text-[9px] md:text-[10px] font-bold text-white uppercase truncate max-w-[80px] md:max-w-[100px]">
                {vendors[voucher.vendorId] || "Verified Partner"}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg md:text-2xl font-black tracking-tighter text-white mb-0.5 md:mb-1 uppercase truncate">
              {voucher.name}
            </h3>
            <p className="text-white/60 text-[8px] md:text-[9px] font-medium max-w-[90%] line-clamp-1 italic uppercase tracking-wider">
              {voucher.description || "Digital voucher asset reserved for holder."}
            </p>
          </div>
          <div className="flex justify-between items-end border-t border-white/10 pt-3 md:pt-4">
            <div>
              <div className="bg-white/20 px-3 py-1 rounded-full inline-block mb-1">
                <span className="text-lg md:text-xl font-black text-white tracking-tighter">
                  {voucher.type === "percentage" ? `${voucher.value}% Off` : `Rs. ${voucher.value}`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-white/40 mb-0.5">
                {isRedeemed ? "Burned On" : "Valid Thru"}
              </p>
              <p className="text-[9px] md:text-[10px] font-bold text-white uppercase">
                {isRedeemed ? formatDate(getRedemptionDate(voucher)) : formatDate(voucher.expiryDate)}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>
      <div className="px-1">
        {hasCode ? (
          <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
            <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Authorization Key</p>
            <p className="text-white font-mono text-xl font-black tracking-[0.4em]">
              {redemptionCodes[voucher._id]}
            </p>
          </div>
        ) : isRedeemed ? (
          <div className="w-full py-3 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase text-center border border-emerald-100 flex items-center justify-center gap-2">
            <ShieldCheck size={14} /> Redeemed
          </div>
        ) : isExpired ? (
          <div className="w-full py-3 rounded-2xl bg-gray-50 text-gray-400 text-[10px] font-black uppercase text-center border border-gray-100">
            Expired
          </div>
        ) : (
          <Button
            onClick={() => onRedeem(voucher)}
            className="w-full h-12 md:h-14 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            Unlock Redemption <ChevronRight size={14} />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
