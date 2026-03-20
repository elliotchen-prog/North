import { describe, expect, it } from "vitest";
import {
  CLOCKWISE_STEP_DEG,
  NORTH_ANGLE,
  decelValue,
  easeOutCubic,
  getClockwiseStopTarget,
} from "./compassLoaderMath";

describe("compassLoaderMath", () => {
  it("easeOutCubic(0)=0 and easeOutCubic(1)=1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it("decelValue returns from at t=0 and to at t=duration", () => {
    const from = NORTH_ANGLE + 720;
    const to = NORTH_ANGLE;
    expect(decelValue(from, to, 0, 500)).toBe(from);
    expect(decelValue(from, to, 500, 500)).toBe(to);
  });

  it("decelValue uses ease-out cubic", () => {
    const from = 0;
    const to = 100;
    const duration = 1000;
    const mid = 500; // t=0.5, eased = 1 - (1-0.5)^3 = 0.875
    expect(decelValue(from, to, mid, duration)).toBeCloseTo(87.5, 5);
  });

  it("getClockwiseStopTarget ends at an equivalent NORTH angle", () => {
    const from = NORTH_ANGLE + 10;
    const target = getClockwiseStopTarget(from);
    expect(target).toBe(NORTH_ANGLE + CLOCKWISE_STEP_DEG);

    // Must preserve clockwise direction: never go below fromAngle.
    expect(target).toBeGreaterThanOrEqual(from);

    // Orientation should match 12 o'clock modulo 360.
    expect((target - NORTH_ANGLE) % CLOCKWISE_STEP_DEG).toBe(0);
  });

  it("getClockwiseStopTarget returns north when already pointing at north", () => {
    const target = getClockwiseStopTarget(NORTH_ANGLE);
    expect(target).toBe(NORTH_ANGLE);
  });
});

