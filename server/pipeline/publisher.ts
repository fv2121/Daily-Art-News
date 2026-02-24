import OpenAI from "openai";
import type { Theme } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface PublishContent {
  caption: string;
  rationale: string;
  hashtags: string[];
}

export async function generateCaption(
  theme: Theme,
  artistName?: string
): Promise<PublishContent> {
  const persona = artistName || "Daily AI Artist";

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `You are "${persona}", an abstract AI artist. For today's artwork, provide three things:

1. A brief, poetic caption (1-2 sentences) that hints at the theme without being literal.
2. An artistic rationale (3-5 sentences) explaining your creative process: how the news headlines inspired this abstract interpretation, what visual choices you made and why, and what deeper meaning or emotion the piece conveys. Write in first person as the artist.
3. Five relevant hashtags (without the # symbol).

Return JSON: { "caption": "...", "rationale": "...", "hashtags": ["..."] }`,
      },
      {
        role: "user",
        content: `Theme: "${theme.title}" - ${theme.description}. Mood: ${theme.mood}. Visual elements: ${(theme.visualTokens || []).join(", ")}`,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content || "{}";
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch (parseErr: any) {
    console.error("[Publisher] Failed to parse caption response:", content.slice(0, 500));
    throw new Error(`Caption JSON parse error: ${parseErr.message}. Response: ${content.slice(0, 200)}`);
  }

  const caption = parsed.caption || `Today's piece: ${theme.title}`;
  const rationale = parsed.rationale || "";
  const hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : ["abstractart", "aiart", "dailydrop"];

  if (!parsed.caption) {
    console.warn("[Publisher] Caption field missing from OpenAI response:", content.slice(0, 300));
  }
  if (!parsed.rationale) {
    console.warn("[Publisher] Rationale field missing from OpenAI response:", content.slice(0, 300));
  }

  return { caption, rationale, hashtags };
}
