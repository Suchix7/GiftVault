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
  onShowQr,
  formatDate,
  getRedemptionDate,
  currentUser,
  userPoints: propUserPoints,
}) {
  const redemptionData = redemptionCodes[voucher._id];
  const hasCode = Boolean(redemptionData?.code);
  const isRedeemed = type === "redeemed";
  const isExpired = type === "expired";

  const userPoints = propUserPoints !== undefined ? propUserPoints : (currentUser?.bonusPoints || 0);
  const isInsufficientPoints = voucher.isPaid && userPoints < voucher.pointsRequired;

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
            <div className="flex flex-col gap-1.5 items-start">
              <div className="bg-white/20 px-3 py-1 rounded-full inline-block">
                <span className="text-lg md:text-xl font-black text-white tracking-tighter">
                  {voucher.type === "percentage" ? `${voucher.value}% Off` : `Rs. ${voucher.value}`}
                </span>
              </div>
              {voucher.isPaid && (
                <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 px-2 py-0.5 rounded-full inline-flex items-center">
                  <span className="text-[9px] font-black text-yellow-300 uppercase tracking-widest">
                    Cost: {voucher.pointsRequired} pts
                  </span>
                </div>
              )}
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
          <div className="space-y-3">
            <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
              <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Authorization Key</p>
              <p className="text-white font-mono text-xl font-black tracking-[0.4em]">
                {redemptionData?.code}
              </p>
            </div>
            <Button
              onClick={() => onShowQr?.(voucher)}
              className="w-full h-12 md:h-14 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-slate-100 flex items-center justify-center gap-2"
            >
              Show Encrypted QR
            </Button>
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
            onClick={() => !isInsufficientPoints && onRedeem(voucher)}
            disabled={isInsufficientPoints}
            className={`w-full h-12 md:h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 transition-all ${
              isInsufficientPoints
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isInsufficientPoints ? (
              <>Insufficient Points ({userPoints}/{voucher.pointsRequired})</>
            ) : (
              <>Unlock Redemption <ChevronRight size={14} /></>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
