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
    max_completion_tokens: 512,
  });

  const content = response.choices[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(content);
    return {
      caption: parsed.caption || `Today's piece: ${theme.title}`,
      rationale: parsed.rationale || "",
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ["abstractart", "aiart", "dailydrop"],
    };
  } catch {
    return {
      caption: `Today's piece: ${theme.title}`,
      rationale: "",
      hashtags: ["abstractart", "aiart", "dailydrop"],
    };
  }
}
