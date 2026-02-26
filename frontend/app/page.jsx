"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef } from "react";

const FeatureCard = ({ title, text, icon, delay, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="glass group relative overflow-hidden rounded-[2.5rem] p-10 transition-all hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(15,95,255,0.15)] ring-1 ring-white/20"
  >
    <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${color} blur-3xl opacity-20 transition-all group-hover:opacity-40`}></div>
    <div className="relative mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/40 text-4xl shadow-sm backdrop-blur-md border border-white/40 dark:bg-white/10">
      {icon}
    </div>
    <h3 className="relative mb-3 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">{title}</h3>
    <p className="relative text-gray-600 leading-relaxed dark:text-gray-400">{text}</p>
    <div className="mt-6 flex items-center text-sm font-bold text-smartBlue dark:text-smartTeal">
      Learn more <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
    </div>
  </motion.div>
);

export default function HomePage() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden pb-32">
      {/* Dynamic Background Gradients */}
      <div className="absolute left-[5%] top-[10%] -z-10 h-[600px] w-[600px] rounded-full bg-smartTeal/10 blur-[120px] animate-pulse" />
      <div className="absolute right-[5%] top-[20%] -z-10 h-[700px] w-[700px] rounded-full bg-smartBlue/10 blur-[140px] animate-pulse delay-700" />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-20 pb-24 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-bold text-smartInk backdrop-blur-xl dark:text-white"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-smartTeal opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-smartTeal"></span>
          </span>
          Next-Gen Urban Mobility
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto max-w-5xl text-6xl font-[900] leading-[1.05] tracking-tight text-gray-900 md:text-8xl lg:text-9xl dark:text-white"
        >
          Park <span className="text-smartBlue italic">Smarter.</span><br />
          Earn <span className="bg-gradient-to-r from-smartBlue to-smartTeal bg-clip-text text-transparent">Effortlessly.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-10 max-w-3xl text-xl font-medium text-gray-600 md:text-2xl leading-relaxed dark:text-gray-400"
        >
          The most advanced parking network in India. Monetize your empty space or find the perfect spot instantly with live availability, QR entry, and automated billing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14 flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link
            href="/register"
            className="group relative inline-flex h-18 items-center justify-center overflow-hidden rounded-3xl bg-smartInk px-12 py-5 font-black text-xl text-white shadow-2xl transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-smartInk"
          >
            Get Started ⚡
          </Link>
          <Link
            href="/login"
            className="group inline-flex h-18 items-center justify-center rounded-3xl border-2 border-gray-200 bg-white/50 px-12 py-5 font-black text-xl text-gray-800 transition-all hover:border-smartBlue/30 hover:bg-white dark:border-gray-800 dark:bg-black/20 dark:text-white"
          >
            Log In
          </Link>
        </motion.div>
      </section>

      {/* Feature Section with Staggered Grid */}
      <section className="px-4 md:px-8 mx-auto max-w-7xl relative">
        <div className="grid gap-10 md:grid-cols-3">
          <FeatureCard
            delay={0.1}
            color="from-blue-500 to-cyan-400"
            icon="🚙"
            title="Drive & Find"
            text="Interactive live-map with GPS navigation. Book premium spots in seconds and navigate directly to your destination."
          />
          <FeatureCard
            delay={0.2}
            color="from-emerald-500 to-teal-400"
            icon="🏦"
            title="Host & Earn"
            text="List your driveway, garage, or lot. Set your price, scan QR codes on arrival, and receive instant payouts."
          />
          <FeatureCard
            delay={0.3}
            color="from-purple-500 to-pink-400"
            icon="🛡️"
            title="Admin Suite"
            text="Comprehensive monitoring tools for host verification, revenue tracking, and dispute management."
          />
        </div>
      </section>

      {/* Visual Showcase Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mx-auto mt-32 max-w-7xl px-4"
      >
        <div className="relative overflow-hidden rounded-[3.5rem] bg-smartInk p-4 shadow-[0_50px_100px_rgba(0,0,0,0.4)] md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Intuitive <br />
                <span className="text-smartTeal underline decoration-4 underline-offset-8">Map Control.</span>
              </h2>
              <p className="mt-6 text-gray-400 text-lg md:text-xl">
                Real-time spatial data integration allows you to browse hundreds of verified parking locations. No more circling the block.
              </p>
              <div className="mt-10 flex gap-4">
                <div className="flex flex-col">
                  <span className="text-white text-3xl font-black">200+</span>
                  <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Locations</span>
                </div>
                <div className="ml-8 flex flex-col">
                  <span className="text-white text-3xl font-black">15k+</span>
                  <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Bookings</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-square md:aspect-video rounded-[2.5rem] bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/13/4330/2753.png')] bg-cover bg-center grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-smartInk via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-smartInk bg-gray-700"></div>
                  ))}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-smartInk bg-smartBlue text-xs font-bold text-white">
                    +12
                  </div>
                </div>
                <button className="rounded-2xl bg-white px-6 py-2.5 text-sm font-black text-smartInk active:scale-95 transition-all">
                  Open Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
