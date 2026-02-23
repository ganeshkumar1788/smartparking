"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { RoleGuard } from "../../components/RoleGuard";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

// Leaflet requires window, so we must disable SSR for the map component
const ParkingMap = dynamic(() => import("../../components/ParkingMap"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200/20" />
});

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
      <section className="space-y-6">
        <div className="glass rounded-2xl p-5 shadow-glass">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Driver Dashboard</h1>
              <p className="mt-1 text-sm opacity-80">Search parking, book instantly, check-in with QR and pay on exit.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100/50 p-1 rounded-xl self-start">
              <button
                onClick={() => setActiveTab("explore")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "explore" ? "bg-white shadow-sm text-smartBlue" : "opacity-70 hover:opacity-100"}`}
              >
                Explore Parking
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "bookings" ? "bg-white shadow-sm text-smartBlue" : "opacity-70 hover:opacity-100"}`}
              >
                My Bookings
              </button>
            </div>
          </div>

          {activeBooking && (
            <div className="mt-4 bg-smartTeal/10 border border-smartTeal/20 p-3 rounded-xl">
              <p className="text-sm text-smartTeal font-medium">
                Active parking session running: <strong>{activeMinutes}</strong> minutes elapsed.
              </p>
            </div>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {activeTab === "explore" && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5 shadow-glass">
              <form onSubmit={searchLocation} className="flex gap-2 mb-4">
                <input
                  className="flex-1 rounded-xl border bg-transparent px-3 py-2"
                  placeholder="Search city or specific place (e.g. India Gate)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" disabled={isSearchingLocation} className="rounded-xl bg-smartBlue px-4 py-2 text-white font-medium hover:bg-smartBlue/90 disabled:opacity-50">
                  {isSearchingLocation ? "Searching..." : "Search Map"}
                </button>
                <button type="button" onClick={useMyLocation} className="rounded-xl border border-smartBlue/30 px-3 py-2 hover:bg-smartBlue/10 transition-colors" title="Use My GPS Location">
                  📍
                </button>
              </form>

              <div className="grid gap-3 md:grid-cols-2 mb-4">
                <input className="rounded-xl border bg-transparent px-3 py-2" placeholder="Max price/hour (₹)" value={filters.maxPrice} onChange={(e) => setFilters((s) => ({ ...s, maxPrice: e.target.value }))} />
                <select className="rounded-xl border bg-transparent px-3 py-2" value={filters.vehicleType} onChange={(e) => setFilters((s) => ({ ...s, vehicleType: e.target.value }))}>
                  <option value="">All vehicles</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="ev">EV</option>
                </select>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Map View - Takes up 2 columns on large screens */}
              <div className="lg:col-span-2 glass overflow-hidden rounded-2xl p-2 shadow-glass h-[500px]">
                <ParkingMap spaces={nearbySpaces} center={mapCenter} onSpaceClick={(id) => {
                  const sp = spaces.find(s => s._id === id);
                  if (sp) handleBookClick(sp);
                }} />
              </div>

              {/* List View - Sorted by distance to map center */}
              <div className="glass rounded-2xl p-4 shadow-glass overflow-y-auto h-[500px]">
                <h3 className="font-semibold mb-3">Nearest Places</h3>
                {isFetching ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200/50"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nearbySpaces.map((space) => {
                      const dist = calculateDistance(mapCenter[0], mapCenter[1], space.latitude, space.longitude).toFixed(1);
                      return (
                        <article key={space._id} className="border border-gray-100 rounded-xl p-3 transition hover:border-smartBlue/30 hover:bg-smartBlue/5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-sm leading-tight">{space.title}</h4>
                              {space.reviewCount > 0 ? (
                                <p className="text-xs text-yellow-600 mt-1 font-medium">⭐ {space.rating} ({space.reviewCount} reviews)</p>
                              ) : (
                                <p className="text-xs text-gray-400 mt-1 italic">No reviews yet</p>
                              )}
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{dist}km</span>
                          </div>
                          <p className="text-xs opacity-70 mt-1 truncate">{space.address}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-sm font-medium">₹{space.pricePerHour}<span className="text-xs opacity-70 font-normal">/hr</span></p>
                            <button onClick={() => handleBookClick(space)} className="rounded-lg bg-smartBlue px-3 py-1.5 text-xs font-medium text-white hover:bg-smartBlue/90 transition-colors">
                              Book
                            </button>
                          </div>
                        </article>
                      );
                    })}

                    {nearbySpaces.length === 0 && (
                      <div className="text-center p-6 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 mt-4">
                        <span className="text-3xl mb-2 block">🌍</span>
                        <h4 className="font-semibold text-gray-800">No parkings nearby</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          We couldn't find any parking spaces within 50km of <br /><span className="font-medium text-smartBlue">{lastSearchedName}</span>.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="glass rounded-2xl p-5 shadow-glass">
            <h2 className="mb-4 text-lg font-semibold">My Booking History</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {bookings.map((b) => (
                <div key={b._id} className="border border-gray-200/40 bg-white/30 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-base">{b.spaceId?.title || "Unknown Space"}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize 
                        ${b.status === 'active' ? 'bg-green-100 text-green-700' :
                          b.status === 'completed' ? 'bg-gray-200 text-gray-700' :
                            b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm opacity-90">
                      {b.vehicleNumber && <p>🚗 Vehicle: <span className="font-medium uppercase">{b.vehicleNumber}</span></p>}
                      {b.slotId && <p>🅿️ Slot: <span className="font-medium bg-smartBlue/10 text-smartBlue px-1 rounded">{b.slotId}</span></p>}
                      <p>⏱️ Duration: <span className="font-medium">{b.durationHours || b.expectedDurationHours || 0} hrs</span></p>
                      <p>💰 Total Amt: <span className="font-medium">₹{b.totalAmount || (b.spaceId?.pricePerHour * b.expectedDurationHours) || 0}</span></p>
                    </div>
                    {b.status === "completed" && !b.isReviewed && (
                      <button onClick={() => { setReviewBooking(b); setReviewForm({ rating: 5, comment: "" }); }} className="text-xs bg-smartBlue/10 text-smartBlue font-semibold px-4 py-2 rounded-xl mt-3 hover:bg-smartBlue/20 transition-colors">
                        ⭐ Leave a Review
                      </button>
                    )}
                    {b.status === "completed" && b.isReviewed && (
                      <p className="text-xs text-green-600 font-medium mt-3">✅ Review Submitted</p>
                    )}
                  </div>

                  {b.qrCodeDataUrl && (b.status === "pending" || b.status === "confirmed" || b.status === "active") && (
                    <div className="mt-4 pt-4 border-t border-gray-200/40 flex flex-col items-center bg-white p-3 rounded-xl mx-auto w-3/4 shadow-sm border border-gray-100">
                      <img src={b.qrCodeDataUrl} alt="Check-in QR" className="w-32 h-32 object-contain" />
                      <span className="text-xs text-center text-gray-500 mt-2 font-mono uppercase tracking-widest">GATE CHECK-IN QR</span>
                    </div>
                  )}
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="md:col-span-2 text-center py-8 opacity-70">
                  <p>You have no bookings yet. Switch to the Explore Tab to find parking!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Overlay Modal */}
        {selectedSpace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedSpace(null)}
                className="absolute top-4 right-4 opacity-50 hover:opacity-100"
              >✕</button>

              <h2 className="text-xl font-bold mb-1">Book {selectedSpace.title}</h2>
              <p className="text-sm opacity-80 mb-6">{selectedSpace.address}</p>

              <form onSubmit={submitBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium opacity-80 mb-1">Vehicle License Plate</label>
                  <input required className="w-full rounded-xl border bg-transparent px-3 py-2 uppercase" placeholder="e.g. MH 01 AB 1234" value={bookingForm.vehicleNumber} onChange={(e) => setBookingForm({ ...bookingForm, vehicleNumber: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium opacity-80 mb-1">Phone Number</label>
                  <input required type="tel" className="w-full rounded-xl border bg-transparent px-3 py-2" placeholder="e.g. 9876543210" value={bookingForm.phoneNumber} onChange={(e) => setBookingForm({ ...bookingForm, phoneNumber: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium opacity-80 mb-1">Schedule Start (Optional)</label>
                    <input type="datetime-local" className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm" value={bookingForm.scheduledStart} onChange={(e) => setBookingForm({ ...bookingForm, scheduledStart: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium opacity-80 mb-1">Schedule End (Optional)</label>
                    <input type="datetime-local" className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm" value={bookingForm.scheduledEnd} onChange={(e) => setBookingForm({ ...bookingForm, scheduledEnd: e.target.value })} />
                  </div>
                </div>

                {(!bookingForm.scheduledStart || !bookingForm.scheduledEnd) && (
                  <div>
                    <label className="block text-sm font-medium opacity-80 mb-1">Expected Duration (Hours)</label>
                    <input required type="number" min="1" max="72" className="w-full rounded-xl border bg-transparent px-3 py-2" value={bookingForm.expectedDurationHours} onChange={(e) => setBookingForm({ ...bookingForm, expectedDurationHours: Number(e.target.value) })} />
                  </div>
                )}

                {(() => {
                  let displayDuration = bookingForm.expectedDurationHours || 1;
                  if (bookingForm.scheduledStart && bookingForm.scheduledEnd) {
                    const start = new Date(bookingForm.scheduledStart);
                    const end = new Date(bookingForm.scheduledEnd);
                    if (start < end) displayDuration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
                  }
                  return (
                    <div className="bg-gray-100/10 p-4 rounded-xl mt-6">
                      <div className="flex justify-between text-sm mb-1 opacity-80">
                        <span>Rate</span>
                        <span>₹{selectedSpace.pricePerHour} / hour</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200/20">
                        <span>Total Estimate ({displayDuration}h)</span>
                        <span>₹{selectedSpace.pricePerHour * displayDuration}</span>
                      </div>
                    </div>
                  );
                })()}

                {selectedSpace?.slots && selectedSpace.slots.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium opacity-80 mb-2">Select a Parking Slot</label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {selectedSpace.slots.filter(s => s.isActive).map(slot => {
                        const isBooked = bookedSlots.includes(slot.slotId);
                        const isSelected = bookingForm.slotId === slot.slotId;
                        return (
                          <button
                            type="button"
                            key={slot.slotId}
                            disabled={isBooked}
                            onClick={() => setBookingForm({ ...bookingForm, slotId: slot.slotId })}
                            className={`p-2 rounded-xl text-xs font-bold transition-all border
                                            ${isBooked ? 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-60' :
                                isSelected ? 'bg-smartBlue text-white border-smartBlue shadow-md scale-105' :
                                  'bg-white text-gray-700 border-gray-200 hover:border-smartBlue/50 hover:bg-smartBlue/5'}
                                        `}
                          >
                            <div className="text-sm">{slot.slotId}</div>
                            <div className="text-[10px] uppercase font-medium opacity-80">{slot.vehicleType}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button disabled={isBooking || (selectedSpace?.slots?.length > 0 && !bookingForm.slotId)} type="submit" className="w-full mt-4 rounded-xl bg-smartBlue px-4 py-3 font-semibold text-white hover:bg-smartBlue/90 disabled:opacity-50 transition-colors shadow-lg shadow-smartBlue/20">
                  {isBooking ? "Confirming..." : (selectedSpace?.slots?.length > 0 && !bookingForm.slotId ? "Select a slot above" : "Confirm Booking & Generate QR")}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Review Overlay Modal */}
        {reviewBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass w-full max-w-sm rounded-3xl p-8 shadow-2xl relative border border-white/20">
              <button
                onClick={() => setReviewBooking(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-200/50 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >✕</button>

              <div className="text-center mb-6">
                <span className="text-4xl block mb-2">⭐</span>
                <h2 className="text-2xl font-bold text-gray-900">Rate Your Experience</h2>
                <p className="text-sm text-gray-500 mt-1">How was parking at {reviewBooking.spaceId?.title}?</p>
              </div>

              <form onSubmit={submitReview} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Select Rating</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(s => ({ ...s, rating: star }))}
                        className={`text-3xl transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300 grayscale opacity-50'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add a Comment <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea
                    className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-sm focus:border-smartBlue focus:ring-2 focus:ring-smartBlue/20 outline-none transition-all resize-none"
                    rows="3"
                    placeholder="Was the space easy to find? Was the host helpful?"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  />
                </div>

                <button disabled={isSubmittingReview} type="submit" className="w-full mt-2 rounded-xl bg-smartBlue px-4 py-3.5 font-bold text-white hover:bg-smartBlue/90 disabled:opacity-50 transition-colors shadow-lg shadow-smartBlue/20">
                  {isSubmittingReview ? "Submitting..." : "Publish Review"}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </RoleGuard>
  );
}
