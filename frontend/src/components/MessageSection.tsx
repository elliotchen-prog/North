"use client";

import { useState } from "react";

const TONES = ["Professional", "Direct", "Gentle"] as const;

interface MessageSectionProps {
  initialDraft: string;
  isEmpty?: boolean;
}

export default function MessageSection({ initialDraft, isEmpty }: MessageSectionProps) {
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const [copied, setCopied] = useState(false);
  const draftText = (initialDraft || "").trim();
  const hasDraft = draftText.length > 0 && !isEmpty;

  const handleCopy = async () => {
    if (!hasDraft) return;
    const text = draftText;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-6 p-6 rounded-xl text-white" style={{ background: "var(--north-navy)" }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "var(--compass-gold)" }}>
          Message Draft
        </h3>
        <div
          className="flex p-1 rounded-lg border"
          style={{ background: "rgba(0,0,0,0.2)", borderColor: "rgba(212,175,55,0.3)" }}
        >
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                tone === t
                  ? "text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
              style={tone === t ? { background: "var(--compass-gold)", color: "var(--north-navy)" } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div
        className="p-4 rounded-lg font-mono text-sm leading-relaxed border min-h-[100px]"
        style={{ background: "rgba(0,0,0,0.2)", borderColor: "rgba(212,175,55,0.25)" }}
      >
        {hasDraft ? (
          <p className="text-slate-200 whitespace-pre-line">
            {draftText}
            {"\n\n"}
            <span className="text-slate-400 text-xs">(Tone: {tone})</span>
          </p>
        ) : (
          <p className="text-slate-400 italic">No draft yet. Click &quot;Generate message&quot; in Tools above to create one.</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        disabled={!hasDraft}
        className="mt-4 w-full py-2.5 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "var(--compass-gold)",
          color: "var(--north-navy)",
        }}
      >
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>
    </div>
  );
}
