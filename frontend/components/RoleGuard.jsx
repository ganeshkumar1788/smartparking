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

  if (loading || !user || user.role !== role) return <div className="glass rounded-xl p-4">Loading...</div>;
  return children;
};
