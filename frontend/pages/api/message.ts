import type { NextApiRequest, NextApiResponse } from 'next';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/hunter-alpha';

import { parseMessageTextToResult } from "@/lib/llm/parse";

function ensureString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return String(value);
}

/** Normalize parsed JSON to { message: string } for the frontend. */
function normalizeMessageResult(parsed: Record<string, unknown>): { message: string } {
  const message = ensureString(parsed.message).trim();
  return { message: message || "I'd like to talk this through when you have a moment." };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  if (!apiKey) return res.status(500).json({ message: 'Missing OpenRouter API key' });
  const { input, situation, tone } = req.body;
  if (!input || !situation) return res.status(400).json({ message: 'Missing input or situation' });
  const toneLabel = typeof tone === 'string' && tone.trim() ? tone.trim() : 'Professional';

  const systemPrompt = `You are an elite-level life coach.
Write a short communication draft in a ${toneLabel} tone.
Use the provided situation context to sound precise, not generic.

Return ONLY a single valid JSON object (no markdown, no extra text):
{ "message": "your draft here" }

Message rules:
- 1-3 short sentences
- include one crisp pattern-interrupt reframe sentence if it fits
- end with a clear next step request (a question or ask)`;

  try {
    const llmRes = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'North',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User input: ${input}\n\nSituation context: ${JSON.stringify(situation)}` },
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });
    const data = (await llmRes.json().catch(() => ({}))) as Record<string, unknown>;

    if (!llmRes.ok) {
      const err = data.error as { message?: string } | undefined;
      const msg = err?.message ?? (data.message as string) ?? llmRes.statusText;
      console.error('OpenRouter API error:', llmRes.status, msg, data);
      return res.status(llmRes.status).json({
        message: msg || 'OpenRouter API request failed',
      });
    }

    const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
    const llmText = String(choices?.[0]?.message?.content ?? "");
    const result = parseMessageTextToResult(llmText);
    res.status(200).json(result);
  } catch (err) {
    console.error('Message handler error:', err);
    res.status(500).json({ message: 'OpenRouter API error', error: String(err) });
  }
}
