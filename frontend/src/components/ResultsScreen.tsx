"use client";

import type { AnalysisResult } from "@/types";

interface ResultsScreenProps {
  result: AnalysisResult;
  originalInput: string;
  onBack: () => void;
  onGenerateMessage?: () => void;
  onAdjustPlan?: () => void;
  onFollowUp?: () => void;
  messageLoading?: boolean;
}

export default function ResultsScreen({
  result,
  originalInput,
  onBack,
  onGenerateMessage,
  onAdjustPlan,
  onFollowUp,
  messageLoading,
}: ResultsScreenProps) {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <button
        onClick={onBack}
        className="text-stone-500 hover:text-stone-700 text-sm mb-6 flex items-center gap-1 hover:-translate-x-0.5 transition-transform duration-150"
      >
        ← Back
      </button>

      <div className="space-y-6">
        {/* Situation card */}
        <section className="rounded-2xl border border-stone-200 border-l-4 border-l-teal-500 bg-white p-5 sm:p-6 shadow-sm ring-1 ring-stone-100 transition-shadow duration-200 hover:shadow">
          <h2 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-1">
            Situation
          </h2>
          <p className="text-lg font-medium text-stone-800">{result.situation}</p>
        </section>

        {/* Possible causes */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm ring-1 ring-stone-100 transition-shadow duration-200 hover:shadow">
          <h2 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-3">
            Possible causes
          </h2>
          <ul className="space-y-2">
            {result.causes.map((cause, i) => (
              <li key={i} className="flex items-start gap-2 text-stone-700">
                <span className="text-teal-500 mt-0.5">•</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Action plan */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm ring-1 ring-stone-100 transition-shadow duration-200 hover:shadow">
          <h2 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-3">
            Action plan
          </h2>
          <ol className="space-y-2 list-decimal list-inside text-stone-700">
            {result.plan.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        {/* Draft message (if present) */}
        {result.message && (
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm ring-1 ring-stone-100 transition-shadow duration-200 hover:shadow">
            <h2 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-3">
              Draft message
            </h2>
            <p className="text-stone-700 whitespace-pre-wrap">{result.message}</p>
          </section>
        )}

        {/* Tools */}
        <section className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 sm:p-6 ring-1 ring-stone-100">
          <h2 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-3">
            Tools
          </h2>
          <div className="flex flex-wrap gap-3">
            {onGenerateMessage && (
              <button
                onClick={onGenerateMessage}
                disabled={messageLoading}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-teal-300 hover:bg-teal-50/50 transition-colors duration-150 disabled:opacity-60"
              >
                {messageLoading ? "Generating…" : "Generate message"}
              </button>
            )}
            {onAdjustPlan && (
              <button
                onClick={onAdjustPlan}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-teal-300 hover:bg-teal-50/50 transition-colors duration-150"
              >
                Adjust plan
              </button>
            )}
            {onFollowUp && (
              <button
                onClick={onFollowUp}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-teal-300 hover:bg-teal-50/50 transition-colors duration-150"
              >
                Ask follow-up
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
