"use client";

import { useEffect, useState } from "react";
import type { ResourceArticle } from "@/types";
import { getResourcesForPlan } from "@/lib/api";

interface ResourceFeedProps {
  topic: string;
}

export default function ResourceFeed({ topic }: ResourceFeedProps) {
  const [articles, setArticles] = useState<ResourceArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const planText = topic || "your plan";
        const res = await getResourcesForPlan(planText);
        if (cancelled) return;
        setArticles(res);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Could not load resources.");
        setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [topic]);

  return (
    <aside
      className="rounded-xl p-4 sm:p-5 lg:p-6 text-sm space-y-4"
      style={{
        backgroundColor: "#020617",
        boxShadow: "0 16px 40px rgba(15,23,42,0.65)",
      }}
    >
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#64748b" }}>
          Resources for you
        </p>
        <h2 className="text-base sm:text-lg font-semibold text-white">
          Based on this action plan
        </h2>
      </header>

      <div className="space-y-3">
        {loading ? (
          <div className="text-slate-400 text-sm">Loading resources...</div>
        ) : error ? (
          <div className="text-red-300 text-sm">{error}</div>
        ) : articles.length ? (
          articles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-3 sm:px-4 sm:py-3.5 hover:border-slate-600 hover:bg-slate-800/50 transition-colors"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">
                {article.source}
              </p>
              <h3 className="text-sm font-semibold text-slate-50 mb-1.5">
                {article.title}
              </h3>
              <p className="text-xs text-slate-300 mb-2 line-clamp-3">
                {article.description}
              </p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{article.readTime}</span>
                <span className="font-semibold tracking-wide" style={{ color: "var(--accent)" }}>
                  Read more →
                </span>
              </div>
            </a>
          ))
        ) : (
          <div className="text-slate-400 text-sm">No resources found.</div>
        )}
      </div>
    </aside>
  );
}

