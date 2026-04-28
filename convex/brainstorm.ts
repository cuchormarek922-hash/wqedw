import { v } from "convex/values";
import { action } from "./_generated/server";

export const callAI = action({
  args: {
    persona: v.string(),
    topic: v.string(),
    messages: v.array(v.object({ aiName: v.string(), content: v.string() })),
  },
  handler: async (_ctx, { persona, topic, messages }) => {
    const userContent =
      `BRAINSTORM TOPIC: "${topic}"\n\nHere is the full conversation so far:\n\n` +
      (messages.length === 0
        ? "(You are the first to speak. Kick off the brainstorm.)"
        : messages.map((m) => `[${m.aiName}]: ${m.content}`).join("\n\n")) +
      "\n\nNow it's your turn. Contribute your unique perspective following all rules in your instructions.";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: persona,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    const data = (await response.json()) as {
      content?: Array<{ text?: string }>;
      error?: { message?: string };
    };
    if (!response.ok) throw new Error(data.error?.message ?? "API error");
    return (data.content ?? []).map((b) => b.text ?? "").join("");
  },
});
