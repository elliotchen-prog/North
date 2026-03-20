import type { NextApiRequest, NextApiResponse } from 'next';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/hunter-alpha';

import { parseAnalysisTextToResult } from "@/lib/llm/parse";

/** Ensure value is a string for the frontend. */
function ensureString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return String(value);
}

/** Ensure value is a string[] for the frontend (handles LLM returning string or mixed array). */
function ensureStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map((v) => (v != null ? String(v) : '')).filter(Boolean);
  if (typeof value === 'string') return value ? [value] : [];
  return [];
}

/** Normalize parsed JSON to the AnalysisResult shape the frontend expects. */
function normalizeAnalysisResult(parsed: Record<string, unknown>): {
  situation: string;
  causes: string[];
  plan: string[];
  message?: string;
} {
  return {
    situation: ensureString(parsed.situation).trim() || 'Your situation',
    causes: ensureStringArray(parsed.causes),
    plan: ensureStringArray(parsed.plan),
    message: parsed.message != null ? ensureString(parsed.message).trim() || undefined : undefined,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  if (!apiKey) return res.status(500).json({ message: 'Missing OpenRouter API key' });
  const { input } = req.body;
  if (!input) return res.status(400).json({ message: 'Missing input' });

  const systemPrompt = `You are an elite-level life coach + behavioral analyst.
Decode the user's situation beneath the surface:
surface problem -> real problem -> emotional state -> hidden beliefs -> stakes.
Then produce causes labeled PRIMARY / CONTRIBUTING / UNDERLYING (choose 3-6 based on complexity) and an immediately actionable plan with 3-8 steps.

OUTPUT FORMAT (MUST BE EXACT):
Return ONLY a single valid JSON object (no markdown, no extra text) with exactly these keys:
"situation": string (one short sentence; the real decoded problem),
"causes": array of strings (3-6 items; each must include PRIMARY / CONTRIBUTING / UNDERLYING),
"plan": array of strings (3-8 items; each string must follow: MOVE: ... | WINDOW: ... | IMPACT: ... | MINDSET: ...),
"message": string (one short communication draft).

Keep strings brief so the whole JSON fits in one response. Example:
{"situation":"Work overload","causes":["PRIMARY: Too many urgent demands","CONTRIBUTING: Unclear priorities","UNDERLYING: Fear of saying no"],"plan":["MOVE: Identify top 3 priorities | WINDOW: Today | IMPACT: clarity | MINDSET: I drive my focus","MOVE: Draft what I will drop + what I will do | WINDOW: Within 48 hours | IMPACT: reduced overload | MINDSET: I protect my capacity","MOVE: Talk to manager about scope | WINDOW: Within 48 hours | IMPACT: alignment | MINDSET: I set boundaries"],"message":"Hi—can we align on priorities and agree what drops off my plate?"}`;

  try {
    const llmRes = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        // Recommended by OpenRouter for attribution/routing; safe defaults for local dev.
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'North',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User input: ${input}` },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });
    const data = (await llmRes.json().catch(() => ({}))) as Record<string, unknown>;

    if (!llmRes.ok) {
      const err = data.error as { message?: string } | undefined;
      const msg = err?.message || (data.message as string) || llmRes.statusText;
      console.error('OpenRouter API error:', llmRes.status, msg, data);
      return res.status(llmRes.status).json({
        message: msg || 'OpenRouter API request failed',
      });
    }

    const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
    const llmText = String(choices?.[0]?.message?.content ?? "");
    const result = parseAnalysisTextToResult(llmText);
    res.status(200).json(result);
  } catch (err) {
    console.error('Analyze handler error:', err);
    res.status(500).json({ message: 'OpenRouter API error', error: String(err) });
  }
}
