"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import HomeScreen from "@/components/HomeScreen";
import ClarityTransition from "@/components/ClarityTransition";
import NorthLoader from "@/components/NorthLoader";
import { getAnalysis, getMessage } from "@/lib/api";
import type { AnalysisResult } from "@/types";

/** Minimum time loader is visible (wiggle + lock + hold at North). Must match NorthLoader timing. */
const MIN_LOADING_MS = 2600;

export default function LifeAssistApp() {
  const [view, setView] = useState<"home" | "results">("home");
  const [loading, setLoading] = useState(false);
  const [lockComplete, setLockComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalInput, setOriginalInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const pendingInputRef = useRef<string | null>(null);

  const runAnalysis = (input: string) => {
    setError(null);
    setLockComplete(false);
    setOriginalInput(input);
    pendingInputRef.current = input;
    setLoading(true);
  };

  // Transition to results only after needle has locked to North (onLockComplete) and we have data.
  useEffect(() => {
    if (result && lockComplete && loading) {
      setView("results");
      setLoading(false);
      setLockComplete(false);
      pendingInputRef.current = null;
    }
  }, [result, lockComplete, loading]);

  useEffect(() => {
    if (!loading || pendingInputRef.current === null) return;
    const input = pendingInputRef.current;
    const start = Date.now();
    let cancelled = false;

    (async () => {
      await new Promise((r) => setTimeout(r, 200));
      if (cancelled) return;
      try {
        const data = await getAnalysis(input);
        if (cancelled) return;
        const elapsed = Date.now() - start;
        await new Promise((r) => setTimeout(r, Math.max(0, MIN_LOADING_MS - elapsed)));
        if (cancelled) return;
        setResult(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
          setLoading(false);
          pendingInputRef.current = null;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loading]);

  const handleGenerateMessage = async (tone?: string) => {
    if (!result) return;
    setMessageLoading(true);
    try {
      const { getMessage } = await import("@/lib/api");
      const { message } = await getMessage(originalInput, result, tone ?? "Professional");
      setResult((prev) => (prev ? { ...prev, message } : null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate message.");
    } finally {
      setMessageLoading(false);
    }
  };

  const showResults = view === "results" && result !== null;

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-2 text-sm shadow">
          {error}
        </div>
      )}
      <NorthLoader
        show={loading}
        readyToLock={result !== null}
        onLockComplete={() => setLockComplete(true)}
      />
      {showResults ? (
        <div className="min-h-screen bg-gray-50 pb-12">
          <Header />
          <ClarityTransition
            isProcessing={false}
            resultData={result}
            originalInput={originalInput}
            onBack={() => {
              setView("home");
              setError(null);
            }}
            onGenerateMessage={() => handleGenerateMessage()}
            onToneChange={(tone) => handleGenerateMessage(tone)}
            onAdjustPlan={() => {}}
            onFollowUp={() => {}}
            messageLoading={messageLoading}
          />
        </div>
      ) : (
        <>
          <Header />
          <HomeScreen onSubmit={runAnalysis} isLoading={loading} />
        </>
      )}
    </>
  );
}
