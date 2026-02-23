"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "driver"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      router.push(`/${user.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -right-[20%] top-[5%] -z-10 h-[500px] w-[500px] rounded-full bg-smartTeal/20 blur-[100px]" />
      <div className="absolute -left-[20%] bottom-[5%] -z-10 h-[600px] w-[600px] rounded-full bg-smartBlue/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4 text-4xl">🚀</Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Join SmartPark</h1>
          <p className="mt-2 text-gray-600">Create an account to park or host</p>
        </div>

        <form onSubmit={submit} className="glass rounded-[2rem] p-8 shadow-2xl shadow-smartBlue/10 border border-white/40">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <input required className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 transition-colors focus:border-smartBlue focus:bg-white focus:outline-none focus:ring-2 focus:ring-smartBlue/20" placeholder="John Doe" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
              <input required className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 transition-colors focus:border-smartBlue focus:bg-white focus:outline-none focus:ring-2 focus:ring-smartBlue/20" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
              <input required className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 transition-colors focus:border-smartBlue focus:bg-white focus:outline-none focus:ring-2 focus:ring-smartBlue/20" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input required className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 transition-colors focus:border-smartBlue focus:bg-white focus:outline-none focus:ring-2 focus:ring-smartBlue/20" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
            </div>

            <div className="pt-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">I want to use SmartPark as a:</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${form.role === 'driver' ? 'border-smartBlue bg-smartBlue/5 text-smartBlue font-semibold' : 'border-gray-200 bg-white/50 text-gray-600 hover:border-gray-300'}`}>
                  <input type="radio" className="hidden" name="role" value="driver" checked={form.role === "driver"} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))} />
                  🚗 Driver
                </label>
                <label className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${form.role === 'host' ? 'border-smartBlue bg-smartBlue/5 text-smartBlue font-semibold' : 'border-gray-200 bg-white/50 text-gray-600 hover:border-gray-300'}`}>
                  <input type="radio" className="hidden" name="role" value="host" checked={form.role === "host"} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))} />
                  🏠 Host
                </label>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100"
              >
                {error}
              </motion.p>
            )}

            <button disabled={loading} className="mt-6 w-full rounded-xl bg-smartBlue px-4 py-3.5 text-center font-bold text-white shadow-lg transition-all hover:bg-smartBlue/90 hover:shadow-smartBlue/30 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-smartBlue focus:ring-offset-2">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-smartBlue hover:underline">
            Log in instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
