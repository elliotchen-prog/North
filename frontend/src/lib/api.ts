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

async function mockResourcesForPlan(_planText: string): Promise<ResourceArticle[]> {
  // Keep mock simple; real behavior comes from the runtime model call.
  await new Promise((r) => setTimeout(r, 250));
  return [
    {
      id: "mock-1",
      title: "How to turn a plan into action (quick framework)",
      description: "A short guide to choosing the next right step and reducing overwhelm.",
      readTime: "5 min read",
      source: "North Guides",
      url: "https://www.mindtools.com/a4v4m2b/choosing-your-next-step",
    },
    {
      id: "mock-2",
      title: "Evidence-backed stress coping strategies",
      description: "Practical techniques that help you steady yourself and act with clarity.",
      readTime: "6 min read",
      source: "Mind",
      url: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/stress/",
    },
    {
      id: "mock-3",
      title: "Boundary setting basics",
      description: "Learn how boundaries create capacity and reduce friction.",
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
