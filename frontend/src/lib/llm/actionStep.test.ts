import { describe, expect, it } from "vitest";
import { parseActionStep } from "./actionStep";

describe("parseActionStep", () => {
  it("parses full MOVE/WINDOW/IMPACT/MINDSET format", () => {
    const step =
      "MOVE: Identify top 3 priorities | WINDOW: Today | IMPACT: clarity | MINDSET: I drive my focus";
    const parsed = parseActionStep(step);
    expect(parsed).not.toBeNull();
    expect(parsed?.move).toBe("Identify top 3 priorities");
    expect(parsed?.window).toBe("Today");
    expect(parsed?.impact).toBe("clarity");
    expect(parsed?.mindset).toBe("I drive my focus");
  });

  it("returns null if labels are missing", () => {
    const step = "This is not in the expected format";
    const parsed = parseActionStep(step);
    expect(parsed).toBeNull();
  });
});

