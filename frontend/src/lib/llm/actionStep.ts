export type ActionStepParts = {
  move: string;
  window: string;
  impact: string;
  mindset: string;
};

function normalizeStepText(step: string): string {
  return String(step)
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " | ")
    .replace(/\s+\|\s+/g, " | ")
    .trim();
}

/**
 * Parses a step formatted like:
 * "MOVE: ... | WINDOW: ... | IMPACT: ... | MINDSET: ..."
 * Returns null if it can't reliably find the labels.
 */
export function parseActionStep(step: string): ActionStepParts | null {
  const t = normalizeStepText(step);

  // Use non-greedy matches so each field stops before the next label.
  const re =
    /MOVE:\s*(.*?)\s*\|\s*WINDOW:\s*(.*?)\s*\|\s*IMPACT:\s*(.*?)\s*\|\s*MINDSET:\s*(.*)$/i;
  const m = t.match(re);
  if (!m) return null;

  return {
    move: m[1].trim(),
    window: m[2].trim(),
    impact: m[3].trim(),
    mindset: m[4].trim(),
  };
}

