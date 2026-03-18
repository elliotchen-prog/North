import type { NextApiRequest, NextApiResponse } from 'next';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/hunter-alpha';

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

  const systemPrompt = `You are an AI life assistant. Given the user's situation and context, generate a short communication draft message. Write the message in a ${toneLabel} tone. Return ONLY a JSON object: { "message": "your draft here" }. No markdown, no extra text. Keep the message brief.`;

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
    const rawText = String(choices?.[0]?.message?.content ?? '')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    let parsed: Record<string, unknown> | null = null;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      try {
        parsed = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1)) as Record<string, unknown>;
      } catch {
        // ignore
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      console.warn('OpenRouter message response not parseable, using fallback. Raw:', rawText.slice(0, 300));
      parsed = { message: "I'd like to talk this through when you have a moment." };
    }
    const result = normalizeMessageResult(parsed);
    res.status(200).json(result);
  } catch (err) {
    console.error('Message handler error:', err);
    res.status(500).json({ message: 'OpenRouter API error', error: String(err) });
  }
}
