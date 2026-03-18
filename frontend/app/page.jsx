"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// SVG Icon Set
const Icons = {
  car: ({ className = "w-8 h-8" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  building: ({ className = "w-8 h-8" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  shield: ({ className = "w-8 h-8" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  map: ({ className = "w-8 h-8" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
    </svg>
  ),
  qr: ({ className = "w-8 h-8" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 20h2v-4H6v4zm6-6h2v-4h-2v4zm-6 0h2v-4H6v4zm12-6h2V4h-2v4zM6 10h2V4H6v6zm6-6h2V4h-2v4z" />
    </svg>
  ),
  wallet: ({ className = "w-8 h-8" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  arrowRight: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  check: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  star: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  // Trust indicator SVG icons
  users: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  verified: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  bolt: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  sparkles: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  trendUp: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  parking: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  smileFace: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Feature Card Component — SaaS-style (Stripe/Notion inspired)
const FeatureCard = ({ title, description, icon: Icon, color, delay, isPopular }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    whileHover={{ y: -6, transition: { duration: 0.25 } }}
    className="group relative"
  >
    <div className="relative bg-white dark:bg-surface-800 rounded-2xl p-7 h-full border border-gray-100 dark:border-surface-700 shadow-sm hover:shadow-md transition-all duration-200">
      {isPopular && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <Icons.trendUp className="w-3 h-3" /> Popular
        </span>
      )}
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} text-white mb-5 shadow-md group-hover:scale-110 transition-transform duration-250`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-surface-400 leading-relaxed text-sm">{description}</p>
      <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 group/link cursor-pointer">
        Learn more
        <span className="transform group-hover/link:translate-x-1 transition-transform duration-200">
          <Icons.arrowRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  </motion.div>
);

// Step Card Component — with gradient circles and connector line
const StepCard = ({ number, title, description, icon: Icon, isLast }) => (
  <div className="flex gap-5 items-start relative">
    {/* Connector line */}
    {!isLast && (
      <div className="absolute left-6 top-14 bottom-0 w-[2px] bg-gradient-to-b from-primary-300 to-primary-100 dark:from-primary-700 dark:to-primary-900/30 -mb-2" />
    )}
    {/* Number badge */}
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-teal text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-primary-500/25 z-10">
      {number}
    </div>
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="pb-8"
    >
      <h4 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">{title}</h4>
      <p className="text-gray-500 dark:text-surface-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  </div>
);

// Testimonial Card
const TestimonialCard = ({ name, role, content, rating, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-gray-100 dark:border-surface-700 shadow-sm hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-center gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < rating ? "text-amber-400" : "text-gray-200 dark:text-surface-600"}>
          <Icons.star className="w-4 h-4" />
        </span>
      ))}
    </div>
    <p className="text-surface-700 dark:text-surface-300 mb-5 leading-relaxed text-sm">&ldquo;{content}&rdquo;</p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-teal flex items-center justify-center text-white font-semibold text-sm">
        {name.charAt(0)}
      </div>
      <div>
        <p className="font-semibold text-surface-900 dark:text-white text-sm">{name}</p>
        <p className="text-xs text-gray-400 dark:text-surface-400">{role}</p>
      </div>
    </div>
  </motion.div>
);

export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // AI: detect user city for personalised hero text
  const [userCity, setUserCity] = useState(null);
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          // Prefer city > town > village > county — avoid long admin area names
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            null;
          // Sanitize: only use if it's a short, clean name (not 'X state assembly constituency')
          if (city && city.length <= 25 && !city.toLowerCase().includes('constituency')) {
            setUserCity(city);
          }
        } catch { /* silent */ }
      }, () => { /* denied — no problem */ });
    }
  }, []);

  const features = [
    {
      title: "Smart Parking",
      description: "Find and book parking spots in real-time with our intelligent map system. Get turn-by-turn navigation to your reserved spot.",
      icon: Icons.car,
      color: "from-blue-500 to-cyan-500",
      isPopular: true,
    },
    {
      title: "Host & Earn",
      description: "Turn your empty driveway or garage into passive income. List your space in minutes and start earning today.",
      icon: Icons.building,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Secure Access",
      description: "QR code-based entry ensures only authorized users can access your parking space. Full security with automated gates.",
      icon: Icons.shield,
      color: "from-violet-500 to-purple-500",
    },
    {
      title: "Live Tracking",
      description: "Track your parking history, monitor active bookings, and get real-time notifications about your reservations.",
      icon: Icons.map,
      color: "from-orange-500 to-amber-500",
    },
    {
      title: "Instant QR Entry",
      description: "No more tickets or cards. Simply scan your QR code at the entrance for seamless, contactless parking access.",
      icon: Icons.qr,
      color: "from-rose-500 to-pink-500",
    },
    {
      title: "Auto Payments",
      description: "Hassle-free automated billing with multiple payment options. Get instant invoices and detailed earning reports.",
      icon: Icons.wallet,
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const steps = [
    {
      number: "1",
      title: userCity ? `Find parking near you in ${userCity}` : "Find a Spot",
      description: "Browse hundreds of verified parking locations on our interactive map.",
      icon: Icons.map,
    },
    {
      number: "2",
      title: "Book Instantly",
      description: "Reserve your spot with just a few taps. No phone calls needed.",
      icon: Icons.check,
    },
    {
      number: "3",
      title: "Scan & Park",
      description: "Show your QR code at the entrance and park hassle-free.",
      icon: Icons.qr,
    },
  ];

  const testimonials = [
    { name: "Rahul Sharma", role: "Daily Commuter", content: "SmartPark has completely changed my daily commute. I save at least 20 minutes every morning finding parking near my office.", rating: 5 },
    { name: "Priya Patel", role: "Space Host", content: "I listed my driveway and now earn ₹15,000 extra every month. The platform is so easy to use and payments are always on time.", rating: 5 },
    { name: "Amit Kumar", role: "Business Owner", content: "Managing parking for my restaurant has never been easier. The admin dashboard gives me complete control and insights.", rating: 5 },
  ];

  // AI: demand label
  const hour = new Date().getHours();
  const isHighDemand = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <motion.div style={{ y, opacity }} className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-transparent to-transparent dark:from-primary-950/20" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-accent-teal/15 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent-violet/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </motion.div>

        <div className="max-w-7xl mx-auto text-center">
          {/* Live status badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-surface-800/80 border border-primary-200 dark:border-primary-800 text-sm font-medium text-primary-700 dark:text-primary-400 mb-8 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald" />
            </span>
            Now available in 50+ cities across India
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-surface-900 dark:text-white mb-8"
          >
            Park <span className="gradient-text-animated">Smarter</span>
            <br />
            <span className="text-surface-600 dark:text-surface-400">Not Harder</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-surface-600 dark:text-surface-400 mb-12 leading-relaxed"
          >
            India&apos;s most advanced parking network. Find, book, and access parking spaces
            instantly with QR codes. Or turn your empty space into a revenue stream.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="group btn-primary text-lg px-8 py-4 rounded-2xl">
              <span className="flex items-center gap-2">
                Get Started Free
                <span className="transform group-hover:translate-x-1 transition-transform">
                  <Icons.arrowRight className="w-5 h-5" />
                </span>
              </span>
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-4 rounded-2xl">
              Sign In
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { Icon: Icons.verified, text: "Verified Hosts", color: "text-emerald-600 dark:text-emerald-400" },
              { Icon: Icons.sparkles, text: "AI-Powered", color: "text-violet-600 dark:text-violet-400" },
              { Icon: Icons.bolt, text: "Instant Booking", color: "text-amber-600 dark:text-amber-400" },
            ].map(({ Icon, text, color }, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-surface-800/70 border border-gray-200 dark:border-surface-700 text-sm font-medium shadow-sm"
              >
                <span className={color}><Icon className="w-4 h-4" /></span>
                <span className="text-surface-600 dark:text-surface-300">{text}</span>
              </div>
            ))}
          </motion.div>



          {/* AI Demand Banner */}
          {isHighDemand && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
              High demand area — Book before slots fill up
            </motion.div>
          )}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-surface-600 flex justify-center pt-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-surface-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-semibold mb-4">
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-surface-900 dark:text-white mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-gray-500 dark:text-surface-400 max-w-2xl mx-auto">
              From finding the perfect spot to earning from your unused space, we&apos;ve got you covered.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-50/50 dark:bg-surface-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent-teal/10 dark:bg-accent-teal/20 text-accent-teal text-sm font-semibold mb-4">
                How It Works
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-surface-900 dark:text-white mb-4">
                Parking made <span className="gradient-text">simple</span>
              </h2>
              <p className="text-lg text-gray-500 dark:text-surface-400 mb-10">
                No more circling the block or worrying about parking tickets.
                Book your spot in seconds and park with confidence.
              </p>

              <div className="relative">
                {steps.map((step, i) => (
                  <StepCard key={i} {...step} isLast={i === steps.length - 1} />
                ))}
              </div>

              {/* CTA below steps */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-8"
              >
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 btn-primary rounded-xl px-6 py-3 text-sm font-semibold"
                >
                  Start Booking
                  <Icons.arrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-surface-800 to-surface-900 relative">
                  {/* Mock App Interface */}
                  <div className="absolute inset-4 bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-teal flex items-center justify-center text-white font-bold shadow-md">
                        P
                      </div>
                      <div>
                        <div className="h-3 w-24 bg-gray-200 dark:bg-surface-700 rounded" />
                        <div className="h-2 w-16 bg-gray-100 dark:bg-surface-800 rounded mt-1" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${i === 1 ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' : 'bg-gray-50 dark:bg-surface-900/50'}`}>
                          <div className={`w-12 h-12 rounded-xl ${i === 1 ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-surface-800'} flex items-center justify-center`}>
                            <Icons.parking className="w-5 h-5 text-primary-500" />
                          </div>
                          <div className="flex-1">
                            <div className="h-3 w-32 bg-gray-200 dark:bg-surface-700 rounded mb-2" />
                            <div className="h-2 w-20 bg-gray-100 dark:bg-surface-800 rounded" />
                          </div>
                          <div className={`h-8 w-16 ${i === 1 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-surface-700'} rounded-lg`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-teal/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent-violet/10 dark:bg-accent-violet/20 text-accent-violet text-sm font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-surface-900 dark:text-white mb-4">
              Loved by thousands
            </h2>
            <p className="text-lg text-gray-500 dark:text-surface-400 max-w-2xl mx-auto">
              See what our users have to say about their SmartPark experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={i} {...testimonial} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-teal" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to transform your parking experience?
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of drivers and hosts who are already part of the SmartPark revolution.
                Sign up free today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-2xl hover:bg-white/90 transition-colors shadow-xl"
                >
                  Get Started Free
                  <Icons.arrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-colors border border-white/20"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
