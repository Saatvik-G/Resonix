"use client";

import { motion } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: "easeInOut", duration: 0.35 }}
      className="flex flex-col flex-1 min-h-screen w-full"
    >
      {children}
    </motion.div>
  );
}
