import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Camera, Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import jsQR from "jsqr";

export default function QrScannerModal({ isOpen, onClose, onDecoded, hideManualInput = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const streamRef = useRef(null);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [cameraPermission, setCameraPermission] = useState("prompt");

  const isSecureOrigin =
    typeof window !== "undefined" &&
    (window.isSecureContext ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) {
      frameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code?.data) {
      handleScan(code.data);
    } else {
      frameRef.current = requestAnimationFrame(scanFrame);
    }
  };

  const requestCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera is not supported on this device.");
    }
    if (!isSecureOrigin) {
      throw new Error("Insecure origin. Camera access requires HTTPS or localhost access.");
    }
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
    } catch (firstError) {
      console.warn("Environment camera failed, falling back to any camera.", firstError);
      return await navigator.mediaDevices.getUserMedia({ video: true });
    }
  };

  const startCamera = async () => {
    try {
      stopCamera();
      setError("");
      setCameraSupported(true);
      setIsScanning(true);
      const streamResult = await requestCamera();
      streamRef.current = streamResult;
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
      }
      frameRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      console.error("Camera access failed:", err);
      const message =
        err.message === "Insecure origin. Camera access requires HTTPS or localhost access."
          ? "Camera access requires HTTPS or localhost. Open this app over https:// or use localhost."
          : err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : err.name === "NotFoundError"
          ? "No camera found on this device."
          : "Unable to access camera. Use image upload or paste token instead.";
      setError(message);
      setCameraSupported(!!navigator.mediaDevices?.getUserMedia);
      setIsScanning(false);
    }
  };

  const checkPermission = async () => {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: "camera" });
        setCameraPermission(status.state);
        status.onchange = () => setCameraPermission(status.state);
      } catch (err) {
        console.warn("Camera permission query not supported", err);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkPermission();
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      stopCamera();
    };
  }, [isOpen]);

  const handleScan = async (rawValue) => {
    if (!rawValue) return;
    try {
      await decodeToken(rawValue);
    } catch (err) {
      console.error("QR decode failed:", err);
      setError("Scanned QR token is invalid or expired.");
    }
  };

  const decodeToken = async (qrToken) => {
    try {
      // Direct pass-through for unencrypted JSON payloads or simple strings
      // Format: loyalty-reward|userId|vendorId
      if (qrToken && typeof qrToken === "string" && qrToken.startsWith("loyalty-reward|")) {
        const parts = qrToken.split("|");
        if (parts.length === 3) {
          onDecoded({
            type: "loyalty_reward",
            userId: parts[1],
            vendorId: parts[2],
          });
          onClose();
          return;
        }
      }

      // Format: dynamic-loyalty|token
      if (qrToken && typeof qrToken === "string" && qrToken.startsWith("dynamic-loyalty|")) {
        const parts = qrToken.split("|");
        if (parts.length === 2) {
          onDecoded({
            type: "dynamic_loyalty",
            token: parts[1],
          });
          onClose();
          return;
        }
      }

      // Format: URL-based verification token (e.g., http://.../verify?token=...)
      if (qrToken && typeof qrToken === "string" && qrToken.includes("/verify?token=")) {
        const url = new URL(qrToken);
        const tokenVal = url.searchParams.get("token");
        if (tokenVal) {
          onDecoded({
            type: "dynamic_loyalty",
            token: tokenVal,
          });
          onClose();
          return;
        }
      }

      const response = await api.post("/vouchers/decode-qr", { qrToken });
      if (response.data?.success && response.data.payload) {
        onDecoded(response.data.payload);
        onClose();
      } else {
        setError(response.data?.message || "Failed to decode QR token.");
      }
    } catch (err) {
      console.error("Decode QR API error:", err);
      setError(err.response?.data?.message || "Failed to decode QR token.");
    }
  };

  const scanCanvas = (canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(imageData.data, imageData.width, imageData.height);
  };

  const tryDecodeCanvas = (canvas) => {
    const attempt = (sourceCanvas) => scanCanvas(sourceCanvas);
    let code = attempt(canvas);
    if (code?.data) return code;

    const normalizeCanvas = (sourceCanvas, targetSize) => {
      const scale = Math.min(targetSize / sourceCanvas.width, targetSize / sourceCanvas.height);
      if (scale <= 0 || scale === 1) return null;
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = Math.max(1, Math.round(sourceCanvas.width * scale));
      scaledCanvas.height = Math.max(1, Math.round(sourceCanvas.height * scale));
      const scaledCtx = scaledCanvas.getContext("2d");
      if (!scaledCtx) return null;
      scaledCtx.drawImage(sourceCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      return scaledCanvas;
    };

    const tryRotation = (sourceCanvas, degree) => {
      const rotatedCanvas = document.createElement("canvas");
      if (degree % 180 === 0) {
        rotatedCanvas.width = sourceCanvas.width;
        rotatedCanvas.height = sourceCanvas.height;
      } else {
        rotatedCanvas.width = sourceCanvas.height;
        rotatedCanvas.height = sourceCanvas.width;
      }
      const rotatedCtx = rotatedCanvas.getContext("2d");
      if (!rotatedCtx) return null;
      rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
      rotatedCtx.rotate((degree * Math.PI) / 180);
      rotatedCtx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
      return scanCanvas(rotatedCanvas);
    };

    const sizes = [1200, 800, 600, 400];
    for (const size of sizes) {
      const normalized = normalizeCanvas(canvas, size);
      if (!normalized) continue;
      code = attempt(normalized);
      if (code?.data) return code;
      for (const degree of [90, 180, 270]) {
        code = tryRotation(normalized, degree);
        if (code?.data) return code;
      }
    }

    for (const degree of [90, 180, 270]) {
      code = tryRotation(canvas, degree);
      if (code?.data) return code;
    }

    return null;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      const image = new Image();
      image.onload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const code = tryDecodeCanvas(canvas);
        if (code?.data) {
          handleScan(code.data);
        } else {
          setError("No QR code found in the selected image. Try a clearer photo or crop the QR region.");
        }
      };
      image.onerror = () => {
        setError("Unable to read the selected image. Please choose a different file.");
      };
      image.src = loadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-[2rem] p-4 sm:p-6 w-full max-w-[44rem] max-h-[calc(100vh-1.5rem)] overflow-y-auto shadow-2xl relative"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Scan Voucher QR</h2>
              <p className="text-sm text-slate-500 mt-2">
                Use your device camera to scan the encrypted voucher QR token.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-4">
                <div className="bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 aspect-[4/3] min-h-[220px]">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    autoPlay
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="button"
                      className="w-full sm:w-auto"
                      onClick={async () => {
                        setError("");
                        await startCamera();
                      }}
                    >
                      {isScanning ? "Restart Scan" : "Open Camera"}
                    </Button>
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl cursor-pointer w-full sm:w-auto">
                      <Upload className="h-4 w-4" /> Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p className="font-semibold">Camera status</p>
                    <p>
                      {isScanning
                        ? "Scanning using your device camera."
                        : "Tap Open Camera to request access and start scanning."}
                    </p>
                    <p className="text-slate-500">Permission state: {cameraPermission}</p>
                    <p className="text-slate-500">Camera support: {cameraSupported ? "Supported" : "Not supported"}</p>
                  </div>
                  {error && <p className="text-sm text-rose-600">{error}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 text-white rounded-3xl p-5 min-h-[16rem] flex flex-col justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-3">Scanner Status</p>
                    <p className="text-2xl font-bold">{isScanning ? "Scanning..." : error ? "Camera paused" : "Ready"}</p>
                    <p className="mt-3 text-sm text-slate-400">
                      {isScanning
                        ? "Point the camera at the QR code."
                        : error
                        ? "Please resolve the camera access issue or use upload/paste." 
                        : "If the camera cannot be accessed, upload a QR image or paste the token."}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 text-slate-100">
                        <Camera className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-[0.3em]">Live scan supported</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-100">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-[0.3em]">Encrypted token decode</span>
                      </div>
                    </div>
                    {!hideManualInput && (
                      <div className="space-y-3">
                        <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Paste QR token</label>
                        <textarea
                          rows={4}
                          value={manualToken}
                          onChange={(e) => setManualToken(e.target.value)}
                          placeholder="Paste extracted QR token here"
                          className="w-full min-h-[8rem] rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                        />
                        <Button type="button" onClick={() => handleScan(manualToken)} className="w-full">
                          Decode Token
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
