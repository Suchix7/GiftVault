import { motion, AnimatePresence } from "framer-motion";
import { X, Copy } from "lucide-react";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { Button } from "@/components/ui/button";

export default function QrCodeModal({ isOpen, onClose, qrToken, voucher, customerEmail }) {
  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrToken);
    } catch (error) {
      console.error("Failed to copy QR token:", error);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white text-slate-900 rounded-[2rem] p-6 w-full max-w-md relative shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Voucher QR Token</h2>
            <p className="text-sm text-slate-500 mt-2">
              Scan this QR at vendor checkout to complete redemption.
            </p>
          </div>

          <div className="mb-6 flex flex-col items-center gap-4">
            {qrToken ? (
              <QRCode
                value={qrToken}
                size={240}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
            ) : (
              <div className="h-60 w-60 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 text-sm">
                No QR token available
              </div>
            )}
            <div className="w-full text-left space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Customer Email</p>
              <p className="text-sm font-semibold text-slate-900 break-all">{customerEmail}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Voucher Code</p>
              <p className="text-sm font-mono text-slate-900 break-all">{voucher?.decryptedCode || voucher?.code || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" className="flex-1" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" /> Copy QR Token
            </Button>
            <Button type="button" className="flex-1 bg-slate-900 text-white hover:bg-slate-800" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
