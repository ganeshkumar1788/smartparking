"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { RoleGuard } from "../../components/RoleGuard";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import QRScanner from "../../components/QRScanner";

const ParkingMap = dynamic(() => import("../../components/ParkingMap"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200/20" />
});

export default function HostPage() {
  const { token, user } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [form, setForm] = useState({
    title: "",
    address: "",
    latitude: 28.6139,
    longitude: 77.2090,
    pricePerHour: "",
    capacities: [{ type: "car", count: 1 }]
  });
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState("spaces"); // "spaces" | "scanner"
  const [scanMessage, setScanMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: '', details: null }

  const load = async () => {
    try {
      const [mySpaces, earningData] = await Promise.all([
        apiRequest("/spaces/host/my/list", { token }),
        apiRequest("/payments/host/earnings", { token })
      ]);
      setSpaces(mySpaces.spaces);
      setEarnings(earningData.totalEarnings);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const searchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchingLocation(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await resp.json();
      if (data && data.length > 0) {
        setForm(s => ({ ...s, latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }));
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const useMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setForm(s => ({ ...s, latitude: position.coords.latitude, longitude: position.coords.longitude }));
      });
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleMapClick = (lat, lng) => {
    setForm(s => ({ ...s, latitude: lat, longitude: lng }));
  };

  const addSpace = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiRequest("/spaces", {
        method: "POST",
        token,
        body: {
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          pricePerHour: Number(form.pricePerHour)
          // capacities is already an array in form
        }
      });
      // Keep previous coordinates to make adding multiple nearby spaces easier
      setForm((s) => ({ ...s, title: "", address: "", pricePerHour: "", capacities: [{ type: "car", count: 1 }] }));
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateCapacity = (index, field, value) => {
    const newCaps = [...form.capacities];
    newCaps[index][field] = value;
    setForm({ ...form, capacities: newCaps });
  };

  const handleScanSuccess = async (decodedText, decodedResult, resumeScanner) => {
    try {
      const payload = JSON.parse(decodedText);
      if (!payload.bookingId || !payload.qrToken) {
        throw new Error("Invalid QR Code format.");
      }

      setScanMessage({ type: 'info', text: 'Processing ticket...' });

      // First attempt Check-In (will fail with 400 if already checked in)
      try {
        const checkInRes = await apiRequest(`/bookings/${payload.bookingId}/check-in`, {
          method: "POST",
          token,
          body: { qrToken: payload.qrToken }
        });

        const booking = checkInRes.booking;
        setScanMessage({
          type: 'success',
          text: `✅ Check-In Successful!`,
          details: {
            name: booking.userId?.name || "Guest",
            vehicle: booking.vehicleNumber,
            slot: booking.slotId,
            phone: booking.userId?.phone || booking.phoneNumber
          }
        });
        setTimeout(() => { setScanMessage(null); resumeScanner(); }, 8000);
        return;
      } catch (checkInErr) {
        // If it says "Booking is not eligible for check-in" or "Forbidden" (if already active/checked in), try check-out.
        if (checkInErr.message.includes("not eligible") || checkInErr.message.includes("already active") || checkInErr.message.includes("Forbidden")) {
          const checkOutRes = await apiRequest(`/bookings/${payload.bookingId}/check-out`, {
            method: "POST",
            token,
            body: { qrToken: payload.qrToken }
          });

          const booking = checkOutRes.booking;
          setScanMessage({
            type: 'success',
            text: `✅ Check-Out Complete!`,
            details: {
              name: booking.userId?.name || "Guest",
              vehicle: booking.vehicleNumber,
              total: `₹${checkOutRes.summary.totalAmount}`,
              duration: `${checkOutRes.summary.durationHours} hrs`
            }
          });
          await load(); // Reload earnings
          setTimeout(() => { setScanMessage(null); resumeScanner(); }, 4000);
          return;
        } else {
          throw checkInErr; // Re-throw if it's a different error
        }
      }
    } catch (err) {
      setScanMessage({ type: 'error', text: `❌ Scan Failed: ${err.message}` });
      setTimeout(() => { setScanMessage(null); resumeScanner(); }, 4000);
    }
  };

  return (
    <RoleGuard role="host">
      <section className="space-y-6">
        <div className="glass rounded-[2rem] p-8 shadow-glass border border-white/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Host Dashboard</h1>
              <p className="mt-1 text-gray-600">
                Verification status: <span className={`font-semibold ${user?.hostVerified ? 'text-green-600' : 'text-yellow-600'}`}>{user?.hostVerified ? "✅ Verified" : "⏳ Pending Admin Approval"}</span>
              </p>
            </div>
            <div className="bg-smartTeal/10 p-4 rounded-2xl border border-smartTeal/20">
              <p className="text-sm font-medium text-smartTeal uppercase tracking-wider mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900">₹{earnings}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-2xl w-full max-w-md shadow-inner border border-gray-200/50">
          <button
            onClick={() => setActiveTab("spaces")}
            className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'spaces' ? 'bg-white shadow-md text-smartBlue scale-[1.02]' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Manage Spaces
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'scanner' ? 'bg-white shadow-md text-smartBlue scale-[1.02]' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 11v1m5-14H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
            Scan QR Ticket
          </button>
        </div>

        {activeTab === "spaces" ? (
          <>
            <div className="glass rounded-2xl p-5 shadow-glass">
              <h2 className="text-lg font-semibold mb-4">Add New Parking Space</h2>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <form onSubmit={searchLocation} className="flex gap-2">
                    <input
                      className="flex-1 rounded-xl border bg-white/50 px-3 py-2"
                      placeholder="Search city/area to center map"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" disabled={isSearchingLocation} className="rounded-xl bg-smartBlue px-3 text-sm text-white hover:bg-smartBlue/90 disabled:opacity-50">
                      Search
                    </button>
                    <button type="button" onClick={useMyLocation} className="rounded-xl border border-smartBlue/30 px-3 hover:bg-smartBlue/10" title="Use GPS">
                      📍
                    </button>
                  </form>

                  <div className="h-64 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                    <ParkingMap
                      center={[form.latitude, form.longitude]}
                      spaces={[{ _id: "preview", latitude: form.latitude, longitude: form.longitude, title: "New Spot Preview", pricePerHour: form.pricePerHour || 0 }]}
                      onMapClick={handleMapClick}
                    />
                  </div>
                  <p className="text-xs text-center opacity-70">The pin shows exactly where your space will be listed.</p>
                </div>

                <form onSubmit={addSpace} className="grid gap-3 content-start">
                  <input required className="rounded-xl border bg-transparent px-3 py-2" placeholder="Parking Title (e.g. My Driveway)" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
                  <input required className="rounded-xl border bg-transparent px-3 py-2" placeholder="Address (e.g. 123 Main St)" value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />

                  <div className="grid grid-cols-2 gap-3">
                    <input required type="number" step="any" className="rounded-xl border bg-transparent px-3 py-2" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm((s) => ({ ...s, latitude: e.target.value }))} />
                    <input required type="number" step="any" className="rounded-xl border bg-transparent px-3 py-2" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm((s) => ({ ...s, longitude: e.target.value }))} />
                  </div>

                  <input required type="number" min="0" className="rounded-xl border bg-transparent px-3 py-2" placeholder="Price per hour (₹)" value={form.pricePerHour} onChange={(e) => setForm((s) => ({ ...s, pricePerHour: e.target.value }))} />

                  <div className="bg-gray-100/50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold mb-2">Parking Capacity (Slots)</label>
                    {form.capacities.map((cap, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <select className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm" value={cap.type} onChange={(e) => updateCapacity(idx, 'type', e.target.value)}>
                          <option value="car">Car</option>
                          <option value="bike">Bike</option>
                          <option value="ev">EV</option>
                          <option value="truck">Truck</option>
                        </select>
                        <input type="number" min="1" className="w-24 rounded-xl border bg-white px-3 py-2 text-sm" placeholder="Count" value={cap.count} onChange={(e) => updateCapacity(idx, 'count', Number(e.target.value))} />
                        {form.capacities.length > 1 && (
                          <button type="button" onClick={() => setForm({ ...form, capacities: form.capacities.filter((_, i) => i !== idx) })} className="text-red-500 font-bold px-2">✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => setForm({ ...form, capacities: [...form.capacities, { type: 'car', count: 1 }] })} className="text-xs text-smartBlue font-semibold mt-1">+ Add Vehicle Type</button>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button className="rounded-xl bg-smartBlue px-4 py-3 font-semibold text-white hover:bg-smartBlue/90 mt-2">Publish Space</button>
                </form>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 shadow-glass">
              <h2 className="text-lg font-semibold mb-4">Your Active Listings</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {spaces.map((space) => (
                  <article key={space._id} className="bg-white/50 rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-smartBlue">{space.title}</h3>
                      <span className="text-xs bg-smartTeal/10 text-smartTeal px-2 py-1 rounded-full font-medium">₹{space.pricePerHour}/hr</span>
                    </div>
                    <p className="text-sm opacity-80 mt-1">{space.address}</p>
                  </article>
                ))}
                {spaces.length === 0 && <p className="text-sm opacity-70 col-span-2">No spaces created yet. Use the map above to drop a pin.</p>}
              </div>
            </div>
          </>
        ) : (
          <div className="glass rounded-[2.5rem] p-10 shadow-glass border border-white/40 flex flex-col items-center min-h-[500px] relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-smartBlue to-transparent opacity-20"></div>

            <div className="text-center mb-10 max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-smartBlue/10 text-smartBlue mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 11v1m5-14H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Entrance Verification</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Scan arrival/departure tickets to automate billing. Verification happens in real-time with end-to-end encryption.
              </p>
            </div>

            {scanMessage && (
              <div className={`mb-8 p-6 rounded-[2rem] shadow-2xl transform transition-all border-2 w-full max-w-md ${scanMessage.type === 'success' ? 'bg-green-50 border-green-200' :
                scanMessage.type === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                <p className={`text-center font-bold text-lg mb-4 ${scanMessage.type === 'success' ? 'text-green-800' : scanMessage.type === 'error' ? 'text-red-800' : 'text-blue-800'}`}>
                  {scanMessage.text}
                </p>

                {scanMessage.details && (
                  <div className="space-y-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                      <span className="text-xs font-bold text-gray-400 uppercase">Customer</span>
                      <span className="font-bold text-gray-900">{scanMessage.details.name}</span>
                    </div>
                    {scanMessage.details.vehicle && (
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                        <span className="text-xs font-bold text-gray-400 uppercase">Vehicle</span>
                        <span className="font-bold text-gray-900 uppercase">{scanMessage.details.vehicle}</span>
                      </div>
                    )}
                    {scanMessage.details.slot && (
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                        <span className="text-xs font-bold text-gray-400 uppercase">Assigned Slot</span>
                        <span className="font-bold text-smartBlue bg-smartBlue/10 px-2 py-0.5 rounded-lg">{scanMessage.details.slot}</span>
                      </div>
                    )}
                    {scanMessage.details.phone && (
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                        <span className="text-xs font-bold text-gray-400 uppercase">Contact</span>
                        <span className="font-bold text-gray-900">{scanMessage.details.phone}</span>
                      </div>
                    )}
                    {scanMessage.details.total && (
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-bold text-gray-900 uppercase">Bill Amount</span>
                        <span className="text-xl font-black text-green-600">{scanMessage.details.total}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="w-full relative z-10">
              <QRScanner onScanSuccess={handleScanSuccess} />
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 w-full text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Powered by SmartPark Vision™ Engine</p>
            </div>
          </div>
        )}
      </section>
    </RoleGuard>
  );
}
