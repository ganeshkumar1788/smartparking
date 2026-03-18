"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RoleGuard } from "../../components/RoleGuard";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";
import WelcomeAnimation from "../../components/WelcomeAnimation";

// Icons
const Icons = {
  users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  building: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  car: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  location: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ticket: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  money: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  camera: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  play: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card rounded-2xl p-6 flex items-center justify-between hover-lift"
  >
    <div>
      <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">{value}</p>
    </div>
    <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
      <Icon />
    </div>
  </motion.div>
);

export default function AdminPage() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "history"

  const dummyHistoryVideos = [
    {
      id: 1,
      title: "Main Gate Entry Loop",
      date: "Oct 24, 2023 - 14:00 to 18:00",
      thumbnail: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800",
      stats: { persons: 0, vehicles: 20, peakOccupied: 20, freeSlots: 32 }
    },
    {
      id: 2,
      title: "Basement Level 2 Camera",
      date: "Oct 23, 2023 - 08:00 to 12:00",
      thumbnail: "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?auto=format&fit=crop&q=80&w=800",
      stats: { persons: 0, vehicles: 1, peakOccupied: 1, freeSlots: 4 }
    }
  ];

  const load = async () => {
    try {
      const [analytics, apps] = await Promise.all([
        apiRequest("/admin/analytics", { token }),
        apiRequest("/admin/hosts/applications", { token })
      ]);
      setMetrics(analytics.metrics);
      setApplications(apps.applications);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const review = async (id, status) => {
    await apiRequest(`/admin/hosts/applications/${id}`, {
      method: "PATCH",
      token,
      body: { status }
    });
    await load();
  };

  return (
    <RoleGuard role="admin">
      <WelcomeAnimation>
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Admin Control Center</h1>
                <p className="mt-1 text-surface-500">Platform analytics and host verification management</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">
                <Icons.shield />
                <span className="text-sm font-semibold">Administrator Access</span>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex gap-2 p-1.5 bg-surface-100 dark:bg-surface-800 rounded-2xl w-full max-w-md">
            {[
              { id: "dashboard", label: "Overview", icon: Icons.shield },
              { id: "history", label: "Camera History", icon: Icons.camera },
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

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
            >
              {error}
            </motion.div>
          )}

          {/* Dashboard Content */}
          {activeTab === "dashboard" && (
            <>
              {/* Stats Grid */}
              {metrics && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <StatCard title="Total Users" value={metrics.userCount} icon={Icons.users} color="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" delay={0} />
                  <StatCard title="Total Hosts" value={metrics.hostCount} icon={Icons.building} color="bg-accent-teal/10 text-accent-teal" delay={0.1} />
                  <StatCard title="Total Drivers" value={metrics.driverCount} icon={Icons.car} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" delay={0.2} />
                  <StatCard title="Parking Spaces" value={metrics.spaceCount} icon={Icons.location} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" delay={0.3} />
                  <StatCard title="Total Bookings" value={metrics.bookingCount} icon={Icons.ticket} color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" delay={0.4} />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card rounded-2xl p-6 flex items-center justify-between relative overflow-hidden bg-gradient-to-br from-accent-teal/5 to-primary-500/5"
                  >
                    <div className="relative z-10">
                      <p className="text-xs font-semibold text-accent-teal uppercase tracking-wider">Platform Commission</p>
                      <p className="text-3xl font-bold gradient-text mt-1">₹{metrics.platformCommission?.toLocaleString()}</p>
                    </div>
                    <div className="relative z-10 h-12 w-12 rounded-xl bg-accent-teal/10 text-accent-teal flex items-center justify-center">
                      <Icons.money />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Applications Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Host Applications</h2>
                  <span className="text-sm text-surface-500">{applications.filter(a => a.status === 'pending').length} pending</span>
                </div>

                <div className="space-y-4">
                  {applications.map((app, index) => (
                    <motion.div key={app._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-teal flex items-center justify-center text-white font-bold">{app.userId?.name?.charAt(0) || '?'}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-surface-900 dark:text-white">{app.userId?.name}</p>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${app.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : app.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>{app.status}</span>
                          </div>
                          <p className="text-sm text-surface-500">{app.userId?.email}</p>
                        </div>
                      </div>

                      {app.status === "pending" && (
                        <div className="flex gap-2 w-full md:w-auto">
                          <button onClick={() => review(app._id, "approved")} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 font-semibold text-white transition-colors"><Icons.check /> Approve</button>
                          <button onClick={() => review(app._id, "rejected")} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-white dark:bg-surface-800 px-5 py-2.5 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"><Icons.close /> Reject</button>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {applications.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl">
                      <h4 className="font-semibold text-surface-900 dark:text-white mb-2">No applications</h4>
                      <p className="text-sm text-surface-500">No pending host applications to review at this time.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* Camera History Content */}
          {activeTab === "history" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-card rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Saved Camera History</h2>
                <p className="text-sm text-surface-500 mb-6">Review past default recordings with YOLO object detection annotations and occupancy statistics.</p>

                <div className="grid gap-6 md:grid-cols-2">
                  {dummyHistoryVideos.map((video) => (
                    <div key={video.id} className="rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden bg-white dark:bg-surface-800/50 hover:shadow-lg transition-all">
                      <div className="relative aspect-video group bg-black overflow-hidden pointer-events-none">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        {/* Animated Scanner Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary-500/50 shadow-[0_0_15px_5px_rgba(var(--primary-rgb),0.5)] animate-[scan_3s_ease-in-out_infinite]" />
                        {/* Fake Bounding Boxes overlay */}
                        <div className="absolute inset-0 border-2 border-emerald-500/50 m-8 rounded animate-pulse" />
                        <div className="absolute inset-y-12 inset-x-20 border-2 border-rose-500/50 rounded animate-pulse" />

                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-semibold text-white flex items-center gap-1.5 z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-[pulse_1s_infinite]"></span> Analyzing
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-1">{video.title}</h3>
                        <p className="text-xs font-semibold text-surface-500 mb-4">{video.date}</p>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-3 flex items-center justify-between">
                            <span className="text-xs text-surface-500 uppercase font-semibold">Persons Detected</span>
                            <span className="font-bold text-primary-600 dark:text-primary-400">{video.stats.persons}</span>
                          </div>
                          <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-3 flex items-center justify-between">
                            <span className="text-xs text-surface-500 uppercase font-semibold">Total Vehicles</span>
                            <span className="font-bold text-accent-teal">{video.stats.vehicles}</span>
                          </div>
                          <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-xl p-3 flex items-center justify-between">
                            <span className="text-xs text-rose-500 uppercase font-semibold">Peak Occupied</span>
                            <span className="font-bold text-rose-600 dark:text-rose-400">{video.stats.peakOccupied} slots</span>
                          </div>
                          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-3 flex items-center justify-between">
                            <span className="text-xs text-emerald-500 uppercase font-semibold">Free Spots left</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{video.stats.freeSlots} slots</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </WelcomeAnimation>
    </RoleGuard>
  );
}
