import type { NextApiRequest, NextApiResponse } from 'next';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/hunter-alpha';

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

  const systemPrompt = `You are an AI life assistant. Analyze the user's situation and return ONLY a single valid JSON object (no markdown, no extra text) with exactly these keys: "situation" (one short sentence), "causes" (array of 2-4 short strings), "plan" (array of 2-4 short action steps), "message" (one short communication draft). Keep every string brief so the full JSON fits in one response. Example: {"situation":"Work overload","causes":["Too many tasks","Unclear priorities"],"plan":["List top 3 priorities","Talk to manager"],"message":"Hi, can we align on priorities?"}`;

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
    let text = choices?.[0]?.message?.content ?? '';
    text = String(text).replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const jsonStart = text.indexOf('{');
    let parsed: Record<string, unknown> | null = null;

    const tryParse = (str: string): Record<string, unknown> | null => {
      const end = str.lastIndexOf('}');
      if (end === -1) return null;
      try {
        const obj = JSON.parse(str.slice(str.indexOf('{'), end + 1)) as Record<string, unknown>;
        return obj && typeof obj === 'object' ? obj : null;
      } catch {
        return null;
      }
    };

    parsed = tryParse(text);
    if (!parsed && jsonStart !== -1) {
      const trimmed = text.slice(jsonStart);
      const repairAttempts = [
        trimmed + '" }',           // truncated in the middle of a string value
        trimmed.replace(/,?\s*$/, ' }'), // truncated after a comma or space
      ];
      for (const repaired of repairAttempts) {
        parsed = tryParse(repaired);
        if (parsed) break;
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      const raw = text.slice(jsonStart);
      const situationMatch = raw.match(/"situation"\s*:\s*"((?:[^"\\]|\\.)*)/);
      const situationSnippet = situationMatch ? situationMatch[1].replace(/\\./g, (m) => m).trim().slice(0, 300) : '';

      const extractStringArray = (key: string): string[] => {
        const keyRe = new RegExp(`"${key}"\\s*:\\s*\\[`, 'i');
        const keyMatch = raw.match(keyRe);
        if (!keyMatch || keyMatch.index === undefined) return [];
        const start = keyMatch.index + keyMatch[0].length;
        let rest = raw.slice(start);
        const nextKey = rest.match(/\n\s*"(?:situation|causes|plan|message)"\s*:/);
        if (nextKey && nextKey.index !== undefined) rest = rest.slice(0, nextKey.index);
        const items: string[] = [];
        const quoted = rest.match(/"([^"]*)"/g);
        if (quoted) for (const q of quoted) items.push(q.slice(1, -1).trim().slice(0, 200));
        return items.slice(0, 6);
      };

      const causes = extractStringArray('causes');
      const plan = extractStringArray('plan');
      const messageMatch = raw.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)/);
      const messageSnippet = messageMatch ? messageMatch[1].replace(/\\./g, (m) => m).trim().slice(0, 500) : '';

      console.warn('OpenRouter response not parseable as JSON, using extracted fallback. Raw:', text.slice(0, 500));
      parsed = {
        situation: situationSnippet || 'Your situation',
        causes: causes.length ? causes : ['Reflecting on what’s going on', 'Considering next steps'],
        plan: plan.length ? plan : ['Write down the main issue in one sentence', 'Pick one small action you can take today', 'Review tomorrow and adjust'],
        message: messageSnippet || "I've been reflecting on this and would like to talk it through. Can we find a time to connect?",
      };
    }
    const result = normalizeAnalysisResult(parsed);
    res.status(200).json(result);
  } catch (err) {
    console.error('Analyze handler error:', err);
    res.status(500).json({ message: 'OpenRouter API error', error: String(err) });
  }
}
