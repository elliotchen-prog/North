import { describe, expect, it } from "vitest";
import {
  parseAnalysisTextToResult,
  parseMessageTextToResult,
  stripJsonCodeFences,
} from "./parse";

describe("llm parse helpers", () => {
  it("strips json code fences", () => {
    const input = "```json\n{\"a\":1}\n```";
    expect(stripJsonCodeFences(input).trim()).toBe("{\"a\":1}");
  });

  it("parses valid analysis JSON (with code fences)", () => {
    const input = `\`\`\`json
{
  "situation": "Work overload",
  "causes": ["Too many tasks", "Unclear priorities"],
  "plan": ["List top 3 priorities", "Talk to manager"],
  "message": "Hi, can we align on priorities?"
}
\`\`\``;

    const result = parseAnalysisTextToResult(input);
    expect(result.situation).toBe("Work overload");
    expect(result.causes).toEqual(["Too many tasks", "Unclear priorities"]);
    expect(result.plan).toEqual(["List top 3 priorities", "Talk to manager"]);
    expect(result.message).toBe("Hi, can we align on priorities?");
  });

  it("does not require message key for analysis JSON", () => {
    const input = `{"situation":"Work overload","causes":["Too many tasks","Unclear priorities"],"plan":["Talk to manager","Set boundaries"]}`;
    const result = parseAnalysisTextToResult(input);
    expect(result.situation).toBe("Work overload");
    expect(result.causes).toEqual(["Too many tasks", "Unclear priorities"]);
    expect(result.plan).toEqual(["Talk to manager", "Set boundaries"]);
    expect(result.message).toBeUndefined();
  });

  it("parses analysis JSON with leading/trailing text", () => {
    const input = `Sure — here you go!
{"situation":"Relationship conflict","causes":["Bad timing","Unclear expectations"],"plan":["Have a calm talk","Agree on boundaries"],"message":"Can we set a time?"}
Thanks!`;

    const result = parseAnalysisTextToResult(input);
    expect(result.situation).toBe("Relationship conflict");
    expect(result.causes.length).toBe(2);
    expect(result.plan.length).toBe(2);
    expect(result.message).toBe("Can we set a time?");
  });

  it("falls back when JSON is truncated but key/value pairs exist", () => {
    const input = `{
  "situation": "The user wants to deliver a presentation that impresses Greg",
  "causes": ["Nervousness", "Unclear messaging"],
  "plan": ["Outline 3 key points", "Practice opening line"],
  "message": "Hi Greg, can I share my presentation with you?"
  `;
    const result = parseAnalysisTextToResult(input);
    expect(result.situation).toContain("deliver a presentation");
    expect(result.causes).toEqual(["Nervousness", "Unclear messaging"]);
    expect(result.plan).toEqual(["Outline 3 key points", "Practice opening line"]);
    expect(result.message).toContain("share my presentation");
  });

  it("parses message JSON with extra text", () => {
    const input = `Here is your draft:
{"message":"Hi! I'd like to align on priorities."}
`;
    const result = parseMessageTextToResult(input);
    expect(result.message).toBe("Hi! I'd like to align on priorities.");
  });
});

