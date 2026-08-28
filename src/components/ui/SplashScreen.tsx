"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Disc, Music } from "lucide-react";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("resonix_splash_seen");
    if (hasSeenSplash) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("resonix_splash_seen", "true");
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b]"
        >
          {/* Animated Vinyl Record Graphic */}
          <motion.div
            initial={{ scale: 0.7, rotate: shouldReduceMotion ? 0 : -20, opacity: 0 }}
            animate={{ scale: 1, rotate: shouldReduceMotion ? 0 : 360, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-28 h-28 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-4 border-amber-500/30 flex items-center justify-center shadow-2xl mb-6"
          >
            {/* Vinyl grooves */}
            <div className="absolute inset-2 rounded-full border border-white/10" />
            <div className="absolute inset-5 rounded-full border border-white/5" />
            <div className="absolute inset-8 rounded-full border border-white/10" />
            
            {/* Center record label */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-inner">
              <div className="w-3 h-3 rounded-full bg-[#09090b]" />
            </div>
          </motion.div>

          {/* Logo & Equalizer */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col items-center gap-2"
          >
            <h1 className="font-outfit text-3xl font-extrabold text-white tracking-wider flex items-center gap-2">
              RESONIX
            </h1>

            {/* Equalizer bars */}
            <div className="flex items-end gap-1.5 h-6 mt-1">
              <div className={`w-1 bg-amber-400 rounded-full h-4 ${shouldReduceMotion ? "" : "animate-eq-1"}`} />
              <div className={`w-1 bg-rose-500 rounded-full h-3 ${shouldReduceMotion ? "" : "animate-eq-2"}`} />
              <div className={`w-1 bg-amber-300 rounded-full h-5 ${shouldReduceMotion ? "" : "animate-eq-3"}`} />
              <div className={`w-1 bg-indigo-400 rounded-full h-3 ${shouldReduceMotion ? "" : "animate-eq-1"}`} />
            </div>

            <p className="text-xs text-zinc-400 font-medium tracking-wide mt-2">
              Curating songs across all eras & languages…
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
