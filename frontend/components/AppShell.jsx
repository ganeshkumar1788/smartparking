"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ThemeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("smartpark_theme");
    const shouldDark = saved ? saved === "dark" : false;
    setDark(shouldDark);
    document.documentElement.classList.toggle("dark", shouldDark);
  }, []);

  const onToggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("smartpark_theme", next ? "dark" : "light");
  };

  return (
    <button onClick={onToggle} className="rounded-full border px-3 py-1 text-sm">
      {dark ? "Light" : "Dark"}
    </button>
  );
};

export const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="glass mx-auto mb-6 flex w-full max-w-6xl items-center justify-between rounded-2xl px-5 py-4 shadow-glass">
        <Link href="/" className="text-lg font-semibold">SmartPark</Link>
        <nav className="flex items-center gap-3">
          {!user && <Link href="/login" className="text-sm">Login</Link>}
          {!user && <Link href="/register" className="text-sm">Register</Link>}
          {user?.role === "driver" && <Link href="/driver" className="text-sm">Driver</Link>}
          {user?.role === "host" && <Link href="/host" className="text-sm">Host</Link>}
          {user?.role === "admin" && <Link href="/admin" className="text-sm">Admin</Link>}
          {user && <button onClick={logout} className="text-sm">Logout</button>}
          <ThemeToggle />
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl">{children}</main>
    </div>
  );
};
