import type { ResourceArticle } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface AnalysisResult {
  situation: string;
  causes: string[];
  plan: string[];
  message?: string;
}

function parseResourcesResponse(body: unknown): ResourceArticle[] {
  const arr = body && typeof body === "object" ? (body as any).resources : null;
  if (!Array.isArray(arr)) return [];

  return arr
    .map((r: any, idx: number) => {
      const url = typeof r?.url === "string" ? r.url : "";
      const title = typeof r?.title === "string" ? r.title : "";
      const description = typeof r?.description === "string" ? r.description : "";
      const readTime = typeof r?.readTime === "string" ? r.readTime : "";
      const source = typeof r?.source === "string" ? r.source : "";
      if (!url || !title) return null;
      return {
        id: typeof r?.id === "string" ? r.id : `resource-${idx}`,
        title,
        description: description || "Learn more",
        readTime: readTime || "Recommended",
        source: source || "Resource",
        url,
      } satisfies ResourceArticle;
    })
    .filter(Boolean) as ResourceArticle[];
}

function ensureString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return String(value);
}

function ensureStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value))
    return value.map((v) => (v != null ? String(v) : "")).filter(Boolean);
  if (typeof value === "string") return value ? [value] : [];
  return [];
}

/** Parse and normalize /analyze response so frontend always gets a valid AnalysisResult. */
function parseAnalysisResponse(body: unknown): AnalysisResult {
  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  return {
    situation: ensureString(o.situation).trim() || "Your situation",
    causes: ensureStringArray(o.causes),
    plan: ensureStringArray(o.plan),
    message:
      o.message != null ? ensureString(o.message).trim() || undefined : undefined,
  };
}

/** Parse and normalize /message response so frontend always gets { message: string }. */
function parseMessageResponse(body: unknown): { message: string } {
  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const message = ensureString(o.message).trim();
  return { message: message || "I'd like to talk this through when you have a moment." };
}

export async function analyzeSituation(
  userInput: string
): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: userInput }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { message?: string }).message || res.statusText);
  }
  return parseAnalysisResponse(body);
}

export async function generateMessage(
  userInput: string,
  context: AnalysisResult,
  tone?: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: userInput,
      situation: context,
      ...(tone && { tone }),
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { message?: string }).message || res.statusText);
  }
  return parseMessageResponse(body);
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

export async function getAnalysis(userInput: string): Promise<AnalysisResult> {
  if (USE_MOCK) return mockAnalyzeSituation(userInput);
  return analyzeSituation(userInput);
}

export async function getMessage(
  userInput: string,
  context: AnalysisResult,
  tone?: string
): Promise<{ message: string }> {
  if (USE_MOCK) return mockGenerateMessage(context, tone);
  return generateMessage(userInput, context, tone);
}

export async function getResourcesForPlan(planText: string): Promise<ResourceArticle[]> {
  if (USE_MOCK) return mockResourcesForPlan(planText);

  const res = await fetch(`${API_BASE}/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: planText }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { message?: string }).message || res.statusText);
  }
  return parseResourcesResponse(body);
}

/** Topic-aware mock resources for demo / when NEXT_PUBLIC_USE_MOCK_API=true. */
async function mockResourcesForPlan(planText: string): Promise<ResourceArticle[]> {
  await new Promise((r) => setTimeout(r, 200));
  const lower = (planText || "").toLowerCase();

  if (lower.includes("depress") || lower.includes("mood") || lower.includes("mental")) {
    return [
      {
        id: "mock-dep-1",
        title: "Understanding the Science of Mood",
        description:
          "How sleep, stress, and daily rhythms shape how you feel—and what you can influence first.",
        readTime: "8 min read",
        source: "North Library",
        url: "https://www.nimh.nih.gov/health/topics/depression",
      },
      {
        id: "mock-dep-2",
        title: "5 Daily Habits for Mental Clarity",
        description: "Small, evidence-backed routines you can stack without a full life overhaul.",
        readTime: "6 min read",
        source: "Behavioral Insights",
        url: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/stress/",
      },
      {
        id: "mock-dep-3",
        title: "What to Do on a Heavy Day",
        description: "A gentle checklist when energy is low and you still want one kind step forward.",
        readTime: "4 min read",
        source: "North Guides",
        url: "https://www.mind.org.uk/information-support/looking-after-your-mental-health/self-care/",
      },
      {
        id: "mock-dep-4",
        title: "When to Seek Professional Support",
        description: "Signals that talking to a clinician or therapist is the right next move.",
        readTime: "5 min read",
        source: "NIMH",
        url: "https://www.nimh.nih.gov/health/find-help",
      },
    ];
  }

  if (
    lower.includes("work") ||
    lower.includes("job") ||
    lower.includes("career") ||
    lower.includes("burnout") ||
    lower.includes("manager") ||
    lower.includes("priorit")
  ) {
    return [
      {
        id: "mock-work-1",
        title: "Resetting Your Relationship With Work",
        description: "Separate identity from your inbox while still moving your career forward.",
        readTime: "7 min read",
        source: "North Careers",
        url: "https://www.mindtools.com/a4v4m2b/choosing-your-next-step",
      },
      {
        id: "mock-work-2",
        title: "Designing a Sustainable Workday",
        description: "Balance focus blocks, admin, and recovery without the guilt spiral.",
        readTime: "9 min read",
        source: "Productivity Lab",
        url: "https://www.apa.org/topics/stress/manage-social-support",
      },
      {
        id: "mock-work-3",
        title: "Talking to Your Manager About Capacity",
        description: "Language that sets boundaries while staying collaborative.",
        readTime: "5 min read",
        source: "North Playbook",
        url: "https://www.apa.org/topics/stress/work",
      },
    ];
  }

  if (
    lower.includes("relationship") ||
    lower.includes("roommate") ||
    lower.includes("partner") ||
    lower.includes("conflict") ||
    lower.includes("boundary") ||
    lower.includes("conversation")
  ) {
    return [
      {
        id: "mock-rel-1",
        title: "From Reacting to Responding",
        description: "A short pause pattern for tense conversations so things don’t escalate.",
        readTime: "5 min read",
        source: "North Communication",
        url: "https://www.apa.org/topics/anger/control",
      },
      {
        id: "mock-rel-2",
        title: "How to Share a Hard Truth",
        description: "Scripts for sensitive topics without blindsiding the other person.",
        readTime: "7 min read",
        source: "North Guides",
        url: "https://psychcentral.com/lib/benefits-of-positive-communication",
      },
      {
        id: "mock-rel-3",
        title: "Repairing After an Argument",
        description: "Small moves that rebuild trust after things got heated.",
        readTime: "4 min read",
        source: "Everyday Psychology",
        url: "https://www.psychologytoday.com/us/basics/conflict-resolution",
      },
    ];
  }

  return [
    {
      id: "mock-gen-1",
      title: "Zooming Out: A 10-Minute Life Review",
      description: "See which life area is asking for attention right now, without a big workshop.",
      readTime: "10 min read",
      source: "North Library",
      url: "https://www.mindtools.com/a4v4m2b/choosing-your-next-step",
    },
    {
      id: "mock-gen-2",
      title: "Making Progress When You Feel Stuck",
      description: "Low-pressure moves that still count as momentum toward the life you want.",
      readTime: "6 min read",
      source: "Behavioral Insights",
      url: "https://www.apa.org/topics/stress/manage",
    },
    {
      id: "mock-gen-3",
      title: "Designing Your Next Week With Intention",
      description: "Turn vague goals into one to three concrete commitments for the week ahead.",
      readTime: "8 min read",
      source: "North Playbook",
      url: "https://www.mind.org.uk/information-support/looking-after-your-mental-health/self-care/",
    },
    {
      id: "mock-gen-4",
      title: "Healthy Boundaries 101",
      description: "Why boundaries create capacity when your plate is full.",
      readTime: "8 min read",
      source: "Psych Central",
      url: "https://psychcentral.com/lib/how-to-create-and-maintain-healthy-boundaries",
    },
  ];
}

async function mockGenerateMessage(
  context: AnalysisResult,
  tone?: string
): Promise<{ message: string }> {
  await new Promise((r) => setTimeout(r, 600));
  const t = (tone || "Professional").toLowerCase();
  let template =
    context.situation.toLowerCase().includes("work") ||
    context.situation.toLowerCase().includes("stress")
      ? "Hi [Manager], I want to make sure I'm focusing on the right priorities. Could we briefly review my current tasks and confirm what should come first?"
      : context.situation.toLowerCase().includes("relationship") ||
        context.situation.toLowerCase().includes("conflict")
        ? "Hi, I'd like to find a way we can both feel good about this. Can we set a time to talk when we're both calm?"
        : "Hi, I've been thinking about what we discussed. I'd like to share my perspective and hear yours when you have a moment.";
  if (t === "direct") template = "Can we sync on priorities and next steps? I'd like to align and move forward.";
  if (t === "gentle") template = "I've been reflecting on this and would really value a chance to talk when you're free. No rush—just whenever works for you.";
  return { message: template };
}

/** Mock for development when backend is not running. */
export async function mockAnalyzeSituation(
  userInput: string
): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 800));
  const lower = userInput.toLowerCase();
  if (lower.includes("roommate") || lower.includes("arguing") || lower.includes("conflict")) {
    return {
      situation: "Relationship conflict",
      causes: ["Communication breakdown", "Expectations mismatch", "Unresolved boundaries"],
      plan: [
        "Clarify expectations with your roommate",
        "Schedule a calm, private conversation",
        "Establish shared agreements (chores, noise, guests)",
        "Follow up in writing if needed",
      ],
      message: "Hi, I'd like to find a way we can both feel good about living together. Can we set a time to talk when we're both calm?",
    };
  }
  if (lower.includes("better job") || lower.includes("career")) {
    return {
      situation: "Career change",
      causes: ["Desire for growth", "Current role limitations", "Market opportunities"],
      plan: [
        "Clarify what you want (role, industry, balance)",
        "Update your resume and LinkedIn",
        "Reach out to 2–3 people in target roles",
        "Set a weekly application goal",
      ],
      message:
        "Hi [Recipient], I'm reaching out because I'm exploring new opportunities that align with my goals. I'd value a brief conversation to learn more about [role/team/company]. Would you have 15 minutes for a chat in the coming week?",
    };
  }
  if (lower.includes("overwhelm") || lower.includes("work")) {
    return {
      situation: "Work stress / workload overload",
      causes: ["Task overload", "Unclear priorities", "Communication gaps"],
      plan: [
        "Identify your top 3 priorities",
        "Clarify deadlines with your manager",
        "Block focused work time on your calendar",
        "Reduce or delegate low-value tasks",
      ],
      message: "Hi [Manager], I want to make sure I'm focusing on the right things. Could we briefly review current tasks and confirm what should come first?",
    };
  }
  return {
    situation: "General life challenge",
    causes: ["Multiple factors", "Unclear next step"],
    plan: [
      "Write down the main problem in one sentence",
      "List 2–3 possible next steps",
      "Choose one small action for today",
      "Review tomorrow and adjust",
    ],
    message:
      "Hi, I've been reflecting on this and would like to talk it through. Can we find a time to connect? I'd appreciate your perspective.",
  };
}
