"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

interface NorthLoaderProps {
  show: boolean;
  /** Called when the needle has locked to North and held (so parent can transition). */
  onLockComplete?: () => void;
}

/** When to start the "lock to North" animation (ms after loader shows). */
const LOCK_START_MS = 1600;
/** Duration of the lock animation (ease-out to 0°). */
const LOCK_DURATION_MS = 500;
/** Hold at North before parent is allowed to transition (so needle clearly stops first). */
const HOLD_AT_NORTH_MS = 400;

/** Random angle between -15° and -45° (wiggle West but not fully North). */
function randomWiggleAngle(): number {
  // Negative angles rotate counter-clockwise (towards West).
  return -(15 + Math.random() * 30);
}

/** Final \"true North\" angle: straight up from horizontal. */
const NORTH_ANGLE = -90;

export default function NorthLoader({ show, onLockComplete }: NorthLoaderProps) {
  // Random angle for this load so wiggle keyframes are correct on first paint.
  const wiggleTarget = useMemo(() => (show ? randomWiggleAngle() : 0), [show]);
  const [locking, setLocking] = useState(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockCompleteRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When loader shows: start lock timer. When hide: clear timers.
  useEffect(() => {
    if (!show) {
      setLocking(false);
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
      if (lockCompleteRef.current) {
        clearTimeout(lockCompleteRef.current);
        lockCompleteRef.current = null;
      }
      return;
    }
    setLocking(false);
    lockTimerRef.current = setTimeout(() => {
      setLocking(true);
      lockTimerRef.current = null;
      // After lock animation + hold, notify parent so it can transition.
      lockCompleteRef.current = setTimeout(() => {
        onLockComplete?.();
        lockCompleteRef.current = null;
      }, (LOCK_DURATION_MS + HOLD_AT_NORTH_MS));
    }, LOCK_START_MS);
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      if (lockCompleteRef.current) clearTimeout(lockCompleteRef.current);
    };
  }, [show, onLockComplete]);

  // Keyframes for visible wiggle: oscillate around North (up) instead of swinging West.
  const wiggleKeyframes = [
    NORTH_ANGLE - 8,
    NORTH_ANGLE + 6,
    NORTH_ANGLE - 4,
    NORTH_ANGLE + 2,
    NORTH_ANGLE,
  ];

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
          {/* Static "N" - no animation */}
          <span
            className="relative z-0 font-black leading-none select-none"
            style={{
              color: "var(--north-navy)",
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              fontSize: "clamp(4rem, 18vw, 6.5rem)",
            }}
            aria-hidden
          >
            N
          </span>

          {/* Needle: centered over N, scaled taller/thicker, wiggles West then locks clearly to North */}
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            initial={false}
            animate={{
              // Wiggle West (negative angles), then rotate up to a clear North angle.
              rotate: locking ? [wiggleTarget, NORTH_ANGLE + 12, NORTH_ANGLE] : show ? wiggleKeyframes : 0,
            }}
            transition={
              locking
                ? { type: "tween", duration: LOCK_DURATION_MS / 1000, ease: "easeOut", times: [0, 0.55, 1] }
                : { type: "tween", duration: 1.1, times: [0, 0.28, 0.52, 0.76, 1], ease: "easeInOut" }
            }
          >
            <svg
              viewBox="0 0 56 56"
              className="block"
              style={{
                height: "30rem",
                width: "30rem",
                // Start perfectly horizontal; scale to be taller/thicker.
                transform: "scale(1.1, 1.2)",
                filter: "drop-shadow(1px 1px 2px rgba(0,31,63,0.2))",
              }}
            >
              <defs>
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
              <path d="M 10 10 L 26 22 L 46 46 L 22 26 Z" fill="#d4af37" />
              <circle cx="28" cy="28" r="5" fill="url(#pivot-convex)" stroke="none" />
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
