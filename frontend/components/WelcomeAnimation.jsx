"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import TextPressure from "./TextPressure";

export default function WelcomeAnimation({ children }) {
    const { user, loading } = useAuth();
    const [showWelcome, setShowWelcome] = useState(false);
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (loading || !user?._id) return;
        
        const sessionKey = `hasSeenWelcome_${user._id}`;
        const hasSeenWelcome = sessionStorage.getItem(sessionKey);
        
        if (!hasSeenWelcome) {
            setShowWelcome(true);
            setIsRendered(true);
            const timer = setTimeout(() => {
                setShowWelcome(false);
                sessionStorage.setItem(sessionKey, "true");
            }, 9500);
            const unmountTimer = setTimeout(() => setIsRendered(false), 10500);
            return () => {
                clearTimeout(timer);
                clearTimeout(unmountTimer);
            };
        } else {
            setShowWelcome(false);
            setIsRendered(false);
        }
    }, [user, loading]);

    const handleSkip = () => {
        if (!user?._id) return;
        const sessionKey = `hasSeenWelcome_${user._id}`;
        setShowWelcome(false);
        sessionStorage.setItem(sessionKey, "true");
        setTimeout(() => setIsRendered(false), 1000);
    };

    if (!isRendered) return <>{children}</>;

    // Use full name but limit max length to prevent layout breaking on very long texts
    let rawName = user?.name?.toUpperCase() || "USER";
    if (rawName.length > 20) rawName = rawName.substring(0, 20);

    return (
        <>
            <div style={{ opacity: showWelcome ? 0 : 1, transition: "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                {children}
            </div>

            <AnimatePresence>
                {showWelcome && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, pointerEvents: "none" }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center font-sans select-none"
                    >
                        {/* Deep elegant background */}
                        <div className="absolute inset-0 bg-[#020617]" />
                        
                        {/* Subtle ambient glows */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 mix-blend-screen">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 3, ease: "easeOut" }}
                                className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[140px]" 
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 3, delay: 0.5, ease: "easeOut" }}
                                className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[140px]" 
                            />
                        </div>

                        {/* Logo badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 mb-14 flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                        >
                            <span className="text-xl drop-shadow-md">🅿️</span>
                            <span className="text-white/80 font-semibold tracking-[0.2em] text-xs uppercase">SmartPark</span>
                        </motion.div>

                        {/* "WELCOME BACK," modern elegant text */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 text-center mb-0 tracking-tight font-light"
                            style={{
                                fontSize: "clamp(2rem, 5vw, 4rem)",
                                background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            WELCOME
                        </motion.h2>

                        {/* Interactive username via TextPressure */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 w-full px-12 flex justify-center items-center"
                            style={{
                                maxWidth: "min(90vw, 1000px)",
                                height: "clamp(100px, 18vw, 220px)"
                            }}
                        >
                            <TextPressure
                                text={rawName}
                                flex={true}
                                alpha={true}
                                stroke={false}
                                width={true}
                                weight={true}
                                italic={false}
                                textColor="#ffffff"
                                className="select-none tracking-tighter"
                                minFontSize={48}
                            />
                        </motion.div>

                        {/* Refined interaction hint */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2, duration: 1.5, ease: "easeOut" }}
                            className="relative z-10 mt-16 flex items-center justify-center gap-4 text-white/30"
                        >
                            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
                            <p className="text-[10px] sm:text-xs font-medium tracking-[0.35em] uppercase px-2">Interact with your name</p>
                            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
                        </motion.div>

                        {/* Bottom elegant loading line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500"
                                initial={{ width: "0%", opacity: 0 }}
                                animate={{ width: "100%", opacity: 1 }}
                                transition={{ 
                                    width: { duration: 9.5, ease: "linear" },
                                    opacity: { duration: 0.5 }
                                }}
                            />
                        </div>

                        {/* Modern skip button */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5, duration: 1 }}
                            onClick={handleSkip}
                            className="absolute top-8 right-8 text-white/40 hover:text-white transition-all duration-300 text-xs font-semibold uppercase tracking-widest px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 hover:border-white/20 shadow-sm"
                        >
                            Skip &rarr;
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

