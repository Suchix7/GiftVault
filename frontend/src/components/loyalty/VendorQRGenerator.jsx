import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Zap } from "lucide-react";
import loyaltyAPI from "@/api/loyalty";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

const VendorQRGenerator = ({ vendorId }) => {
  const [generateQRLoading, setGenerateQRLoading] = useState(false);
  const [customPoints, setCustomPoints] = useState(1);
  const [generatedQRs, setGeneratedQRs] = useState([]);

  const handleGenerateQR = async () => {
    if (!vendorId) {
      toast.error("Vendor ID not found");
      return;
    }
    
    setGenerateQRLoading(true);
    try {
      const response = await loyaltyAPI.generateQRToken(
        vendorId,
        parseInt(customPoints)
      );

      if (response.success) {
        const newQR = {
          token: response.data.token,
          points: customPoints,
          expiresAt: response.data.expiresAt,
          verifyUrl: response.data.verifyUrl,
          createdAt: new Date().toLocaleString(),
        };
        
        setGeneratedQRs([newQR, ...generatedQRs]);
        
        toast.success(`QR code generated for ${customPoints} point(s)!`);

        // Copy verification URL to clipboard
        navigator.clipboard.writeText(newQR.verifyUrl);
      }
    } catch (error) {
      console.error("Error generating QR:", error);
      const errorMsg = error.response?.data?.message || "Error generating QR code";
      toast.error(errorMsg);
    } finally {
      setGenerateQRLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Gift className="w-8 h-8 text-black" />
          Dynamic QR Generation
        </h1>
        <p className="text-gray-500 font-medium">
          Create QR codes to award points to your customers
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-10 space-y-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Zap className="w-6 h-6 text-black" />
          Generate QR Codes
        </h2>
        <p className="text-gray-500 text-sm font-medium">
          Create single-use QR codes to award points to customers. (Stamps progress will be based on your loyalty configuration.)
        </p>

        <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">
              Total Points to Award
            </label>
            <p className="text-xs text-gray-500 mb-4 font-medium">
              How many points should this QR code award to their total balance? (e.g., spending value)
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={customPoints}
                  onChange={(e) => setCustomPoints(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-black font-bold focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all"
                  placeholder="1"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateQR}
                disabled={generateQRLoading}
                className={`
                  h-14 px-8 rounded-2xl text-xs font-black uppercase tracking-[0.2em]
                  transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/5
                  ${
                    generateQRLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-900"
                  }
                `}
              >
                {generateQRLoading ? "Generating..." : "Generate QR"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Recently Generated QRs */}
        {generatedQRs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Recently Generated QRs</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {generatedQRs.map((qr, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <Zap className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {qr.points} Point{qr.points > 1 ? "s" : ""}
                        </p>
                        <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">{qr.createdAt}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(qr.verifyUrl);
                        toast.success("QR link copied!");
                      }}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100"
                      title="Copy QR link"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="flex justify-center py-4 bg-white border border-gray-100 rounded-2xl shadow-inner">
                    <QRCodeSVG
                      value={qr.verifyUrl}
                      size={200}
                      level="H"
                      includeMargin={false}
                      className="rounded-lg"
                    />
                  </div>

                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mt-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Verification URL:</p>
                    <code className="text-[10px] font-mono text-gray-600 break-all block overflow-auto max-h-12">
                      {qr.verifyUrl}
                    </code>
                  </div>
                  <div className="flex gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <span>Expires: {new Date(qr.expiresAt).toLocaleTimeString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-xs text-gray-500 space-y-3 font-medium">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">💡 Usage Examples:</p>
          <ul className="space-y-2 ml-1">
            <li>• <strong className="text-black">10 Points:</strong> For $10+ purchases</li>
            <li>• <strong className="text-black">50 Points:</strong> For $50+ purchases or bulk orders</li>
            <li>• <strong className="text-black">100 Points:</strong> For premium tier loyalty milestones</li>
            <li className="pt-2 text-[9px] font-bold tracking-widest uppercase opacity-60">The dynamic QR code is only valid for 2 minutes from generation.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorQRGenerator;
