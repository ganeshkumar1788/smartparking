"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

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
        <div className="glass flex flex-col items-center gap-6 rounded-[2.5rem] p-12 text-center shadow-2xl">
          <div className="relative flex h-16 w-16">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-smartBlue opacity-20"></span>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/40 text-2xl border border-white/40 backdrop-blur-md dark:bg-white/10">
              ⚡
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Authenticating</h3>
            <p className="mt-1 text-sm font-medium text-gray-500">Preparing your high-speed dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  return children;
};
