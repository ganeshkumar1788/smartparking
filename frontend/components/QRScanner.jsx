"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import { motion, AnimatePresence } from "framer-motion";

export default function QRScanner({ onScanSuccess, onScanError }) {
    const [isScanning, setIsScanning] = useState(false);
    const [hasCamera, setHasCamera] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animationFrameId = useRef(null);

    const stopScanner = useCallback(() => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setHasCamera(false);
    }, []);

    const initCamera = useCallback(async () => {
        setCameraError(null);
        setHasCamera(false);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Important: wait for video to be ready before playing
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play().catch(e => {
                        console.error("Error playing video:", e);
                        setCameraError("Failed to play video stream");
                    });
                    setHasCamera(true);
                    startScanning();
                };
            }
        } catch (err) {
            console.error("Camera error:", err);
            setCameraError(err.message || "Could not access camera. Please check permissions.");
            if (onScanError) onScanError(err);
        }
    }, [onScanError]);

    const startScanning = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        let barcodeDetector = null;

        if ('BarcodeDetector' in window) {
            try {
                barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
            } catch (e) {
                console.warn("BarcodeDetector setup failed, falling back to jsQR");
            }
        }

        const scanFrame = async () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                // Resize canvas to match video stream dimensions once ready
                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                try {
                    // Method 1: Try hardware-accelerated BarcodeDetector first (Chrome/Android)
                    if (barcodeDetector) {
                        const barcodes = await barcodeDetector.detect(video);
                        if (barcodes.length > 0) {
                            handleSuccess(barcodes[0].rawValue);
                            return; // Stop loop
                        }
                    }
                    // Method 2: High-speed jsQR fallback (Firefox/Safari/Older devices)
                    else {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: "dontInvert",
                        });

                        if (code) {
                            handleSuccess(code.data);
                            return; // Stop loop
                        }
                    }
                } catch (e) {
                    // Ignore per-frame processing errors, just continue scanning
                }
            }

            // Loop instantly for the next frame to ensure maximum responsiveness
            animationFrameId.current = requestAnimationFrame(scanFrame);
        };

        const handleSuccess = (decodedText) => {
            if (onScanSuccess) {
                onScanSuccess(decodedText, null, () => { });
            }
            stopScanner();
            setIsScanning(false);
        };

        // Start the engine
        animationFrameId.current = requestAnimationFrame(scanFrame);

    }, [onScanSuccess, stopScanner]);

    useEffect(() => {
        if (isScanning) {
            // Need a tiny delay to ensure video/canvas refs are mounted before init
            setTimeout(initCamera, 50);
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isScanning, initCamera, stopScanner]);

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
                        <div className="bg-smartBlue/90 backdrop-blur-sm text-white text-center py-4 font-bold relative flex items-center justify-center min-h-[56px]">
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
                        <div className="relative bg-black h-[400px] flex items-center justify-center overflow-hidden">
                            <video
                                id="qr-reader"
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                autoPlay
                                playsInline
                                muted
                            ></video>
                            <canvas ref={canvasRef} className="hidden" />

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
