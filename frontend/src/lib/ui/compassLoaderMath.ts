// Calibrated so the SVG needle points at the "12 o'clock" position.
// If the needle stops at a clock position other than 12, adjust this value.
export const NORTH_ANGLE = -135;
export const CLOCKWISE_STEP_DEG = 360;

/** Points at 12 o'clock in our coordinate system (rotate angle = -90). */
export function getClockwiseStopTarget(
  fromAngle: number,
  northAngle: number = NORTH_ANGLE,
  stepDeg: number = CLOCKWISE_STEP_DEG
): number {
  // The needle rotate angle increases clockwise.
  // Pick an equivalent angle that ends at 12 o'clock but is not less than fromAngle,
  // so the deceleration never reverses direction.
  const steps = Math.ceil((fromAngle - northAngle) / stepDeg);
  return northAngle + steps * stepDeg;
}

export function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

/** Pure decel interpolation from -> to using ease-out cubic. */
export function decelValue(
  fromAngle: number,
  toAngle: number,
  elapsedMs: number,
  durationMs: number
): number {
  if (durationMs <= 0) return toAngle;
  const t = Math.min(1, Math.max(0, elapsedMs / durationMs));
  const eased = easeOutCubic(t);
  return fromAngle + (toAngle - fromAngle) * eased;
}

