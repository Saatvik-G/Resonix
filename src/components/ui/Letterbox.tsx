"use client";

import { motion, useReducedMotion } from "motion/react";

interface LetterboxProps {
  active?: boolean;
}

export default function Letterbox({ active = true }: LetterboxProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return active ? (
      <>
        <div className="fixed top-0 left-0 right-0 h-4 md:h-8 bg-[#09090b] border-b border-white/5 z-[60] pointer-events-none" />
        <div className="fixed bottom-0 left-0 right-0 h-4 md:h-8 bg-[#09090b] border-t border-white/5 z-[60] pointer-events-none" />
      </>
    ) : null;
  }

  return (
    <>
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: active ? 0 : "-100%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 h-4 md:h-8 bg-[#09090b] border-b border-white/5 z-[60] pointer-events-none"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: active ? 0 : "100%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-0 left-0 right-0 h-4 md:h-8 bg-[#09090b] border-t border-white/5 z-[60] pointer-events-none"
      />
    </>
  );
}
