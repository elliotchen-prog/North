"use client";

import { motion, AnimatePresence } from "framer-motion";
import ActionPlan from "@/components/ActionPlan";
import MessageSection from "@/components/MessageSection";
import FollowUpHook from "@/components/FollowUpHook";
import PossibleCauses from "@/components/PossibleCauses";
import ResourceFeed from "@/components/ResourceFeed";
import type { AnalysisResult } from "@/types";

const cardStyle = {
  background: "#fff",
  padding: "1.5rem",
  borderRadius: "8px",
  marginBottom: "1rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

interface ClarityTransitionProps {
  isProcessing: boolean;
  resultData: AnalysisResult | null;
  originalInput?: string;
  onBack?: () => void;
  onGenerateMessage?: () => void;
  onToneChange?: (tone: string) => void;
  onAdjustPlan?: () => void;
  onFollowUp?: () => void;
  messageLoading?: boolean;
}

export default function ClarityTransition({
  isProcessing,
  resultData,
  originalInput = "",
  onBack,
  onGenerateMessage,
  onToneChange,
  onAdjustPlan,
  onFollowUp,
  messageLoading,
}: ClarityTransitionProps) {
  if (isProcessing) return null;
  if (!resultData) return null;

  const topicHint = originalInput || resultData.situation;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.main
          key="results-page"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.08 },
            },
          }}
          className="max-w-5xl mx-auto mt-8 px-4 space-y-6"
        >
          {onBack && (
                <motion.button
                  variants={{ hidden: { y: -10, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                  onClick={onBack}
                  className="text-stone-500 hover:text-stone-700 text-sm flex items-center gap-1 hover:-translate-x-0.5 transition-transform duration-150"
                >
                  ← Back
                </motion.button>
              )}

              {/* Identity card */}
              <motion.div
                variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                className="bg-white p-6 rounded-xl shadow-sm text-center border"
                style={{ borderColor: "var(--border)" }}
              >
                <h1
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ color: "var(--north-navy)" }}
                >
                  AI Life Assistant
                </h1>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  Analysis for: &quot;{originalInput || "your situation"}&quot;
                </p>
              </motion.div>

              {/* Situation */}
              <motion.div
                variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                style={cardStyle}
              >
                <h2 className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "var(--compass-gold)" }}>
                  The Situation
                </h2>
                <p className="text-stone-800 font-medium">{resultData.situation}</p>
              </motion.div>

              {/* Possible causes */}
              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                <PossibleCauses causes={resultData.causes} />
              </motion.div>

              {/* Main + sidebar layout */}
              <section className="mt-4 flex flex-col lg:flex-row gap-6 items-start">
                {/* Sidebar: Resources for You */}
                <motion.div
                  variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                  className="w-full lg:w-[32%]"
                >
                  <ResourceFeed topic={topicHint} />
                </motion.div>

                {/* Primary column: Action plan & tools */}
                <div className="w-full lg:w-[68%] space-y-6">
                  {/* Action plan */}
                  <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                    <ActionPlan steps={resultData.plan} />
                  </motion.div>

                  {/* Message draft */}
                  <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                    <MessageSection
                      initialDraft={resultData.message || ""}
                      isEmpty={!resultData.message}
                      onToneChange={onToneChange}
                      messageLoading={messageLoading}
                    />
                  </motion.div>

                  {/* Tools */}
                  <motion.div
                    variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                    className="bg-white p-6 rounded-xl shadow-sm border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--north-navy)" }}>
                      Tools
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {onGenerateMessage && (
                        <button
                          onClick={onGenerateMessage}
                          disabled={messageLoading}
                          className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-stone-300 hover:bg-white/80 transition-colors disabled:opacity-60"
                        >
                          {messageLoading ? "Generating…" : "Generate message"}
                        </button>
                      )}
                      {onAdjustPlan && (
                        <button
                          onClick={onAdjustPlan}
                          className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-stone-300 hover:bg-white/80 transition-colors"
                        >
                          Adjust plan
                        </button>
                      )}
                      {onFollowUp && (
                        <button
                          onClick={onFollowUp}
                          className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-stone-300 hover:bg-white/80 transition-colors"
                        >
                          Ask follow-up
                        </button>
                      )}
                    </div>
                  </motion.div>

                  {/* Follow-up hook */}
                  <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                    <FollowUpHook />
                  </motion.div>
                </div>
              </section>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
