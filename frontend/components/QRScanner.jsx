"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsQR from "jsqr";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const CameraIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const AlertIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const BoltIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const QRIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={1.8} />
    <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={1.8} />
    <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={1.8} />
    <path strokeLinecap="round" strokeWidth={1.8} d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" />
  </svg>
);

// ─── Corner Brackets ──────────────────────────────────────────────────────────
const CornerBrackets = ({ color = "#3b82f6" }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300" preserveAspectRatio="none">
    <path d="M30 70 L30 30 L70 30" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M230 30 L270 30 L270 70" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M30 230 L30 270 L70 270" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M270 230 L270 270 L230 270" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function QRScanner({ onScanSuccess, onScanError }) {
  // phase: idle | activating | scanning | success | error
  const [phase, setPhase] = useState("idle");
  const [cameraError, setCameraError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [hasCamera, setHasCamera] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafId = useRef(null);

  // ─── Stop everything ──────────────────────────────────────────────────────
  const stopScanner = useCallback(() => {
    if (rafId.current) { cancelAnimationFrame(rafId.current); rafId.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) { videoRef.current.srcObject = null; }
    setHasCamera(false);
  }, []);

  // ─── Frame scan loop ──────────────────────────────────────────────────────
  const startScanning = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let barcodeDetector = null;
    if ("BarcodeDetector" in window) {
      try { barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code"] }); } catch { }
    }

    const handleSuccess = (text) => {
      const type = text.toLowerCase().includes("exit") ? "exit" : "entry";
      const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setScanResult({ text, type, time });
      setPhase("success");
      stopScanner();
      if (onScanSuccess) onScanSuccess(text, null, () => { });
    };

    const scanFrame = async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
        try {
          if (barcodeDetector) {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes.length > 0) { handleSuccess(barcodes[0].rawValue); return; }
          } else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
            if (code) { handleSuccess(code.data); return; }
          }
        } catch { }
      }
      rafId.current = requestAnimationFrame(scanFrame);
    };

    rafId.current = requestAnimationFrame(scanFrame);
  }, [onScanSuccess, stopScanner]);

  // ─── Init camera ──────────────────────────────────────────────────────────
  // NOTE: video element is ALWAYS mounted in DOM (just hidden when inactive)
  // so videoRef.current is guaranteed to exist when this runs.
  const initCamera = useCallback(async () => {
    setCameraError(null);
    setPhase("activating");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      const video = videoRef.current;

      if (!video) {
        setCameraError("Video element not ready. Please refresh.");
        setPhase("error");
        return;
      }

      video.srcObject = stream;

      let started = false;
      const onReady = () => {
        if (started) return;
        started = true;
        video.play()
          .then(() => {
            setHasCamera(true);
            setPhase("scanning");
            startScanning();
          })
          .catch((e) => {
            setCameraError("Failed to play camera stream: " + e.message);
            setPhase("error");
          });
      };

      // Multiple event listeners for cross-browser compat
      video.addEventListener("loadedmetadata", onReady, { once: true });
      video.addEventListener("canplay", onReady, { once: true });
      video.addEventListener("loadeddata", onReady, { once: true });

      // Safety timeout
      setTimeout(() => {
        if (!started) {
          onReady(); // Try to force start
        }
      }, 2000);

    } catch (err) {
      setCameraError(err.message || "Camera access denied. Please allow camera permissions.");
      setPhase("error");
      if (onScanError) onScanError(err);
    }
  }, [startScanning, onScanError]);

  useEffect(() => () => stopScanner(), [stopScanner]);

  const handleStart = () => { setScanResult(null); setCameraError(null); initCamera(); };
  const handleStop = () => { stopScanner(); setPhase("idle"); };
  const handleScanAgain = () => { setScanResult(null); setCameraError(null); setPhase("idle"); };

  const isCameraActive = phase === "activating" || phase === "scanning";

  return (
    <div className="flex flex-col items-center w-full gap-5">

      {/* ─── Video + Canvas: ALWAYS in DOM so ref is always accessible ─── */}
      {/* Only visible when camera is active */}
      <div className={isCameraActive ? "w-full max-w-sm" : "hidden"}>
        <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-900">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full transition-colors ${hasCamera ? "bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" : "bg-yellow-400 animate-pulse"}`} />
              <span className={`text-xs font-semibold uppercase tracking-widest ${hasCamera ? "text-emerald-400" : "text-yellow-400"}`}>
                {hasCamera ? "Camera Active — Ready to Scan" : "Starting Camera…"}
              </span>
            </div>
            <button onClick={handleStop}
              className="text-xs text-white/50 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">
              Stop
            </button>
          </div>

          {/* Camera viewport */}
          <div className="relative bg-black" style={{ height: 320 }}>
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="hidden" />

            {/* Loading overlay — shown while waiting for camera */}
            {!hasCamera && phase === "activating" && (
              <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-blue-800 border-t-blue-400 animate-spin" />
                <p className="text-sm text-gray-400">Connecting to camera…</p>
              </div>
            )}

            {/* Scan overlay — corner brackets + animated line */}
            {hasCamera && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />
                <div className="absolute inset-[10%]">
                  <CornerBrackets color="#3b82f6" />
                </div>
                <div
                  className="absolute left-[10%] right-[10%] h-0.5 bg-blue-500 shadow-[0_0_12px_4px_rgba(59,130,246,0.6)]"
                  style={{ animation: "scanLine 2s ease-in-out infinite", top: "10%" }}
                />
              </div>
            )}

            {/* Camera permission error overlay */}
            {cameraError && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3 p-6">
                <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertIcon />
                </div>
                <p className="text-white/70 text-xs text-center leading-relaxed">{cameraError}</p>
                <button
                  onClick={() => { setPhase("idle"); setCameraError(null); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-full transition-colors">
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 bg-gray-800 text-center">
            <p className="text-[11px] text-blue-400/80 font-medium tracking-wider uppercase animate-pulse">
              Hold QR within frame for faster scan
            </p>
          </div>
        </div>
      </div>

      {/* ─── Non-camera states ──────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Idle */}
        {phase === "idle" && (
          <motion.div key="idle"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="w-full max-w-sm bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 rounded-2xl shadow-md p-8 flex flex-col items-center gap-5"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <QRIcon />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-1">QR Scanner</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Scan a SmartPark ticket to record vehicle entry or exit instantly.
              </p>
            </div>
            {/* Scanner placeholder box */}
            <div className="relative w-48 h-48 rounded-xl bg-white border-2 border-dashed border-blue-200 shadow-inner flex items-center justify-center">
              <CornerBrackets color="#93c5fd" />
              <div className="text-center text-gray-400">
                <CameraIcon />
                <p className="text-xs mt-2 font-medium">Click below to enable</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
            >
              <BoltIcon />
              Enable Scanner
            </motion.button>
            <p className="text-[11px] text-gray-400 text-center">Hold QR code within frame for faster scan</p>
          </motion.div>
        )}

        {/* Success */}
        {phase === "success" && scanResult && (
          <motion.div key="success"
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-sm bg-white border border-emerald-100 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-5"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30"
            >
              <CheckIcon />
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                {scanResult.type === "exit" ? "Exit Recorded" : "Vehicle Entry Detected"}
              </p>
              <p className="text-sm text-emerald-600 font-medium mt-0.5">Scan Successful</p>
            </div>
            <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Scan Type</span>
                <span className="font-semibold text-gray-800">{scanResult.type === "exit" ? "🚗 Exit" : "🅿️ Entry"}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Timestamp</span>
                <span className="font-semibold text-gray-800">{scanResult.time}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={handleScanAgain}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md"
            >
              <BoltIcon /> Scan Again
            </motion.button>
          </motion.div>
        )}

        {/* Error (non-camera errors) */}
        {phase === "error" && !isCameraActive && (
          <motion.div key="err"
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-sm bg-white border border-red-100 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
              <AlertIcon />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-800">Camera Error</p>
              <p className="text-sm text-gray-500 mt-1">{cameraError || "Please scan a valid SmartPark parking ticket"}</p>
            </div>
            <button onClick={handleScanAgain}
              className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors">
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes scanLine {
          0%   { top: 10%; opacity: 0.5; }
          50%  { opacity: 1; }
          100% { top: 88%; opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
