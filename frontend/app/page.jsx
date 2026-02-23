"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef } from "react";

const FeatureCard = ({ title, text, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass group relative overflow-hidden rounded-3xl p-8 shadow-glass transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-smartBlue/20"
  >
    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-smartBlue/20 to-smartTeal/20 blur-2xl transition-all group-hover:bg-smartBlue/30"></div>
    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/50 text-3xl shadow-sm border border-white/40">
      {icon}
    </div>
    <h3 className="mb-3 text-xl font-bold tracking-tight text-gray-900">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{text}</p>
  </motion.div>
);

export default function HomePage() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden pb-20">
      {/* Decorative Background Elements */}
      <div className="absolute -left-[10%] top-0 -z-10 h-[500px] w-[500px] rounded-full bg-smartTeal/20 blur-[100px]" />
      <div className="absolute -right-[10%] top-[20%] -z-10 h-[600px] w-[600px] rounded-full bg-smartBlue/20 blur-[120px]" />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-32 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-smartTeal/30 bg-smartTeal/10 px-4 py-1.5 text-sm font-medium text-smartTeal"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-smartTeal opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-smartTeal"></span>
          </span>
          The Future of Urban Parking
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 md:text-7xl lg:text-8xl"
        >
          Park Smarter. <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-smartBlue to-smartTeal bg-clip-text text-transparent">
            Earn Faster.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl leading-relaxed"
        >
          Turn your driveway into a cash machine or find instant, affordable parking anywhere in the city. QR check-ins, automated billing, and live navigation in one seamless app.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-smartBlue px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-smartBlue/40 focus:outline-none focus:ring-2 focus:ring-smartBlue focus:ring-offset-2 w-full sm:w-auto"
          >
            <span className="absolute right-0 top-0 h-full w-10 translate-x-12 transform bg-white opacity-20 transition-all duration-300 group-hover:-translate-x-40 group-hover:skew-x-12"></span>
            Get Started Free 🚀
          </Link>
          <Link
            href="/login"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border-2 border-gray-200 bg-white/50 px-8 py-4 font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
          >
            Log In
          </Link>
        </motion.div>
      </section>

      {/* Feature Cards Section */}
      <section className="px-4 md:px-8 mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            delay={0.4}
            icon="🚗"
            title="Driver App"
            text="Search the live map, book spots instantly, check in via QR code, and pay seamlessly on exit all from one dashboard."
          />
          <FeatureCard
            delay={0.5}
            icon="🏠"
            title="Host Dashboard"
            text="List your unused driveway or garage in seconds. Set your own hourly price and let our automated platform handle the payments."
          />
          <FeatureCard
            delay={0.6}
            icon="🛡️"
            title="Admin Control"
            text="Powerful backend moderation. Approve verify hosts, manage user disputes, and track overarching revenue analytics."
          />
        </div>
      </section>

      {/* Decorative Mockup Floating Image */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="mx-auto mt-24 max-w-5xl px-4 hidden md:block"
      >
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/30 p-2 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
          <div className="h-[400px] w-full rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://maps.wikimedia.org/osm-intl/13/4330/2753.png')] bg-cover bg-center"></div>
            <div className="z-10 text-center">
              <span className="text-6xl mb-4 block">🗺️</span>
              <h3 className="text-white font-bold text-2xl">Interactive Map Interface</h3>
              <p className="text-gray-400 mt-2">Built with OpenStreetMap & Leaflet</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
