"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import {
  NORTH_ANGLE as NORTH_ANGLE_MATH,
  decelValue,
  getClockwiseStopTarget,
} from "@/lib/ui/compassLoaderMath";

interface NorthLoaderProps {
  show: boolean;
  /** Called when the needle has locked to North and held (so parent can transition). */
  onLockComplete?: () => void;
  /**
   * When true, start the slow-down + stop sequence.
   * If omitted, defaults to true.
   */
  readyToLock?: boolean;
}

/** Optional delay after `readyToLock` becomes true before deceleration begins. */
const LOCK_START_MS = 0;
/** Duration of the lock animation (ease-out to 0°). */
const LOCK_DURATION_MS = 500;
/** Hold at North before parent is allowed to transition (so needle clearly stops first). */
const HOLD_AT_NORTH_MS = 400;

export default function NorthLoader({
  show,
  onLockComplete,
  readyToLock = true,
}: NorthLoaderProps) {
  // Keep the needle spinning at a constant speed until we "lock" it near the end.
  const needleRotate = useMotionValue<number>(NORTH_ANGLE_MATH);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const onLockCalledRef = useRef(false);
  const onLockCompleteRef = useRef<(() => void) | undefined>(onLockComplete);
  const readyToLockRef = useRef<boolean>(readyToLock);

  // Keep the latest callback without restarting the animation effect.
  useEffect(() => {
    onLockCompleteRef.current = onLockComplete;
  }, [onLockComplete]);

  useEffect(() => {
    readyToLockRef.current = readyToLock;
  }, [readyToLock]);

  // Start/stop the spin and schedule the final slow-down + stop at 12 o'clock.
  useEffect(() => {
    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const cleanup = () => {
      stopped = true;
      stop();
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = null;
    };

    if (!show) {
      cleanup();
      onLockCalledRef.current = false;
      needleRotate.set(NORTH_ANGLE_MATH);
      return;
    }

    stopped = false;
    onLockCalledRef.current = false;
    needleRotate.set(NORTH_ANGLE_MATH);

    type Mode = "spin" | "decel" | "hold";
    let mode: Mode = "spin";

    const speedDegPerSec = 360;
    const spinStartTs = performance.now();

    let decelFromAngle = NORTH_ANGLE_MATH;
    let decelToAngle = NORTH_ANGLE_MATH;
    let decelStartTs = 0;

    const beginDecel = () => {
      if (mode !== "spin") return;

      mode = "decel";
      decelFromAngle = needleRotate.get();
      decelToAngle = getClockwiseStopTarget(decelFromAngle, NORTH_ANGLE_MATH);
      decelStartTs = performance.now();

      if (LOCK_START_MS > 0) {
        // If configured, delay starting decel for a short window.
        mode = "hold";
        needleRotate.set(decelFromAngle);
        if (holdTimer) clearTimeout(holdTimer);
        holdTimer = setTimeout(() => {
          if (stopped) return;
          mode = "decel";
          decelStartTs = performance.now();
        }, LOCK_START_MS);
      }
    };

    const tick = (now: number) => {
      if (stopped) return;

      if (mode === "spin") {
        const elapsedSec = (now - spinStartTs) / 1000;
        needleRotate.set(NORTH_ANGLE_MATH + elapsedSec * speedDegPerSec);
        if (readyToLockRef.current) beginDecel();
      } else if (mode === "decel") {
        const elapsedMs = now - decelStartTs;
        const value = decelValue(decelFromAngle, decelToAngle, elapsedMs, LOCK_DURATION_MS);
        needleRotate.set(value);

        if (elapsedMs >= LOCK_DURATION_MS) {
          needleRotate.set(decelToAngle);
          mode = "hold";
          if (holdTimer) clearTimeout(holdTimer);
          holdTimer = setTimeout(() => {
            if (stopped) return;
            if (!onLockCalledRef.current) {
              onLockCalledRef.current = true;
              onLockCompleteRef.current?.();
            }
            cleanup();
          }, HOLD_AT_NORTH_MS);
        }
      } else {
        // hold mode
        needleRotate.set(decelToAngle);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return cleanup;
  }, [show, needleRotate]);

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
            style={{ rotate: needleRotate }}
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
