"use client";

import { motion } from "framer-motion";

interface NorthLoaderProps {
  show: boolean;
}

export default function NorthLoader({ show }: NorthLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-[50] flex flex-col items-center justify-center px-4 transition-opacity duration-200"
      style={{
        background: "var(--soft-gray)",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        visibility: show ? "visible" : "hidden",
      }}
      aria-hidden={!show}
      data-loading-screen
    >
      <div className="flex flex-col items-center justify-center">
        <div className="relative inline-flex items-center justify-center mb-10" style={{ minHeight: "120px" }}>
          <motion.span
            className="relative z-0 font-black leading-none select-none"
            style={{
              color: "var(--north-navy)",
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              fontSize: "clamp(4rem, 18vw, 6.5rem)",
            }}
            animate={show ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.6 }}
            transition={{ repeat: show ? Infinity : 0, duration: 2.5, ease: "easeInOut" }}
            aria-hidden
          >
            N
          </motion.span>
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            animate={show ? { rotate: 360 } : { rotate: 0 }}
            transition={{ repeat: show ? Infinity : 0, duration: 2, ease: "linear" }}
          >
            <svg
              viewBox="0 0 56 56"
              className="block"
              style={{
                height: "30rem",
                width: "30rem",
                transform: "rotate(-25deg)",
                /* Single soft shadow behind needle where it overlaps the N */
                filter: "drop-shadow(1px 1px 2px rgba(0,31,63,0.2))",
              }}
            >
              <defs>
                {/* Center: subtle radial for slightly convex, raised look */}
                <radialGradient
                  id="pivot-convex"
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="40%"
                  fy="40%"
                >
                  <stop offset="0%" stopColor="#e2c04a" />
                  <stop offset="100%" stopColor="#c9a227" />
                </radialGradient>
              </defs>
              {/* Needle: flat solid yellow-gold */}
              <path
                d="M 10 10 L 26 22 L 46 46 L 22 26 Z"
                fill="#d4af37"
              />
              <circle
                cx="28"
                cy="28"
                r="5"
                fill="url(#pivot-convex)"
                stroke="none"
              />
            </svg>
          </motion.div>
        </div>
        <motion.p
          animate={show ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
          transition={{ repeat: show ? Infinity : 0, duration: 2, ease: "easeInOut" }}
          className="text-xs sm:text-sm font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-center max-w-xs"
          style={{ color: "var(--north-navy)" }}
        >
          MAPPING YOUR PATH TO CLARITY...
        </motion.p>
      </div>
    </div>
  );
}
