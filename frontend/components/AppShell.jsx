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
    <button
      onClick={onToggle}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xl transition-all hover:bg-white/20 dark:border-white/10 dark:bg-white/5"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
};

const NavLink = ({ href, children }) => (
  <Link
    href={href}
    className="px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:text-smartBlue dark:text-gray-300 dark:hover:text-smartTeal"
  >
    {children}
  </Link>
);

export const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 z-50 w-full px-4 pt-6 md:px-8">
        <div className="glass mx-auto flex w-full max-w-7xl items-center justify-between rounded-3xl px-6 py-4 shadow-2xl">
          <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter">
            <span className="bg-gradient-to-br from-smartBlue to-smartTeal bg-clip-text text-transparent">SmartPark</span>
            <span className="text-xl">⚡</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {!user && (
              <>
                <NavLink href="/login">Login</NavLink>
                <Link
                  href="/register"
                  className="ml-2 rounded-2xl bg-smartInk px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-black hover:shadow-lg dark:bg-white dark:text-smartInk dark:hover:bg-gray-200"
                >
                  Join Now
                </Link>
              </>
            )}
            {user?.role === "driver" && <NavLink href="/driver">Dashboard</NavLink>}
            {user?.role === "host" && <NavLink href="/host">Hosting</NavLink>}
            {user?.role === "admin" && <NavLink href="/admin">Admin</NavLink>}
            {user && (
              <button
                onClick={logout}
                className="ml-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
              >
                Logout
              </button>
            )}
            <div className="ml-4 h-6 w-px bg-gray-200 dark:bg-gray-800"></div>
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile Menu Placeholder / Toggle could go here */}
          <div className="flex md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pt-32 pb-20 md:px-8">
        {children}
      </main>
    </div>
  );
};
