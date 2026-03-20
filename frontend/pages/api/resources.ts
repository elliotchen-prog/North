import type { NextApiRequest, NextApiResponse } from "next";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openrouter/hunter-alpha";

function ensureString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return String(value);
}

function stripJsonCodeFences(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```?\s*$/i, "");
}

function tryParseJson(text: string): Record<string, unknown> | null {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return null;
  const json = text.slice(firstBrace, lastBrace + 1);
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  if (!apiKey) return res.status(500).json({ message: "Missing OpenRouter API key" });

  const { plan } = req.body;
  if (!plan || typeof plan !== "string") return res.status(400).json({ message: "Missing plan" });

  const systemPrompt = `You are a resource-finding assistant.
Given an ACTION PLAN, choose 3-5 highly relevant external links that help the user follow the plan.

Rules:
- Output ONLY valid JSON (no markdown, no extra text).
- JSON shape:
  {
    "resources": [
      { "title": string, "url": string, "description": string, "source": string, "readTime": string }
    ]
  }
- Prefer authoritative sources (official orgs, government, well-known institutions).
- Only include links that you are confident are real and relevant.
`;

  try {
    const llmRes = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "North",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Action plan:\n${plan}` },
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    const data = (await llmRes.json().catch(() => ({}))) as Record<string, unknown>;

    if (!llmRes.ok) {
      const err = data.error as { message?: string } | undefined;
      const msg = err?.message ?? (data.message as string) ?? llmRes.statusText;
      return res.status(llmRes.status).json({ message: msg || "OpenRouter API request failed" });
    }

    const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
    const rawText = ensureString(choices?.[0]?.message?.content);

    const cleaned = stripJsonCodeFences(rawText).trim();
    const parsed = tryParseJson(cleaned);

    const resources = Array.isArray((parsed as any)?.resources) ? (parsed as any).resources : [];
    const mapped = resources
      .map((r: any, idx: number) => {
        const url = ensureString(r?.url);
        const title = ensureString(r?.title);
        const description = ensureString(r?.description);
        const source = ensureString(r?.source);
        const readTime = ensureString(r?.readTime);
        if (!url || !title) return null;
        return {
          id: typeof r?.id === "string" ? r.id : `resource-${idx}`,
          title,
          url,
          description: description || "Learn more",
          source: source || "Resource",
          readTime: readTime || "Recommended",
        };
      })
      .filter(Boolean);

    // Always return something for the UI.
    const fallback = [
      {
        id: "fallback-1",
        title: "Start with the next right step",
        url: "https://www.mindtools.com/a4v4m2b/choosing-your-next-step",
        description: "A short framework for picking your next action when you're overwhelmed.",
        source: "Mind Tools",
        readTime: "5 min read",
      },
      {
        id: "fallback-2",
        title: "Coping with stress and low mood",
        url: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/stress/",
        description: "Practical strategies to steady yourself so you can act with clarity.",
        source: "Mind",
        readTime: "6 min read",
      },
      {
        id: "fallback-3",
        title: "Setting personal boundaries",
        url: "https://psychcentral.com/lib/how-to-create-and-maintain-healthy-boundaries",
        description: "Why boundaries create capacity and reduce friction when plans get messy.",
        source: "Psych Central",
        readTime: "8 min read",
      },
    ];

    res.status(200).json({
      resources: mapped.length ? mapped : fallback,
    });
  } catch (err) {
    console.error("Resources handler error:", err);
    res.status(500).json({ message: "OpenRouter API error", error: String(err) });
  }
}

