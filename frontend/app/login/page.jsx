"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";

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
      <div className="absolute -left-[20%] top-[10%] -z-10 h-[500px] w-[500px] rounded-full bg-smartTeal/20 blur-[100px]" />
      <div className="absolute -right-[20%] bottom-[10%] -z-10 h-[600px] w-[600px] rounded-full bg-smartBlue/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4 text-4xl">🚀</Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your SmartPark account</p>
        </div>

        <form onSubmit={submit} className="glass rounded-[2rem] p-8 shadow-2xl shadow-smartBlue/10 border border-white/40">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 transition-colors focus:border-smartBlue focus:bg-white focus:outline-none focus:ring-2 focus:ring-smartBlue/20"
                placeholder="you@example.com"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 transition-colors focus:border-smartBlue focus:bg-white focus:outline-none focus:ring-2 focus:ring-smartBlue/20"
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
                className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100"
              >
                {error}
              </motion.p>
            )}

            <button
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-smartBlue px-4 py-3.5 text-center font-bold text-white shadow-lg transition-all hover:bg-smartBlue/90 hover:shadow-smartBlue/30 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-smartBlue focus:ring-offset-2"
            >
              {loading ? "Signing in..." : "Login to SmartPark"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-smartBlue hover:underline">
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
