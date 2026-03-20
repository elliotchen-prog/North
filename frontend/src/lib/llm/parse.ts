import type { AnalysisResult } from "../../types";

function ensureString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return String(value);
}

function ensureStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((v) => (v != null ? String(v) : "")).filter(Boolean);
  }
  if (typeof value === "string") return value ? [value] : [];
  return [];
}

export function stripJsonCodeFences(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```?\s*$/i, "");
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
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

function extractJsonStringField(raw: string, key: string): string {
  // Captures JSON string contents, including escaped chars.
  const re = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "i");
  const match = raw.match(re);
  if (!match) return "";
  return match[1].replace(/\\./g, (m) => m).trim();
}

function extractJsonStringArray(raw: string, key: string): string[] {
  const keyRe = new RegExp(`"${key}"\\s*:\\s*\\[`, "i");
  const startMatch = raw.match(keyRe);
  if (!startMatch || startMatch.index === undefined) return [];

  const start = startMatch.index + startMatch[0].length;
  let rest = raw.slice(start);

  // If the response is not truncated, cut at the next key so we don't pull unrelated quotes.
  const nextKey = rest.match(/\n\s*"(?:situation|causes|plan|message)"\s*:/i);
  if (nextKey && nextKey.index !== undefined) rest = rest.slice(0, nextKey.index);

  const quoted = rest.match(/"((?:[^"\\]|\\.)*)"/g);
  if (!quoted) return [];

  const out: string[] = [];
  for (const q of quoted) {
    const inner = q.slice(1, -1);
    const cleaned = inner.replace(/\\./g, (m) => m).trim();
    if (cleaned) out.push(cleaned.slice(0, 200));
  }
  // Keep up to N items when the model returns a longer JSON array than we can safely extract.
  return out.slice(0, 12);
}

export function parseAnalysisTextToResult(text: string): AnalysisResult {
  const stripped = stripJsonCodeFences(String(text)).trim();

  const parsed = tryParseJsonObject(stripped);
  if (parsed) {
    return {
      situation: ensureString(parsed.situation).trim() || "Your situation",
      causes: ensureStringArray(parsed.causes),
      plan: ensureStringArray(parsed.plan),
      message:
        parsed.message != null ? ensureString(parsed.message).trim() || undefined : undefined,
    };
  }

  // Truncated / malformed JSON fallback. Extract what we can directly from the raw text.
  const raw = stripped;
  const situationSnippet = extractJsonStringField(raw, "situation");
  const causes = extractJsonStringArray(raw, "causes");
  const plan = extractJsonStringArray(raw, "plan");
  const messageSnippet = extractJsonStringField(raw, "message");

  return {
    situation: situationSnippet || "Your situation",
    causes: causes.length
      ? causes
      : ["Reflecting on what’s going on", "Considering next steps"],
    plan: plan.length
      ? plan
      : [
          "Write down the main issue in one sentence",
          "Pick one small action you can take today",
          "Review tomorrow and adjust",
        ],
    message:
      messageSnippet ||
      "I've been reflecting on this and would like to talk it through. Can we find a time to connect?",
  };
}

export function parseMessageTextToResult(text: string): { message: string } {
  const stripped = stripJsonCodeFences(String(text)).trim();
  const parsed = tryParseJsonObject(stripped);
  if (parsed) {
    const msg = ensureString(parsed.message).trim();
    return {
      message:
        msg || "I'd like to talk this through when you have a moment.",
    };
  }

  const raw = stripped;
  const messageSnippet = extractJsonStringField(raw, "message");
  return {
    message:
      messageSnippet || "I'd like to talk this through when you have a moment.",
  };
}

