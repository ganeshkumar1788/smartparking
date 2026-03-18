"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { RoleGuard } from "../../components/RoleGuard";
import WelcomeAnimation from "../../components/WelcomeAnimation";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

// Leaflet requires window, so we must disable SSR for the map component
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
  filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  money: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  star: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  qr: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 20h2v-4H6v4zm6-6h2v-4h-2v4zm-6 0h2v-4H6v4zm12-6h2V4h-2v4zM6 10h2V4H6v6zm6-6h2V4h-2v4z" />
    </svg>
  ),
  close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  map: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
    </svg>
  ),
  list: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  explore: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  booking: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    completed: "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-400 border-surface-200 dark:border-surface-700",
    confirmed: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border-primary-200 dark:border-primary-800",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

// Skeleton Loading Component
const SkeletonCard = () => (
  <div className="glass-card rounded-2xl p-4 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="h-4 w-24 bg-surface-200 dark:bg-surface-700 rounded" />
      <div className="h-4 w-12 bg-surface-200 dark:bg-surface-700 rounded-full" />
    </div>
    <div className="h-3 w-full bg-surface-200 dark:bg-surface-700 rounded mb-2" />
    <div className="h-3 w-2/3 bg-surface-200 dark:bg-surface-700 rounded mb-4" />
    <div className="flex justify-between items-center">
      <div className="h-5 w-16 bg-surface-200 dark:bg-surface-700 rounded" />
      <div className="h-8 w-20 bg-surface-200 dark:bg-surface-700 rounded-lg" />
    </div>
  </div>
);

export default function DriverPage() {
  const { token } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({ maxPrice: "", vehicleType: "" });
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [activeTab, setActiveTab] = useState("explore"); // "explore" | "bookings"
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSearchedName, setLastSearchedName] = useState("New Delhi");
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default New Delhi
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    vehicleNumber: "",
    phoneNumber: "",
    expectedDurationHours: 1,
    scheduledStart: "",
    scheduledEnd: "",
    slotId: ""
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [userLocationDetected, setUserLocationDetected] = useState(false);

  const load = async () => {
    setIsFetching(true);
    try {
      const query = new URLSearchParams();
      if (filters.maxPrice) query.set("maxPrice", filters.maxPrice);
      if (filters.vehicleType) query.set("vehicleType", filters.vehicleType);
      const spacesData = await apiRequest(`/spaces?${query.toString()}`);

      // Only fetch bookings on initial load or explicitly, fetching spaces on filter is enough
      if (bookings.length === 0) {
        const bookingsData = await apiRequest("/bookings/my", { token });
        setBookings(bookingsData.bookings);
      }

      setSpaces(spacesData.spaces);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    // Simple debounce timeout
    const timeoutId = setTimeout(() => {
      load();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [token, filters.maxPrice, filters.vehicleType]); // Re-fetch when filters change (debounced)

  // AI: Auto-detect user location on first load
  useEffect(() => {
    if (userLocationDetected) return;
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setLastSearchedName('Your Location');
          setUserLocationDetected(true);
        },
        () => { /* silently fall back to New Delhi default */ }
      );
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // AI: Time-based demand prediction
  const getDemandLevel = () => {
    const hour = new Date().getHours();
    if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21)) return 'high';
    if (hour >= 11 && hour <= 16) return 'medium';
    return 'low';
  };

  // AI: Find the "best choice" space ID — nearest + below-median price combo
  const getBestSpaceId = (spaceList) => {
    if (!spaceList || spaceList.length === 0) return null;
    const sorted = [...spaceList].sort((a, b) => {
      const distA = calculateDistance(mapCenter[0], mapCenter[1], a.latitude, a.longitude);
      const distB = calculateDistance(mapCenter[0], mapCenter[1], b.latitude, b.longitude);
      const priceDiff = (a.pricePerHour || 0) - (b.pricePerHour || 0);
      return (distA - distB) * 0.6 + priceDiff * 0.4;
    });
    return sorted[0]?._id || null;
  };

  // AI: Compute median price for smart pricing insight
  const getMedianPrice = (spaceList) => {
    if (!spaceList || spaceList.length === 0) return null;
    const prices = spaceList.map(s => s.pricePerHour || 0).sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    return prices.length % 2 !== 0 ? prices[mid] : Math.round((prices[mid - 1] + prices[mid]) / 2);
  };

  const activeBooking = useMemo(() => bookings.find((b) => b.status === "active"), [bookings]);
  const activeMinutes = useMemo(() => {
    if (!activeBooking?.entryTime) return 0;
    return Math.floor((Date.now() - new Date(activeBooking.entryTime).getTime()) / 60000);
  }, [activeBooking]);

  const handleBookClick = (space) => {
    setSelectedSpace(space);
    setBookingForm({ vehicleNumber: "", phoneNumber: "", expectedDurationHours: 1, scheduledStart: "", scheduledEnd: "", slotId: "" });
    setBookedSlots([]); // Reset booked slots on new modal open
  };

  // Fetch availability when selected space or expected timings change
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedSpace) return;

      let start = new Date();
      let end = new Date();

      if (bookingForm.scheduledStart && bookingForm.scheduledEnd) {
        start = new Date(bookingForm.scheduledStart);
        end = new Date(bookingForm.scheduledEnd);
      } else {
        end.setHours(start.getHours() + Number(bookingForm.expectedDurationHours));
      }

      // Don't fetch if times are invalid
      if (start >= end) return;

      try {
        const query = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });
        const res = await apiRequest(`/bookings/space/${selectedSpace._id}/availability?${query.toString()}`);
        setBookedSlots(res.bookedSlotIds || []);

        // Auto-deselect if the currently selected slot becomes booked due to a time change
        if (bookingForm.slotId && res.bookedSlotIds?.includes(bookingForm.slotId)) {
          setBookingForm(s => ({ ...s, slotId: "" }));
        }
      } catch (err) {
        console.error("Failed to fetch availability", err);
      }
    };

    fetchAvailability();
  }, [selectedSpace, bookingForm.scheduledStart, bookingForm.scheduledEnd, bookingForm.expectedDurationHours]);

  // Harversine distance to sort by nearest
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getSortedSpaces = () => {
    return [...spaces].sort((a, b) => {
      const distA = calculateDistance(mapCenter[0], mapCenter[1], a.latitude, a.longitude);
      const distB = calculateDistance(mapCenter[0], mapCenter[1], b.latitude, b.longitude);
      return distA - distB;
    });
  };

  const nearbySpaces = useMemo(() => {
    return getSortedSpaces().filter(space => {
      return calculateDistance(mapCenter[0], mapCenter[1], space.latitude, space.longitude) <= 50;
    });
  }, [spaces, mapCenter]);

  // Search location using OpenStreetMap Nominatim API
  const searchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchingLocation(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await resp.json();
      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setLastSearchedName(searchQuery);
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
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setLastSearchedName("Your Location");
      });
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!selectedSpace) return;

    let duration = Number(bookingForm.expectedDurationHours);
    if (bookingForm.scheduledStart && bookingForm.scheduledEnd) {
      const start = new Date(bookingForm.scheduledStart);
      const end = new Date(bookingForm.scheduledEnd);
      if (start >= end) {
        alert("End time must be after start time");
        return;
      }
      duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
    }

    setIsBooking(true);
    try {
      await apiRequest("/bookings", {
        method: "POST",
        token,
        body: {
          spaceId: selectedSpace._id,
          slotId: bookingForm.slotId,
          vehicleNumber: bookingForm.vehicleNumber,
          phoneNumber: bookingForm.phoneNumber,
          expectedDurationHours: duration,
          scheduledStart: bookingForm.scheduledStart || undefined,
          scheduledEnd: bookingForm.scheduledEnd || undefined
        }
      });
      setSelectedSpace(null);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setIsSubmittingReview(true);
    try {
      await apiRequest("/reviews", {
        method: "POST",
        token,
        body: {
          bookingId: reviewBooking._id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment
        }
      });
      setReviewBooking(null);
      await load(); // Reload spaces to get updated average rating
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <RoleGuard role="driver">
      <WelcomeAnimation>
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Driver Dashboard</h1>
                <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                  Find and book parking spaces near you
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-surface-100 dark:bg-surface-800 p-1.5 rounded-xl">
                {[
                  { id: "explore", label: "Explore", icon: Icons.explore },
                  { id: "bookings", label: "My Bookings", icon: Icons.booking },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.id
                      ? "bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                      }`}
                  >
                    <tab.icon />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Session Alert */}
            <AnimatePresence>
              {activeBooking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                      <Icons.clock />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        Active Parking Session
                      </p>
                      <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                        {activeMinutes} minutes elapsed at {activeBooking.spaceId?.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {Math.floor(activeMinutes / 60)}h {activeMinutes % 60}m
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "explore" && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Search & Filter Section */}
                <div className="glass-card rounded-2xl p-6">
                  <form onSubmit={searchLocation} className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                        <Icons.search />
                      </div>
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        placeholder="Search city or specific place (e.g. India Gate)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSearchingLocation}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSearchingLocation ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Icons.search />
                            Search
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={useMyLocation}
                        className="btn-secondary p-3"
                        title="Use My GPS Location"
                      >
                        <Icons.location />
                      </button>
                    </div>
                  </form>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                        <Icons.money />
                      </div>
                      <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                        placeholder="Max price/hour (₹)"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters((s) => ({ ...s, maxPrice: e.target.value }))}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                        <Icons.car />
                      </div>
                      <select
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm appearance-none cursor-pointer"
                        value={filters.vehicleType}
                        onChange={(e) => setFilters((s) => ({ ...s, vehicleType: e.target.value }))}
                      >
                        <option value="">All vehicle types</option>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                        <option value="ev">Electric Vehicle</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Map View */}
                  <motion.div
                    className="lg:col-span-2 glass-card overflow-hidden rounded-2xl p-1 h-[500px] lg:h-[650px]"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <ParkingMap spaces={nearbySpaces} center={mapCenter} onSpaceClick={(id) => {
                      const sp = spaces.find(s => s._id === id);
                      if (sp) handleBookClick(sp);
                    }} />
                  </motion.div>

                  {/* List View */}
                  <motion.div
                    className="glass-card rounded-2xl p-4 overflow-hidden flex flex-col h-[500px] lg:h-[650px]"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-surface-900 dark:text-white">Nearby Parking</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-500 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-full">
                          {nearbySpaces.length} found
                        </span>
                        {getDemandLevel() === 'high' && (
                          <span className="ai-demand-high">🔥 High Demand</span>
                        )}
                        {getDemandLevel() === 'low' && (
                          <span className="ai-demand-low">✅ Low Demand</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {isFetching ? (
                        <>
                          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                        </>
                      ) : (
                        <>
                        {(() => {
                            const bestId = getBestSpaceId(nearbySpaces);
                            const medianPrice = getMedianPrice(nearbySpaces);
                            return nearbySpaces.map((space, index) => {
                              const dist = calculateDistance(mapCenter[0], mapCenter[1], space.latitude, space.longitude).toFixed(1);
                              const isBest = space._id === bestId;
                              const isCheap = medianPrice && space.pricePerHour < medianPrice;
                              return (
                                <motion.article
                                  key={space._id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className={`group glass-card rounded-xl p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer ${isBest ? 'ring-2 ring-amber-400/60 dark:ring-amber-500/40' : ''}`}
                                  onClick={() => handleBookClick(space)}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-sm text-surface-900 dark:text-white truncate">{space.title}</h4>
                                        {isBest && <span className="ai-badge-best">🏆 Best</span>}
                                        {!isBest && isCheap && <span className="ai-badge-recommended">✨ Deal</span>}
                                      </div>
                                      {space.reviewCount > 0 ? (
                                        <div className="flex items-center gap-1">
                                          <span className="text-amber-400"><Icons.star /></span>
                                          <span className="text-xs font-medium text-surface-700 dark:text-surface-300">{space.rating}</span>
                                          <span className="text-xs text-surface-400">({space.reviewCount})</span>
                                        </div>
                                      ) : (
                                        <p className="text-xs text-surface-400 italic">No reviews yet</p>
                                      )}
                                    </div>
                                    <span className="text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                      {dist} km
                                    </span>
                                  </div>
                                  <p className="text-xs text-surface-500 dark:text-surface-400 truncate mb-3">{space.address}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-lg font-bold text-surface-900 dark:text-white">₹{space.pricePerHour}</span>
                                      <span className="text-xs text-surface-500">/hr</span>
                                    </div>
                                    <button className="px-4 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                      Book Now
                                    </button>
                                  </div>
                                </motion.article>
                              );
                            });
                          })()}

                          {nearbySpaces.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl bg-surface-50/50 dark:bg-surface-800/50">
                              <div className="text-4xl mb-3">🅿️</div>
                              <h4 className="font-semibold text-surface-900 dark:text-white mb-2">No parking found nearby</h4>
                              <p className="text-sm text-surface-500 mb-4">
                                We couldn&apos;t find spaces within 50km of <span className="font-medium text-primary-600">{lastSearchedName}</span>.
                              </p>
                              <div className="space-y-2">
                                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">💡 Try expanding your search radius</p>
                                <p className="text-xs text-surface-400">Or search a nearby city (e.g. Delhi, Mumbai)</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-surface-900 dark:text-white">My Booking History</h2>
                    <span className="text-sm text-surface-500">{bookings.length} bookings</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {bookings.map((b, index) => (
                      <motion.div
                        key={b._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card rounded-2xl p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-surface-900 dark:text-white">{b.spaceId?.title || "Unknown Space"}</p>
                            <p className="text-xs text-surface-500 mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                          {b.vehicleNumber && (
                            <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                              <Icons.car />
                              <span className="uppercase font-medium">{b.vehicleNumber}</span>
                            </div>
                          )}
                          {b.slotId && (
                            <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                              <Icons.map />
                              <span>Slot <span className="font-medium text-primary-600 dark:text-primary-400">{b.slotId}</span></span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                            <Icons.clock />
                            <span>{b.durationHours || b.expectedDurationHours || 0} hours</span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                              <Icons.money />
                              <span className="font-semibold text-surface-900 dark:text-white">₹{b.totalAmount || (b.spaceId?.pricePerHour * b.expectedDurationHours) || 0}</span>
                            </div>
                            {b.status === "completed" && b.commission > 0 && (
                              <div className="text-[10px] text-surface-500 mt-1 font-medium pl-7">Includes ₹{b.commission} platform fee</div>
                            )}
                          </div>
                        </div>

                        {b.status === "completed" && !b.isReviewed && (
                          <button
                            onClick={() => { setReviewBooking(b); setReviewForm({ rating: 5, comment: "" }); }}
                            className="w-full py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                          >
                            Leave a Review
                          </button>
                        )}
                        {b.status === "completed" && b.isReviewed && (
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                            <Icons.check />
                            <span className="font-medium">Review Submitted</span>
                          </div>
                        )}

                        {b.qrCodeDataUrl && (b.status === "pending" || b.status === "confirmed" || b.status === "active") && (
                          <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700 flex flex-col items-center">
                            <img src={b.qrCodeDataUrl} alt="Check-in QR" className="w-28 h-28 object-contain rounded-xl" />
                            <span className="text-xs text-surface-500 mt-2 font-mono uppercase tracking-wider">Check-in QR</span>
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {bookings.length === 0 && (
                      <div className="md:col-span-2 text-center py-12 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-primary-600">
                          <Icons.booking />
                        </div>
                        <h4 className="font-semibold text-surface-900 dark:text-white mb-2">No bookings yet</h4>
                        <p className="text-sm text-surface-500 mb-4">Switch to the Explore tab to find and book parking spaces.</p>
                        <button
                          onClick={() => setActiveTab("explore")}
                          className="btn-primary text-sm"
                        >
                          Find Parking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Booking Modal */}
          <AnimatePresence>
            {selectedSpace && (() => {
              // AI: demand insight
              const hour = new Date().getHours();
              const demandHigh = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21);

              // AI: auto-fill start time as now (formatted for datetime-local)
              const nowLocal = () => {
                const now = new Date();
                now.setSeconds(0, 0);
                return now.toISOString().slice(0, 16);
              };

              // AI: compute display duration with validation
              let displayDuration = bookingForm.expectedDurationHours || 1;
              let timeError = null;
              if (bookingForm.scheduledStart && bookingForm.scheduledEnd) {
                const s = new Date(bookingForm.scheduledStart);
                const e = new Date(bookingForm.scheduledEnd);
                if (s >= e) {
                  timeError = "End time must be after start time";
                } else {
                  displayDuration = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60)));
                }
              }

              // AI: recommended slot — first available
              const activeSlots = selectedSpace?.slots?.filter(s => s.isActive) || [];
              const recommendedSlotId = activeSlots.find(s => !bookedSlots.includes(s.slotId))?.slotId;

              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
                  onClick={() => setSelectedSpace(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.97 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-surface-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-surface-700 max-h-[94vh] overflow-y-auto"
                  >
                    {/* Header */}
                    <div className="relative p-5 border-b border-gray-100 dark:border-surface-800">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Book Parking</h2>
                            {demandHigh && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[11px] font-semibold border border-red-100 dark:border-red-800">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                                High Demand
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-surface-400 truncate">{selectedSpace.title}</p>
                          <p className="text-xs text-gray-400 dark:text-surface-500 truncate mt-0.5">{selectedSpace.address}</p>
                        </div>
                        <button
                          onClick={() => setSelectedSpace(null)}
                          className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors text-gray-500"
                        >
                          <Icons.close />
                        </button>
                      </div>
                      {/* Rate pill */}
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ₹{selectedSpace.pricePerHour}/hr
                      </div>
                      {!demandHigh && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Low demand – cheaper now
                        </span>
                      )}
                    </div>

                    {/* AI time suggestion hint */}
                    <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-xs text-blue-700 dark:text-blue-400">
                        <strong>AI Tip:</strong> Most users book for <strong>2 hours</strong>.{" "}
                        <button
                          type="button"
                          className="underline font-medium"
                          onClick={() => {
                            const start = nowLocal();
                            const endDate = new Date(start);
                            endDate.setHours(endDate.getHours() + 2);
                            setBookingForm(f => ({
                              ...f,
                              scheduledStart: start,
                              scheduledEnd: endDate.toISOString().slice(0, 16),
                              expectedDurationHours: 2
                            }));
                          }}
                        >Auto-fill 2 hrs</button>
                      </span>
                    </div>

                    <form onSubmit={submitBooking} className="p-5 space-y-4">
                      {/* Vehicle + Phone */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-surface-400 mb-1.5 uppercase tracking-wide">Vehicle Number</label>
                          <input
                            required
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-gray-400 text-sm font-medium uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="MH 01 AB 1234"
                            value={bookingForm.vehicleNumber}
                            onChange={(e) => setBookingForm({ ...bookingForm, vehicleNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-surface-400 mb-1.5 uppercase tracking-wide">Phone Number</label>
                          <input
                            required
                            type="tel"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="9876543210"
                            value={bookingForm.phoneNumber}
                            onChange={(e) => setBookingForm({ ...bookingForm, phoneNumber: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Time Inputs */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-surface-400 mb-1.5 uppercase tracking-wide">Start Time</label>
                          <input
                            type="datetime-local"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={bookingForm.scheduledStart}
                            onClick={() => {
                              if (!bookingForm.scheduledStart) {
                                setBookingForm(f => ({ ...f, scheduledStart: nowLocal() }));
                              }
                            }}
                            onChange={(e) => setBookingForm({ ...bookingForm, scheduledStart: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-surface-400 mb-1.5 uppercase tracking-wide">End Time</label>
                          <input
                            type="datetime-local"
                            className={`w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white dark:bg-surface-800 text-surface-900 dark:text-white ${timeError ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-surface-700 focus:ring-blue-500'}`}
                            value={bookingForm.scheduledEnd}
                            onChange={(e) => setBookingForm({ ...bookingForm, scheduledEnd: e.target.value })}
                          />
                          {timeError && <p className="text-xs text-red-500 mt-1">{timeError}</p>}
                        </div>
                      </div>

                      {/* Duration fallback */}
                      {(!bookingForm.scheduledStart || !bookingForm.scheduledEnd) && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-surface-400 mb-1.5 uppercase tracking-wide">Duration (Hours)</label>
                          <input
                            required
                            type="number"
                            min="1"
                            max="72"
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={bookingForm.expectedDurationHours}
                            onChange={(e) => setBookingForm({ ...bookingForm, expectedDurationHours: Number(e.target.value) })}
                          />
                        </div>
                      )}

                      {/* Pricing Card */}
                      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 p-4">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-surface-400 mb-2">
                          <span>Rate</span>
                          <span className="font-medium">₹{selectedSpace.pricePerHour} / hour</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-surface-400 mb-3">
                          <span>Duration</span>
                          <span className="font-medium">{displayDuration} {displayDuration === 1 ? 'hour' : 'hours'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-blue-200 dark:border-blue-700">
                          <span className="text-sm font-semibold text-surface-900 dark:text-white">Total Estimate</span>
                          <motion.span
                            key={displayDuration}
                            initial={{ scale: 0.92, opacity: 0.6 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-xl font-bold text-blue-600 dark:text-blue-400"
                          >
                            ₹{selectedSpace.pricePerHour * displayDuration}
                          </motion.span>
                        </div>
                      </div>

                      {/* Slot Selection */}
                      {activeSlots.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-surface-400 mb-2 uppercase tracking-wide">Select Slot</label>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {activeSlots.map(slot => {
                              const isBooked = bookedSlots.includes(slot.slotId);
                              const isSelected = bookingForm.slotId === slot.slotId;
                              const isRecommended = slot.slotId === recommendedSlotId;
                              return (
                                <div key={slot.slotId} className="relative">
                                  {isRecommended && !isBooked && (
                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
                                      Best
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    disabled={isBooked}
                                    onClick={() => setBookingForm({ ...bookingForm, slotId: slot.slotId })}
                                    className={`w-full pt-3 pb-2 px-1 rounded-xl text-center transition-all duration-150 border-2 ${
                                      isBooked
                                        ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed dark:bg-red-900/10 dark:border-red-900/30'
                                        : isSelected
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                                          : 'bg-white dark:bg-surface-800 text-gray-700 dark:text-surface-300 border-gray-200 dark:border-surface-700 hover:border-blue-400 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="text-sm font-bold">{slot.slotId}</div>
                                    <div className={`text-[10px] uppercase font-medium mt-0.5 ${isSelected ? 'text-blue-200' : 'text-gray-400 dark:text-surface-500'}`}>
                                      {slot.vehicleType}
                                    </div>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          {activeSlots.length > 0 && !bookingForm.slotId && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                              Please select a slot to continue
                            </p>
                          )}
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        disabled={isBooking || !!timeError || (activeSlots.length > 0 && !bookingForm.slotId)}
                        type="submit"
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                      >
                        {isBooking ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            {activeSlots.length > 0 && !bookingForm.slotId ? "Select a slot to continue" : "Confirm Booking"}
                            {(!activeSlots.length || bookingForm.slotId) && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            )}
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>


          {/* Review Modal */}
          <AnimatePresence>
            {reviewBooking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setReviewBooking(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="glass-card w-full max-w-md rounded-3xl p-6 shadow-2xl"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Icons.star />
                    </div>
                    <h2 className="text-xl font-bold text-surface-900 dark:text-white">Rate Your Experience</h2>
                    <p className="text-sm text-surface-500 mt-1">How was parking at {reviewBooking.spaceId?.title}?</p>
                  </div>

                  <form onSubmit={submitReview} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3 text-center">Select Rating</label>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm(s => ({ ...s, rating: star }))}
                            className={`text-3xl transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-amber-400' : 'text-surface-300 dark:text-surface-600'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Comment (Optional)</label>
                      <textarea
                        className="input-field resize-none"
                        rows="3"
                        placeholder="Share your experience..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      />
                    </div>

                    <button
                      disabled={isSubmittingReview}
                      type="submit"
                      className="w-full btn-primary py-4 disabled:opacity-50"
                    >
                      {isSubmittingReview ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </WelcomeAnimation>
    </RoleGuard>
  );
}
