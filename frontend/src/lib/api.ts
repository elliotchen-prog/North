const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface AnalysisResult {
  situation: string;
  causes: string[];
  plan: string[];
  message?: string;
}

export async function analyzeSituation(
  userInput: string
): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: userInput }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || res.statusText);
  }
  return res.json();
}

export async function generateMessage(
  userInput: string,
  context: AnalysisResult
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: userInput, situation: context }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || res.statusText);
  }
  return res.json();
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

export async function getAnalysis(userInput: string): Promise<AnalysisResult> {
  if (USE_MOCK) return mockAnalyzeSituation(userInput);
  return analyzeSituation(userInput);
}

export async function getMessage(
  userInput: string,
  context: AnalysisResult
): Promise<{ message: string }> {
  if (USE_MOCK) return mockGenerateMessage(context);
  return generateMessage(userInput, context);
}

async function mockGenerateMessage(
  context: AnalysisResult
): Promise<{ message: string }> {
  await new Promise((r) => setTimeout(r, 600));
  const template =
    context.situation.toLowerCase().includes("work") ||
    context.situation.toLowerCase().includes("stress")
      ? "Hi [Manager], I want to make sure I'm focusing on the right priorities. Could we briefly review my current tasks and confirm what should come first?"
      : context.situation.toLowerCase().includes("relationship") ||
        context.situation.toLowerCase().includes("conflict")
        ? "Hi, I'd like to find a way we can both feel good about this. Can we set a time to talk when we're both calm?"
        : "Hi, I've been thinking about what we discussed. I'd like to share my perspective and hear yours when you have a moment.";
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
