"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RoleGuard } from "../../components/RoleGuard";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

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

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
          >
            {error}
          </motion.div>
        )}

        {/* Stats Grid */}
        {metrics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Users"
              value={metrics.userCount}
              icon={Icons.users}
              color="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
              delay={0}
            />
            <StatCard
              title="Total Hosts"
              value={metrics.hostCount}
              icon={Icons.building}
              color="bg-accent-teal/10 text-accent-teal"
              delay={0.1}
            />
            <StatCard
              title="Total Drivers"
              value={metrics.driverCount}
              icon={Icons.car}
              color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              delay={0.2}
            />
            <StatCard
              title="Parking Spaces"
              value={metrics.spaceCount}
              icon={Icons.location}
              color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              delay={0.3}
            />
            <StatCard
              title="Total Bookings"
              value={metrics.bookingCount}
              icon={Icons.ticket}
              color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
              delay={0.4}
            />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Host Applications</h2>
            <span className="text-sm text-surface-500">
              {applications.filter(a => a.status === 'pending').length} pending
            </span>
          </div>
          
          <div className="space-y-4">
            {applications.map((app, index) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-teal flex items-center justify-center text-white font-bold">
                    {app.userId?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-surface-900 dark:text-white">{app.userId?.name}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        app.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        app.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-surface-500">{app.userId?.email}</p>
                  </div>
                </div>

                {app.status === "pending" && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => review(app._id, "approved")} 
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 font-semibold text-white transition-colors"
                    >
                      <Icons.check />
                      Approve
                    </button>
                    <button 
                      onClick={() => review(app._id, "rejected")} 
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-white dark:bg-surface-800 px-5 py-2.5 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <Icons.close />
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
            
            {applications.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-primary-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="font-semibold text-surface-900 dark:text-white mb-2">No applications</h4>
                <p className="text-sm text-surface-500">No pending host applications to review at this time.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </RoleGuard>
  );
}
