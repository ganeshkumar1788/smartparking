"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";

export default function QRScanner({ onScanSuccess, onScanError }) {
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [hasCamera, setHasCamera] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const stopScanner = useCallback(async () => {
        try {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.stop();
            }
            if (html5QrCodeRef.current) {
                await html5QrCodeRef.current.clear();
            }
        } catch (e) {
            // Ignore cleanup errors
        }
        html5QrCodeRef.current = null;
        setHasCamera(false);
    }, []);

    const startCamera = useCallback(async (html5QrCode, cameraIdOrConstraint, config) => {
        const onSuccess = (decodedText, decodedResult) => {
            if (onScanSuccess) {
                html5QrCode.pause(true);
                onScanSuccess(decodedText, decodedResult, () => {
                    try { html5QrCode.resume(); } catch (e) { }
                });
            }
        };
        const onError = () => { }; // Suppress per-frame "no QR found" errors

        await html5QrCode.start(cameraIdOrConstraint, config, onSuccess, onError);
    }, [onScanSuccess]);

    useEffect(() => {
        if (!isScanning) return;

        let cancelled = false;

        const init = async () => {
            setCameraError(null);
            setHasCamera(false);

            // Wait a tick for the DOM element to mount
            await new Promise(r => setTimeout(r, 100));

            if (cancelled || !scannerRef.current) return;

            const html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCodeRef.current = html5QrCode;

            const config = {
                fps: 20,
                qrbox: (w, h) => {
                    const size = Math.floor(Math.min(w, h) * 0.72);
                    return { width: size, height: size };
                },
                aspectRatio: 1.0,
                experimentalFeatures: { useBarCodeDetectorIfSupported: true }
            };

            // 1st attempt: back/environment camera (works on phones and some laptops)
            try {
                await startCamera(html5QrCode, { facingMode: "environment" }, config);
                if (!cancelled) setHasCamera(true);
                return;
            } catch (e1) {
                console.warn("environment camera failed, trying user-facing:", e1);
            }

            // 2nd attempt: front camera (most common on laptops)
            try {
                await startCamera(html5QrCode, { facingMode: "user" }, config);
                if (!cancelled) setHasCamera(true);
                return;
            } catch (e2) {
                console.warn("user camera failed, enumerating devices:", e2);
            }

            // 3rd attempt: enumerate and use first available camera
            try {
                const cameras = await Html5Qrcode.getCameras();
                if (!cameras || cameras.length === 0) throw new Error("No cameras found");
                await startCamera(html5QrCode, cameras[0].id, config);
                if (!cancelled) setHasCamera(true);
            } catch (e3) {
                console.error("All camera attempts failed:", e3);
                if (!cancelled) {
                    setCameraError("Could not access camera. Please check permissions.");
                    if (onScanError) onScanError(e3);
                }
            }
        };

        init();

        return () => {
            cancelled = true;
            stopScanner();
        };
    }, [isScanning, startCamera, stopScanner, onScanError]);

    const handleStop = () => {
        setIsScanning(false);
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {!isScanning ? (
                    <motion.div
                        key="start"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="text-center p-8 bg-white/40 backdrop-blur-md border-2 border-dashed border-smartBlue/30 rounded-[2rem] w-full max-w-sm shadow-xl"
                    >
                        <motion.div
                            initial={{ y: 0 }}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-5xl mb-6 block"
                        >
                            📷
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Secure Scan System</h3>
                        <p className="text-sm text-gray-500 mb-8 px-4">Ready to verify digital tickets. Click to activate your camera.</p>
                        <button
                            onClick={() => setIsScanning(true)}
                            className="w-full bg-gradient-to-r from-smartBlue to-blue-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-2xl hover:shadow-smartBlue/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>Enable Scanner</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="reader"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-md bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
                    >
                        {/* Header bar */}
                        <div className="bg-smartBlue/90 backdrop-blur-sm text-white text-center py-4 font-bold relative">
                            <span className="flex items-center justify-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${hasCamera ? 'bg-red-400 animate-pulse' : cameraError ? 'bg-orange-400' : 'bg-yellow-300 animate-pulse'}`}></span>
                                {hasCamera ? 'Live Lens Active' : cameraError ? 'Camera Error' : 'Starting Camera…'}
                            </span>
                            <button
                                onClick={handleStop}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                            >
                                Stop
                            </button>
                        </div>

                        {/* Camera viewport */}
                        <div className="relative bg-black min-h-[400px] flex items-start justify-center overflow-hidden">
                            <div id="qr-reader" ref={scannerRef} className="w-full !border-none"></div>

                            {/* Animated scan line overlay (shown only when camera is live) */}
                            {hasCamera && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute left-0 w-full h-[3px] bg-smartBlue shadow-[0_0_20px_rgba(59,130,246,0.9)] animate-scan-line"></div>
                                    <div className="absolute inset-[10%] border-2 border-smartBlue/30 rounded-2xl"></div>
                                </div>
                            )}

                            {/* Error state overlay */}
                            {cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 p-6">
                                    <span className="text-4xl">🚫</span>
                                    <p className="text-white/80 text-sm text-center">{cameraError}</p>
                                    <button
                                        onClick={() => { setIsScanning(false); setTimeout(() => setIsScanning(true), 200); }}
                                        className="mt-2 bg-smartBlue text-white px-5 py-2 rounded-full text-sm font-bold"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-900 text-center">
                            <p className="text-[11px] font-black text-smartBlue uppercase tracking-[0.3em] animate-pulse">
                                SmartPark Vision™ Active
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                #qr-reader {
                    border: none !important;
                    width: 100% !important;
                    background: transparent !important;
                }
                #qr-reader video {
                    width: 100% !important;
                    max-height: 450px !important;
                    object-fit: cover !important;
                    display: block !important;
                }
                /* Hide every built-in UI chrome the library renders */
                #qr-reader__header_message,
                #qr-reader__dashboard,
                #qr-reader__filescan_input,
                #qr-reader__status_span,
                #qr-reader__camera_selection,
                .html5-qrcode-element,
                button[id^="html5-qrcode-button"] {
                    display: none !important;
                }
                .animate-scan-line {
                    animation: scanLine 2.5s ease-in-out infinite;
                }
                @keyframes scanLine {
                    0%   { top: 8%;  opacity: 0.4; }
                    50%  { opacity: 1; }
                    100% { top: 92%; opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}
