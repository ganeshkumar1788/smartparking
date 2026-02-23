"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon issue smoothly on the client
const initializeIcons = async () => {
    if (typeof window === 'undefined') return;
    const L = (await import("leaflet")).default;
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
};

// We create a strictly-client subset of the Map that actually uses leaflet internally
const ClientLeafletMap = dynamic(
    () => import('./ClientMap.jsx'),
    { ssr: false, loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl" /> }
);


export default function ParkingMap({ spaces = [], center = [28.6139, 77.2090], onSpaceClick, onMapClick }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        initializeIcons();
    }, []);

    const mapCenter = center;

    if (!isMounted) {
        return (
            <div className="h-64 w-full overflow-hidden rounded-xl z-0 bg-gray-200/20 animate-pulse flex items-center justify-center">
                <span className="text-sm opacity-50">Loading Map...</span>
            </div>
        );
    }

    return (
        <div className="h-64 w-full overflow-hidden rounded-xl z-0">
            <ClientLeafletMap spaces={spaces} center={mapCenter} onSpaceClick={onSpaceClick} onMapClick={onMapClick} />
        </div>
    );
}
