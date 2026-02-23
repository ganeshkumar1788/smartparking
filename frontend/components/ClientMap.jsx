"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

function MapClickReporter({ onMapClick }) {
    useMapEvents({
        click(e) {
            if (onMapClick) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

export default function ClientMap({ spaces, center = [28.6139, 77.2090], onSpaceClick, onMapClick }) {
    return (
        <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%", zIndex: 0 }}>
            {/* API-Free OpenStreetMap TileLayer */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={center} zoom={13} />
            <MapClickReporter onMapClick={onMapClick} />

            {spaces.map((space) => {
                if (!space.latitude || !space.longitude) return null;
                return (
                    <Marker
                        key={space._id}
                        position={[space.latitude, space.longitude]}
                        eventHandlers={{
                            click: () => onSpaceClick && onSpaceClick(space._id),
                        }}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong>{space.title}</strong><br />
                                ${space.pricePerHour}/hr<br />
                                <span className="text-xs opacity-75">{space.address}</span>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
