"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const ShieldIcon = () => (
  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export const RoleGuard = ({ role, children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && user.role !== role) router.push(`/${user.role}`);
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="glass-card flex flex-col items-center gap-6 rounded-3xl p-12 text-center">
          <div className="relative flex h-16 w-16">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-20"></span>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800">
              <ShieldIcon />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-surface-900 dark:text-white">Authenticating</h3>
            <p className="mt-1 text-sm text-surface-500">Preparing your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  return children;
};
