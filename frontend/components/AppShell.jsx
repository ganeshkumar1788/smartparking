"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Logo Component - Replace with your actual logo image
const Logo = ({ className = "w-10 h-10" }) => (
  <div className={`${className} rounded-xl bg-gradient-to-br from-primary-600 to-accent-teal flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
    P
  </div>
);

// Icons as SVG components for better control
const Icons = {
  sun: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  logout: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  chevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
};

const ThemeToggle = () => {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return <div className="w-10 h-10 rounded-xl bg-surface-200 dark:bg-surface-800" />;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-600 transition-all hover:bg-surface-50 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: dark ? 0 : 180, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {dark ? <Icons.sun /> : <Icons.moon />}
      </motion.div>
    </motion.button>
  );
};

const NavLink = ({ href, children, isActive }) => {
  const pathname = usePathname();
  const active = isActive ?? pathname === href;
  
  return (
    <Link
      href={href}
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-xl ${
        active 
          ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20" 
          : "text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800"
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-xl -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
};

const UserMenu = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-accent-rose text-white';
      case 'host': return 'bg-accent-emerald text-white';
      default: return 'bg-primary-500 text-white';
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'admin': return 'Administrator';
      case 'host': return 'Host';
      default: return 'Driver';
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${getRoleColor(user?.role)}`}>
          {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-surface-900 dark:text-surface-100 leading-tight">{user?.name || user?.email?.split('@')[0]}</p>
          <p className="text-xs text-surface-500 dark:text-surface-400">{getRoleLabel(user?.role)}</p>
        </div>
        <Icons.chevronDown />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-56 glass-card rounded-2xl p-2 z-50"
            >
              <div className="px-3 py-2 border-b border-surface-200 dark:border-surface-700 mb-2">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{user?.name || user?.email?.split('@')[0]}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{user?.email}</p>
              </div>
              
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
              >
                <Icons.logout />
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileMenu = ({ isOpen, onClose, user, logout }) => {
  const menuItems = [
    { href: "/", label: "Home" },
    ...(user?.role === "driver" ? [{ href: "/driver", label: "Dashboard" }] : []),
    ...(user?.role === "host" ? [{ href: "/host", label: "Hosting" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-surface-900 z-50 lg:hidden shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
                <Link href="/" className="flex items-center gap-2" onClick={onClose}>
                  <Logo className="w-8 h-8" />
                  <span className="text-xl font-bold gradient-text">SmartPark</span>
                </Link>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800">
                  <Icons.close />
                </button>
              </div>
              
              <nav className="flex-1 p-6 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="block px-4 py-3 text-lg font-medium text-surface-700 hover:text-primary-600 hover:bg-primary-50 dark:text-surface-300 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 rounded-xl transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-surface-200 dark:border-surface-800 space-y-3">
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="block w-full px-4 py-3 text-center font-medium text-surface-700 border border-surface-300 rounded-xl hover:bg-surface-50 dark:text-surface-300 dark:border-surface-700 dark:hover:bg-surface-800"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={onClose}
                      className="block w-full px-4 py-3 text-center font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => { logout(); onClose(); }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 font-medium text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 dark:text-rose-400 dark:border-rose-900/30 dark:hover:bg-rose-900/20"
                  >
                    <Icons.logout />
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          scrolled ? "" : "lg:px-12"
        }`}>
          <motion.div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled 
                ? "glass-card rounded-2xl px-4 py-3" 
                : "bg-transparent py-2"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Logo className="w-10 h-10 group-hover:shadow-primary-500/30 transition-shadow" />
              <span className="text-xl font-bold text-surface-900 dark:text-white">
                Smart<span className="gradient-text">Park</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink href="/">Home</NavLink>
              {user?.role === "driver" && <NavLink href="/driver">Dashboard</NavLink>}
              {user?.role === "host" && <NavLink href="/host">Hosting</NavLink>}
              {user?.role === "admin" && <NavLink href="/admin">Admin</NavLink>}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              <div className="hidden lg:flex items-center gap-3">
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      className="px-5 py-2.5 text-sm font-medium text-surface-700 hover:text-surface-900 dark:text-surface-300 dark:hover:text-white transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      className="btn-primary text-sm"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <UserMenu user={user} logout={logout} />
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <Icons.menu />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.header>

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        user={user} 
        logout={logout} 
      />

      <main className="flex-1 pt-24 lg:pt-28">
        {children}
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Logo className="w-8 h-8 rounded-lg" />
                <span className="text-lg font-bold text-surface-900 dark:text-white">
                  Smart<span className="gradient-text">Park</span>
                </span>
              </Link>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                The most advanced parking network. Find, book, and manage parking spaces effortlessly.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-surface-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-surface-500 dark:text-surface-400">
                <li><Link href="/driver" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Find Parking</Link></li>
                <li><Link href="/host" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Become a Host</Link></li>
                <li><Link href="/register" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Get Started</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-surface-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-surface-500 dark:text-surface-400">
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-surface-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-surface-500 dark:text-surface-400">
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              © 2025 SmartPark. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
