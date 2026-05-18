/**
 * OpenRouter often returns { error: { message: "User not found." } } for invalid or
 * expired API keys — not a missing North app user. Map that to actionable copy for the UI.
 */
export function clientMessageForOpenRouterError(
  raw: string | undefined,
  status: number
): string {
  const s = (raw ?? "").trim();
  const lower = s.toLowerCase();
  if (
    lower === "user not found." ||
    lower === "user not found" ||
    (status === 401 && lower.includes("not found"))
  ) {
    return "OpenRouter rejected this request—usually an invalid or expired OPENROUTER_API_KEY. Fix the key in .env.local, or set NEXT_PUBLIC_USE_MOCK_API=true for demo responses without calling OpenRouter.";
  }
  return s || "OpenRouter API request failed";
}
