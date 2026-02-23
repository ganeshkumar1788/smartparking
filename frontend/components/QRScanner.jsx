"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onScanSuccess, onScanError }) {
    const scannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        let html5QrcodeScanner;

        if (isScanning && scannerRef.current) {
            // Initialize scanner
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
            /* verbose= */ false
            );

            html5QrcodeScanner.render(
                (decodedText, decodedResult) => {
                    if (onScanSuccess) {
                        // To prevent rapid multiple scans, we pause the scanner briefly
                        html5QrcodeScanner.pause(true);
                        onScanSuccess(decodedText, decodedResult, () => {
                            // Callback to resume scanning after processing
                            if (html5QrcodeScanner) {
                                try { html5QrcodeScanner.resume(); } catch (e) { }
                            }
                        });
                    }
                },
                (error) => {
                    if (onScanError) onScanError(error);
                }
            );
        }

        return () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner", error);
                });
            }
        };
    }, [isScanning, onScanSuccess, onScanError]);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            {!isScanning ? (
                <div className="text-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl w-full max-w-sm">
                    <span className="text-4xl mb-4 block">📷</span>
                    <h3 className="text-lg font-bold text-gray-800">Scan Driver QR Ticket</h3>
                    <p className="text-sm text-gray-500 mb-6">Start the camera to check-in or check-out a driver.</p>
                    <button
                        onClick={() => setIsScanning(true)}
                        className="w-full bg-smartBlue text-white font-semibold py-3 px-6 rounded-xl hover:bg-smartBlue/90 shadow-lg transition-transform active:scale-95"
                    >
                        Start Scanner
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-smartBlue text-white text-center py-3 font-semibold relative">
                        Scanning Ticket
                        <button
                            onClick={() => setIsScanning(false)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                        >
                            Close
                        </button>
                    </div>
                    <div id="qr-reader" className="w-full" ref={scannerRef}></div>
                    <p className="text-xs text-center text-gray-500 p-3 bg-gray-50">Point camera at the driver's QR code.</p>
                </div>
            )}
        </div>
    );
}
