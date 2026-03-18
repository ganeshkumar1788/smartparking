"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import CurvedLoop from "../../components/CurvedLoop";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      router.push(`/${user.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -left-[20%] top-[10%] -z-10 h-[500px] w-[500px] rounded-full bg-primary-500/10 blur-[100px]" />
      <div className="absolute -right-[20%] bottom-[10%] -z-10 h-[600px] w-[600px] rounded-full bg-accent-teal/10 blur-[120px]" />

      {/* Curved Loop Background Text */}
      <div className="absolute top-0 w-full overflow-hidden pointer-events-none opacity-20 dark:opacity-10 z-0">
        <CurvedLoop
          marqueeText="  SMART PARK • SECURE • INSTANT • HASSLE-FREE • "
          speed={1.5}
          interactive={false}
          className="text-primary-600 dark:text-primary-300"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4 text-4xl hover:scale-110 transition-transform">🅿️</Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400">Sign in to your SmartPark account</p>
        </div>

        <form onSubmit={submit} className="glass-card rounded-[2rem] p-8 shadow-2xl">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Email Address</label>
              <input
                className="w-full rounded-xl border border-surface-200 dark:border-surface-700 bg-white/50 dark:bg-surface-800/50 px-4 py-3 text-surface-900 dark:text-white transition-colors focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="you@example.com"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
              <input
                className="w-full rounded-xl border border-surface-200 dark:border-surface-700 bg-white/50 dark:bg-surface-800/50 px-4 py-3 text-surface-900 dark:text-white transition-colors focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="••••••••"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900"
              >
                {error}
              </motion.p>
            )}

            <button
              disabled={loading}
              className="mt-6 w-full btn-primary px-4 py-3.5"
            >
              {loading ? "Signing in..." : "Login to SmartPark"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-surface-600 dark:text-surface-400">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
