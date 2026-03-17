"use client";

interface ResourceArticle {
  id: string;
  title: string;
  description: string;
  readTime: string;
  source: string;
}

function getMockResources(topic: string): ResourceArticle[] {
  const lower = topic.toLowerCase();

  if (lower.includes("depress") || lower.includes("mood") || lower.includes("mental")) {
    return [
      {
        id: "depression-1",
        title: "Understanding the Science of Mood",
        description: "A simple breakdown of how brain chemistry, sleep, and stress shape the way you feel day to day.",
        readTime: "8 min read",
        source: "North Library",
      },
      {
        id: "depression-2",
        title: "5 Daily Habits for Mental Clarity",
        description: "Tiny, evidence-backed routines you can stack onto what you already do—no full life makeover required.",
        readTime: "6 min read",
        source: "Behavioral Insights",
      },
      {
        id: "depression-3",
        title: "What to Do on a Heavy Day",
        description: "A light checklist for when your energy is low but you still want to take one kind step for yourself.",
        readTime: "4 min read",
        source: "North Guides",
      },
    ];
  }

  if (lower.includes("work") || lower.includes("job") || lower.includes("career") || lower.includes("burnout")) {
    return [
      {
        id: "work-1",
        title: "Resetting Your Relationship With Work",
        description: "How to separate your identity from your to-do list and still move your career forward.",
        readTime: "7 min read",
        source: "North Careers",
      },
      {
        id: "work-2",
        title: "Designing a Sustainable Workday",
        description: "A practical framework to balance focus time, admin, and recovery without feeling guilty.",
        readTime: "9 min read",
        source: "Productivity Lab",
      },
      {
        id: "work-3",
        title: "Talking to Your Manager About Capacity",
        description: "Language you can borrow to set boundaries while still sounding like a team player.",
        readTime: "5 min read",
        source: "North Playbook",
      },
    ];
  }

  if (lower.includes("relationship") || lower.includes("partner") || lower.includes("roommate") || lower.includes("family")) {
    return [
      {
        id: "relationship-1",
        title: "From Reacting to Responding",
        description: "A 3-step pause you can use in almost any tense conversation to keep things from escalating.",
        readTime: "5 min read",
        source: "North Communication",
      },
      {
        id: "relationship-2",
        title: "How to Share a Hard Truth",
        description: "A simple script for bringing up sensitive topics without blindsiding the other person.",
        readTime: "7 min read",
        source: "North Guides",
      },
      {
        id: "relationship-3",
        title: "Repairing After an Argument",
        description: "Concrete phrases and small gestures that rebuild trust after things got heated.",
        readTime: "4 min read",
        source: "Everyday Psychology",
      },
    ];
  }

  // Default, general-purpose resources.
  return [
    {
      id: "general-1",
      title: "Zooming Out: A 10-Minute Life Review",
      description: "A guided reflection to quickly see which area of life is asking for your attention right now.",
      readTime: "10 min read",
      source: "North Library",
    },
    {
      id: "general-2",
      title: "Making Progress When You Feel Stuck",
      description: "Tiny, low-pressure moves that still count as real momentum toward the life you want.",
      readTime: "6 min read",
      source: "Behavioral Insights",
    },
    {
      id: "general-3",
      title: "Designing Your Next Week With Intention",
      description: "A short planning ritual that turns vague goals into 1–3 concrete, doable commitments.",
      readTime: "8 min read",
      source: "North Playbook",
    },
  ];
}

interface ResourceFeedProps {
  topic: string;
}

export default function ResourceFeed({ topic }: ResourceFeedProps) {
  const articles = getMockResources(topic || "your situation");

  return (
    <aside
      className="rounded-xl p-4 sm:p-5 lg:p-6 text-sm space-y-4"
      style={{
        backgroundColor: "#020617", // slate-900
        boxShadow: "0 16px 40px rgba(15,23,42,0.65)",
      }}
    >
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#64748b" }}>
          Resources for you
        </p>
        <h2 className="text-base sm:text-lg font-semibold text-white">
          Based on this situation
        </h2>
      </header>

      <div className="space-y-3">
        {articles.map((article) => (
          <div
            key={article.id}
            className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-3 sm:px-4 sm:py-3.5"
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
              <button
                type="button"
                className="font-semibold tracking-wide"
                style={{ color: "var(--accent)" }}
              >
                Read more →
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

