"use client";

import { useEffect, useState } from "react";
import { RoleGuard } from "../../components/RoleGuard";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

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
      <section className="space-y-6">
        <div className="glass flex flex-col md:flex-row md:items-center justify-between rounded-[2rem] p-8 shadow-glass border border-white/40">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Control Center</h1>
            <p className="mt-1 text-gray-600">Platform Analytics & Host Verification overview</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {metrics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="glass rounded-[1.5rem] p-6 shadow-sm border border-white/40 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.userCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-smartBlue/10 flex items-center justify-center text-smartBlue text-xl">👥</div>
            </div>
            <div className="glass rounded-[1.5rem] p-6 shadow-sm border border-white/40 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Hosts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.hostCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-smartTeal/10 flex items-center justify-center text-smartTeal text-xl">🏠</div>
            </div>
            <div className="glass rounded-[1.5rem] p-6 shadow-sm border border-white/40 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Drivers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.driverCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">🚗</div>
            </div>

            <div className="glass rounded-[1.5rem] p-6 shadow-sm border border-white/40 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Parking Spaces</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.spaceCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl">📍</div>
            </div>
            <div className="glass rounded-[1.5rem] p-6 shadow-sm border border-white/40 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.bookingCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl">🎟️</div>
            </div>
            <div className="glass rounded-[1.5rem] p-6 shadow-sm border border-smartTeal/30 flex items-center justify-between relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-smartTeal/20 blur-xl" />
              <div className="relative z-10">
                <p className="text-sm font-medium text-smartTeal uppercase tracking-wider">Platform Commission</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹{metrics.platformCommission}</p>
              </div>
              <div className="relative z-10 h-12 w-12 rounded-full bg-smartTeal/20 flex items-center justify-center text-smartTeal text-xl">💰</div>
            </div>
          </div>
        )}

        <div className="glass rounded-[2rem] p-8 shadow-glass border border-white/40">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Host Applications Waiting Verification</h2>
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white/50 p-5 shadow-sm transition-all hover:shadow-md hover:border-smartBlue/30">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-900 text-lg">{app.userId?.name}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Contact: {app.userId?.email}</p>
                </div>

                {app.status === "pending" && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => review(app._id, "approved")} className="flex-1 md:flex-none rounded-xl bg-smartTeal px-6 py-2.5 font-medium text-white shadow-sm hover:bg-smartTeal/90 transition-colors focus:outline-none focus:ring-2 focus:ring-smartTeal focus:ring-offset-2">
                      Verify & Approve
                    </button>
                    <button onClick={() => review(app._id, "rejected")} className="flex-1 md:flex-none rounded-xl border-2 border-red-200 bg-white px-6 py-2.5 font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
            {applications.length === 0 && (
              <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">No pending host applications to review.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </RoleGuard>
  );
}
