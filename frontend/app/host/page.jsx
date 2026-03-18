"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { RoleGuard } from "../../components/RoleGuard";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import WelcomeAnimation from "../../components/WelcomeAnimation";
import QRScanner from "../../components/QRScanner";

const ParkingMap = dynamic(() => import("../../components/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-2xl bg-surface-100 dark:bg-surface-800 animate-pulse flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )
});

// Icons
const Icons = {
  building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  scan: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 20h2v-4H6v4zm6-6h2v-4h-2v4zm-6 0h2v-4H6v4zm12-6h2V4h-2v4zM6 10h2V4H6v6zm6-6h2V4h-2v4z" />
    </svg>
  ),
  search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  location: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  money: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  copy: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  camera: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
};

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
  const [configuringCameraFor, setConfiguringCameraFor] = useState(null);
  const [cameraUrl, setCameraUrl] = useState("");
  const [cameraErrors, setCameraErrors] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);

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

  // AI: Get market rate (median price of all public spaces for smart pricing suggestion)
  const [marketRate, setMarketRate] = useState(null);

  const fetchMarketRate = async () => {
    try {
      const data = await apiRequest("/spaces");
      if (data.spaces && data.spaces.length > 0) {
        const prices = data.spaces.map(s => s.pricePerHour || 0).sort((a, b) => a - b);
        const mid = Math.floor(prices.length / 2);
        const median = prices.length % 2 !== 0 ? prices[mid] : Math.round((prices[mid - 1] + prices[mid]) / 2);
        setMarketRate(median);
      }
    } catch { /* silently ignore */ }
  };

  useEffect(() => {
    if (token) {
      load();
      fetchMarketRate();
    }
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

  const saveCameraConfig = async (spaceId) => {
    try {
      await apiRequest(`/spaces/${spaceId}`, {
        method: "PUT",
        token,
        body: {
          "liveStatus.cameraUrl": cameraUrl,
          "liveStatus.isCameraActive": true
        }
      });
      setConfiguringCameraFor(null);
      setCameraUrl("");
      setCameraErrors(prev => ({ ...prev, [spaceId]: false }));
      await load();
    } catch (err) {
      alert("Failed to update camera: " + err.message);
    }
  };

  const disableCamera = async (spaceId) => {
    try {
      await apiRequest(`/spaces/${spaceId}`, {
        method: "PUT",
        token,
        body: {
          "liveStatus.isCameraActive": false
        }
      });
      await load();
    } catch (err) {
      alert("Failed to disable camera: " + err.message);
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
          text: `Check-In Successful!`,
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
            text: `Check-Out Complete!`,
            details: {
              name: booking.userId?.name || "Guest",
              vehicle: booking.vehicleNumber,
              total: `₹${checkOutRes.summary.totalAmount}`,
              fee: `₹${checkOutRes.summary.commission}`,
              netEarning: `₹${checkOutRes.summary.hostEarning}`,
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
      setScanMessage({ type: 'error', text: `Scan Failed: ${err.message}` });
      setTimeout(() => { setScanMessage(null); resumeScanner(); }, 4000);
    }
  };

  const copyHostLink = async () => {
    if (!user?._id) return;
    const link = `${window.location.origin}/host/${user._id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <RoleGuard role="host">
      <WelcomeAnimation>
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Host Dashboard</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-surface-500">Verification Status:</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${user?.hostVerified
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                    {user?.hostVerified ? <Icons.check /> : <Icons.clock />}
                    {user?.hostVerified ? "Verified" : "Pending Approval"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="glass-card px-6 py-4 rounded-2xl bg-gradient-to-br from-accent-teal/10 to-primary-500/10 border-accent-teal/20">
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold gradient-text">₹{earnings.toLocaleString()}</p>
                </div>
                <div className="glass-card px-6 py-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Active Spaces</p>
                    <p className="text-3xl font-bold text-surface-900 dark:text-white">{spaces.length}</p>
                  </div>
                  {user?._id && (
                    <button
                      onClick={copyHostLink}
                      className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      {copiedLink ? <Icons.check /> : <Icons.copy />}
                      {copiedLink ? "Link Copied!" : "Share Profile Link"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex gap-2 p-1.5 bg-surface-100 dark:bg-surface-800 rounded-2xl w-full max-w-md">
            {[
              { id: "spaces", label: "Manage Spaces", icon: Icons.building },
              { id: "scanner", label: "Scan QR", icon: Icons.scan },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                  ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                  }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {activeTab === "spaces" && (
              <motion.div
                key="spaces"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Add New Parking Space</h2>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <form onSubmit={searchLocation} className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                            <Icons.search />
                          </div>
                          <input
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="Search city/area to center map"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSearchingLocation}
                          className="btn-primary py-2.5 px-4 text-sm disabled:opacity-50"
                        >
                          {isSearchingLocation ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Icons.search />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={useMyLocation}
                          className="btn-secondary p-2.5"
                          title="Use GPS"
                        >
                          <Icons.location />
                        </button>
                      </form>

                      <div className="h-72 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700">
                        <ParkingMap
                          center={[form.latitude, form.longitude]}
                          spaces={[{ _id: "preview", latitude: form.latitude, longitude: form.longitude, title: "New Spot Preview", pricePerHour: form.pricePerHour || 0 }]}
                          onMapClick={handleMapClick}
                        />
                      </div>
                      <p className="text-xs text-center text-surface-500">Click on the map to set the exact location</p>
                    </div>

                    <form onSubmit={addSpace} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Parking Title</label>
                        <input
                          required
                          className="input-field"
                          placeholder="e.g. My Driveway"
                          value={form.title}
                          onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Address</label>
                        <input
                          required
                          className="input-field"
                          placeholder="e.g. 123 Main St, New Delhi"
                          value={form.address}
                          onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Latitude</label>
                          <input
                            required
                            type="number"
                            step="any"
                            className="input-field"
                            value={form.latitude}
                            onChange={(e) => setForm((s) => ({ ...s, latitude: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Longitude</label>
                          <input
                            required
                            type="number"
                            step="any"
                            className="input-field"
                            value={form.longitude}
                            onChange={(e) => setForm((s) => ({ ...s, longitude: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Price per Hour (₹)</label>
                        {marketRate && (
                          <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <span className="text-xs">🤖</span>
                            <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                              AI Suggestion: Market rate is <strong>₹{marketRate}/hr</strong> in your area
                            </span>
                          </div>
                        )}
                        <input
                          required
                          type="number"
                          min="0"
                          className="input-field"
                          placeholder={marketRate ? `Suggested: ₹${marketRate}` : "50"}
                          value={form.pricePerHour}
                          onChange={(e) => setForm((s) => ({ ...s, pricePerHour: e.target.value }))}
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
                        <label className="block text-sm font-semibold text-surface-900 dark:text-white mb-3">Parking Capacity</label>
                        {form.capacities.map((cap, idx) => (
                          <div key={idx} className="flex gap-2 mb-3">
                            <select
                              className="flex-1 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-surface-900 dark:text-white"
                              value={cap.type}
                              onChange={(e) => updateCapacity(idx, 'type', e.target.value)}
                            >
                              <option value="car">Car</option>
                              <option value="bike">Bike</option>
                              <option value="ev">EV Charging</option>
                              <option value="truck">Truck</option>
                            </select>
                            <input
                              type="number"
                              min="1"
                              className="w-24 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-surface-900 dark:text-white"
                              value={cap.count}
                              onChange={(e) => updateCapacity(idx, 'count', Number(e.target.value))}
                            />
                            {form.capacities.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setForm({ ...form, capacities: form.capacities.filter((_, i) => i !== idx) })}
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                              >
                                <Icons.close />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, capacities: [...form.capacities, { type: 'car', count: 1 }] })}
                          className="flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700"
                        >
                          <Icons.plus />
                          Add Vehicle Type
                        </button>
                      </div>

                      {error && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-sm">
                          {error}
                        </div>
                      )}

                      <button type="submit" className="w-full btn-primary py-3">
                        Publish Space
                      </button>
                    </form>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                  {/* Subtle background glow for the whole section */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                      <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                        Your Active Listings
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      </h2>
                      <p className="text-sm text-surface-500 mt-1">Manage spaces and monitor live feeds</p>
                    </div>
                    <span className="text-sm font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 px-4 py-1.5 rounded-full border border-surface-200 dark:border-surface-700">
                      {spaces.length} space{spaces.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 relative z-10">
                    {spaces.map((space, index) => (
                      <motion.article
                        key={space._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, ease: "easeOut" }}
                        className="group relative bg-white dark:bg-[#0a0f1e]/80 rounded-2xl p-1 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5"
                      >
                        {/* Premium animated border effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-surface-200 to-surface-100 dark:from-surface-700 dark:to-surface-800 group-hover:from-primary-400 group-hover:to-accent-teal transition-colors duration-500 opacity-50 dark:opacity-30" />
                        
                        <div className="relative h-full bg-white dark:bg-surface-900 rounded-[14px] p-5 flex flex-col">
                          {/* Header area */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-surface-900 dark:text-white leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {space.title}
                              </h3>
                              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 flex items-center gap-1.5 line-clamp-1">
                                <Icons.location /> {space.address}
                              </p>
                            </div>
                            <div className="flex flex-col items-end shrink-0 ml-4">
                              <span className="text-sm font-bold bg-gradient-to-r from-primary-500 to-accent-teal text-transparent bg-clip-text">
                                ₹{space.pricePerHour}
                              </span>
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-surface-400">per hr</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                              <Icons.car /> {space.slots?.length || 0} slots
                            </span>
                          </div>

                          <div className="mt-auto pt-5 border-t border-surface-100 dark:border-surface-800/50">
                            {space.liveStatus?.isCameraActive ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${cameraErrors[space._id] ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'}`}>
                                    <div className={`w-2 h-2 rounded-full ${cameraErrors[space._id] ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]' : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse'}`} />
                                    <span className={`text-xs font-bold tracking-wide uppercase ${cameraErrors[space._id] ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                      {cameraErrors[space._id] ? 'Signal Lost' : 'Live Cam'}
                                    </span>
                                  </div>
                                  <button onClick={() => disableCamera(space._id)} className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-all">
                                    Disconnect
                                  </button>
                                </div>
                                
                                <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-inner ring-1 ring-white/10">
                                  {/* Camera feed placeholder pattern */}
                                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                                  <img 
                                    src={space.liveStatus.cameraUrl} 
                                    alt="Live feed" 
                                    className="w-full h-full object-cover relative z-10" 
                                    onError={(e) => { 
                                      e.target.style.display='none'; 
                                      if(e.target.nextSibling) e.target.nextSibling.style.display='flex'; 
                                      setCameraErrors(prev => ({ ...prev, [space._id]: true }));
                                    }}
                                    onLoad={(e) => {
                                      e.target.style.display='block';
                                      if(e.target.nextSibling) e.target.nextSibling.style.display='none';
                                      if(cameraErrors[space._id]) setCameraErrors(prev => ({ ...prev, [space._id]: false }));
                                    }}
                                  />
                                  <div className="absolute inset-0 hidden z-0 items-center justify-center flex-col text-surface-500">
                                    <Icons.camera />
                                    <span className="text-xs mt-2 font-medium">Signal Lost</span>
                                  </div>
                                  
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-end p-3">
                                    <span className="text-white/90 text-[10px] font-medium tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-sm bg-black/30 px-2 py-1 rounded-md">
                                      <Icons.scan /> Feed Active
                                    </span>
                                  </div>
                                </div>
                                
                                {space.liveStatus.occupancy?.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {space.liveStatus.occupancy.map((occ, i) => (
                                      <div key={i} className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md border ${occ.isOccupied ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' : 'bg-surface-50 border-surface-200 text-surface-600 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${occ.isOccupied ? 'bg-rose-500' : 'bg-surface-400 dark:bg-surface-500'}`} />
                                        Slot {occ.slotId}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-full flex flex-col justify-center">
                                {configuringCameraFor === space._id ? (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 bg-surface-50 dark:bg-surface-800/50 p-3 rounded-xl border border-surface-200 dark:border-surface-700">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-surface-500">Camera Stream URL</label>
                                    <input
                                      type="url"
                                      placeholder="e.g. http://localhost:5001/video_feed"
                                      className="w-full text-sm px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                                      value={cameraUrl}
                                      onChange={(e) => setCameraUrl(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                      <button onClick={() => saveCameraConfig(space._id)} className="flex-1 text-xs font-semibold py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 shadow-md shadow-primary-500/20 transition-all active:scale-[0.98]">Connect feed</button>
                                      <button onClick={() => setConfiguringCameraFor(null)} className="flex-1 text-xs font-semibold py-2 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-all active:scale-[0.98]">Cancel</button>
                                    </div>
                                  </motion.div>
                                ) : (
                                  <button
                                    onClick={() => { setConfiguringCameraFor(space._id); setCameraUrl(space.liveStatus?.cameraUrl || ""); }}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800/30 text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-sm font-medium group"
                                  >
                                    <div className="p-1.5 rounded-lg bg-white dark:bg-surface-700 shadow-sm group-hover:text-primary-500 transition-colors">
                                      <Icons.camera />
                                    </div>
                                    Setup Live Monitor
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    ))}
                    
                    {spaces.length === 0 && (
                      <div className="md:col-span-2 relative overflow-hidden text-center py-16 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/30 rounded-2xl">
                        <div className="absolute inset-0 bg-grid-surface-200 dark:bg-grid-surface-800/30 bg-[length:24px_24px] pointer-events-none" />
                        <div className="relative z-10 w-20 h-20 mx-auto mb-5 rounded-full bg-white dark:bg-surface-800 shadow-xl shadow-surface-200/50 dark:shadow-none border border-surface-100 dark:border-surface-700 flex items-center justify-center text-surface-400 dark:text-surface-500">
                          <Icons.building />
                        </div>
                        <h4 className="text-lg font-bold text-surface-900 dark:text-white mb-2 relative z-10">No spaces listed yet</h4>
                        <p className="text-sm text-surface-500 max-w-sm mx-auto relative z-10">Use the map form above to publish your first parking space and start earning.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "scanner" && (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-3xl p-8 flex flex-col items-center min-h-[600px] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />

                <div className="text-center mb-8 max-w-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
                    <Icons.scan />
                  </div>
                  <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">QR Scanner</h2>
                  <p className="text-surface-500">
                    Scan arrival/departure tickets to automate billing and check-in/out.
                  </p>
                </div>

                <AnimatePresence>
                  {scanMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`mb-6 p-6 rounded-2xl w-full max-w-md ${scanMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' :
                        scanMessage.type === 'error' ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800' :
                          'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                        }`}
                    >
                      <p className={`text-center font-bold text-lg mb-4 ${scanMessage.type === 'success' ? 'text-emerald-800 dark:text-emerald-400' :
                        scanMessage.type === 'error' ? 'text-rose-800 dark:text-rose-400' :
                          'text-primary-800 dark:text-primary-400'
                        }`}>
                        {scanMessage.text}
                      </p>

                      {scanMessage.details && (
                        <div className="space-y-3 bg-white dark:bg-surface-800 rounded-xl p-4">
                          <div className="flex justify-between items-center pb-2 border-b border-surface-200 dark:border-surface-700">
                            <span className="text-xs font-semibold text-surface-400 uppercase">Customer</span>
                            <span className="font-semibold text-surface-900 dark:text-white">{scanMessage.details.name}</span>
                          </div>
                          {scanMessage.details.vehicle && (
                            <div className="flex justify-between items-center pb-2 border-b border-surface-200 dark:border-surface-700">
                              <span className="text-xs font-semibold text-surface-400 uppercase">Vehicle</span>
                              <span className="font-semibold text-surface-900 dark:text-white uppercase">{scanMessage.details.vehicle}</span>
                            </div>
                          )}
                          {scanMessage.details.slot && (
                            <div className="flex justify-between items-center pb-2 border-b border-surface-200 dark:border-surface-700">
                              <span className="text-xs font-semibold text-surface-400 uppercase">Slot</span>
                              <span className="font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-lg">{scanMessage.details.slot}</span>
                            </div>
                          )}
                          {scanMessage.details.total && (
                            <>
                              <div className="flex justify-between items-center pt-2 mt-2 border-t border-surface-200 dark:border-surface-700">
                                <span className="text-sm font-bold text-surface-900 dark:text-white uppercase">Gross Total</span>
                                <span className="text-lg font-bold text-surface-700 dark:text-surface-300">{scanMessage.details.total}</span>
                              </div>
                              {scanMessage.details.fee && (
                                <div className="flex justify-between items-center pb-2 border-b border-surface-200 dark:border-surface-700">
                                  <span className="text-xs font-bold text-rose-500 uppercase">Platform Fee</span>
                                  <span className="font-bold text-rose-500">-{scanMessage.details.fee}</span>
                                </div>
                              )}
                              {scanMessage.details.netEarning && (
                                <div className="flex justify-between items-center pt-2">
                                  <span className="text-sm font-bold text-surface-900 dark:text-white uppercase">Your Earnings</span>
                                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{scanMessage.details.netEarning}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="w-full max-w-md relative z-10">
                  <QRScanner onScanSuccess={handleScanSuccess} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </WelcomeAnimation>
    </RoleGuard>
  );
}
