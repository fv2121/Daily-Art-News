import OpenAI from "openai";
import type { InsertNewsItem } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface ExtractedTheme {
  rank: number;
  title: string;
  description: string;
  mood: string;
  visualTokens: string[];
  score: number;
  safetyFlag: boolean;
}

async function callOpenAIForThemes(headlines: string): Promise<ExtractedTheme[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `You are a creative director for an abstract art project. Given today's news headlines, extract 5 abstract creative themes that could inspire non-representational artwork.

For each theme:
- Abstract the core emotional/conceptual essence (DO NOT reference specific people, events, or politics directly)
- Suggest visual tokens: shapes, textures, composition elements, mood, color feelings
- Score from 1-10 based on visual potential and abstractness
- Flag if the theme might involve hate, violence glorification, personal data, or political persuasion

IMPORTANT: Themes must be ABSTRACT. No text, no faces, no flags, no weapons, no identifiable symbols.

Return JSON array of exactly 5 themes.`,
      },
      {
        role: "user",
        content: `Today's headlines:\n${headlines}\n\nReturn a JSON object with a "themes" key containing an array:
{
  "themes": [
    {
      "rank": 1,
      "title": "Short abstract title",
      "description": "Brief description of the abstract concept",
      "mood": "One-word mood",
      "visualTokens": ["shape/texture tokens"],
      "score": 8,
      "safetyFlag": false
    }
  ]
}`,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content || "{}";
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch (parseErr: any) {
    console.error("[Analysis] Failed to parse OpenAI response:", content.slice(0, 500));
    throw new Error(`JSON parse error: ${parseErr.message}. Response preview: ${content.slice(0, 200)}`);
  }

  const arr = Array.isArray(parsed) ? parsed : (parsed.themes || parsed.data || []);
  if (!Array.isArray(arr) || arr.length === 0) {
    console.warn("[Analysis] OpenAI returned empty or invalid themes structure:", content.slice(0, 500));
    throw new Error(`OpenAI returned no themes. Response preview: ${content.slice(0, 200)}`);
  }

  return arr.map((t: any, i: number) => ({
    rank: t.rank || i + 1,
    title: t.title || "Untitled Theme",
    description: t.description || "",
    mood: t.mood || "neutral",
    visualTokens: Array.isArray(t.visualTokens) ? t.visualTokens : [],
    score: typeof t.score === "number" ? t.score : 5,
    safetyFlag: !!t.safetyFlag,
  }));
}

export async function extractThemes(
  newsItems: InsertNewsItem[]
): Promise<ExtractedTheme[]> {
  const headlines = newsItems
    .map((item, i) => `${i + 1}. [${item.source}] ${item.title}${item.snippet ? ": " + item.snippet.slice(0, 120) : ""}`)
    .join("\n");

  const maxAttempts = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await callOpenAIForThemes(headlines);
    } catch (err: any) {
      lastError = err;
      console.error(`[Analysis] Attempt ${attempt}/${maxAttempts} failed:`, err.message);
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  throw new Error(
    `Theme extraction failed after ${maxAttempts} attempts: ${lastError?.message || "Unknown error"}`
  );
}
