"use client";

import { useState } from "react";

interface ActionPlanProps {
  steps: string[];
}

export default function ActionPlan({ steps }: ActionPlanProps) {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const doneCount = Object.values(checkedSteps).filter(Boolean).length;

  return (
    <div
      className="rounded-lg shadow-sm p-6 mb-6"
      style={{
        background: "#fff",
        borderLeft: "4px solid var(--compass-gold)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        className="font-bold mb-4 tracking-wide uppercase text-sm"
        style={{ color: "var(--north-navy)" }}
      >
        Action plan
      </h3>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            onClick={() => toggleStep(index)}
            className="flex items-center gap-4 cursor-pointer group"
          >
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                checkedSteps[index]
                  ? "border-[var(--compass-gold)]"
                  : "border-stone-300 group-hover:border-[var(--compass-gold)]"
              }`}
              style={
                checkedSteps[index]
                  ? { background: "var(--compass-gold)" }
                  : undefined
              }
            >
              {checkedSteps[index] && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>

            <span
              className={`text-base transition-all ${
                checkedSteps[index]
                  ? "text-stone-400 line-through"
                  : "text-stone-700 font-medium"
              }`}
            >
              {index + 1}. {step}
            </span>
          </div>
        ))}
      </div>

      <div
        className="mt-6 pt-4 flex justify-between items-center text-sm"
        style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
      >
        <span>Moving from confusion to action...</span>
        <span className="font-bold" style={{ color: "var(--north-navy)" }}>
          {doneCount} / {steps.length} Done
        </span>
      </div>
    </div>
  );
}
