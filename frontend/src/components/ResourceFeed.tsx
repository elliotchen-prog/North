"use client";

interface ResourceArticle {
  id: string;
  title: string;
  description: string;
  readTime: string;
  source: string;
  url: string;
}

function getResourcesForTopic(topic: string): ResourceArticle[] {
  const lower = topic.toLowerCase();

  if (
    lower.includes("depress") ||
    lower.includes("mood") ||
    lower.includes("mental") ||
    lower.includes("anxiety") ||
    lower.includes("overwhelm") && (lower.includes("feel") || lower.includes("emotional"))
  ) {
    return [
      {
        id: "mental-1",
        title: "Mental Health and Self-Care",
        description: "Evidence-based information on mental health, stress, and when to seek support.",
        readTime: "5 min read",
        source: "mentalhealth.gov",
        url: "https://www.mentalhealth.gov/basics/what-is-mental-health",
      },
      {
        id: "mental-2",
        title: "Coping with Stress and Low Mood",
        description: "Practical strategies and resources for managing daily stress and low mood.",
        readTime: "6 min read",
        source: "Mind",
        url: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/stress/",
      },
      {
        id: "mental-3",
        title: "NAMI Resources and Support",
        description: "Information and support for mental health from the National Alliance on Mental Illness.",
        readTime: "4 min read",
        source: "NAMI",
        url: "https://www.nami.org/About-Mental-Illness/Mental-Health-Conditions",
      },
    ];
  }

  if (
    lower.includes("work") ||
    lower.includes("job") ||
    lower.includes("career") ||
    lower.includes("burnout") ||
    lower.includes("overwhelm") ||
    lower.includes("stress") ||
    lower.includes("presentation") ||
    lower.includes("manager") ||
    lower.includes("workload")
  ) {
    return [
      {
        id: "work-1",
        title: "Job Burnout: How to Spot It and Take Action",
        description: "Signs of burnout and practical steps to protect your well-being at work.",
        readTime: "6 min read",
        source: "Mayo Clinic",
        url: "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/burnout/art-20046642",
      },
      {
        id: "work-2",
        title: "How to Have a Difficult Conversation with Your Boss",
        description: "Frameworks for discussing workload, boundaries, and priorities professionally.",
        readTime: "8 min read",
        source: "Harvard Business Review",
        url: "https://hbr.org/2022/01/how-to-have-a-difficult-conversation-with-your-boss",
      },
      {
        id: "work-3",
        title: "Managing Work-Related Stress",
        description: "Evidence-based tips to reduce stress and set sustainable boundaries.",
        readTime: "5 min read",
        source: "Mind",
        url: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/stress/workplace-stress/",
      },
    ];
  }

  if (
    lower.includes("relationship") ||
    lower.includes("partner") ||
    lower.includes("roommate") ||
    lower.includes("family") ||
    lower.includes("conflict") ||
    lower.includes("argument") ||
    lower.includes("communication")
  ) {
    return [
      {
        id: "rel-1",
        title: "The Four Horsemen: Criticism, Contempt, Defensiveness, and Stonewalling",
        description: "Research-backed patterns that harm relationships and how to replace them.",
        readTime: "7 min read",
        source: "The Gottman Institute",
        url: "https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling/",
      },
      {
        id: "rel-2",
        title: "How to Have Difficult Conversations",
        description: "A practical guide to bringing up hard topics without escalating conflict.",
        readTime: "6 min read",
        source: "Mind Tools",
        url: "https://www.mindtools.com/ax0bx0u/having-difficult-conversations",
      },
      {
        id: "rel-3",
        title: "Conflict Resolution Skills",
        description: "Steps and phrases that help resolve disagreements and repair trust.",
        readTime: "5 min read",
        source: "HelpGuide",
        url: "https://www.helpguide.org/articles/relationships-communication/conflict-resolution-skills.htm",
      },
    ];
  }

  // General / life clarity
  return [
    {
      id: "gen-1",
      title: "How to Make Hard Decisions",
      description: "A simple framework to clarify what matters and choose when you feel stuck.",
      readTime: "10 min read",
      source: "TED Ideas",
      url: "https://ideas.ted.com/how-to-make-a-tough-decision/",
    },
    {
      id: "gen-2",
      title: "Coping with Change and Uncertainty",
      description: "Practical ways to stay grounded when things feel uncertain.",
      readTime: "6 min read",
      source: "Mind",
      url: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/coping-with-change/",
    },
    {
      id: "gen-3",
      title: "Setting Personal Boundaries",
      description: "Why boundaries help and how to set them without guilt.",
      readTime: "8 min read",
      source: "Psych Central",
      url: "https://psychcentral.com/lib/how-to-create-and-maintain-healthy-boundaries",
    },
    ];
  }

interface ResourceFeedProps {
  topic: string;
}

export default function ResourceFeed({ topic }: ResourceFeedProps) {
  const articles = getResourcesForTopic(topic || "your situation");

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
          Based on this situation
        </h2>
      </header>

      <div className="space-y-3">
        {articles.map((article) => (
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
        ))}
      </div>
    </aside>
  );
}

