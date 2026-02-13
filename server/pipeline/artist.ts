import { generateImageBuffer } from "../replit_integrations/image/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { Theme } from "@shared/schema";

export interface GeneratedArt {
  imageUrl: string;
  prompt: string;
  negativePrompt: string;
}

function buildPrompt(theme: Theme, compositionMotifs?: string): string {
  const tokens = theme.visualTokens?.join(", ") || "geometric shapes, flowing lines";
  const mood = theme.mood || "contemplative";
  const motifs = compositionMotifs || "asymmetric composition, high negative space, geometric precision";

  return `Abstract contemporary art piece inspired by the mood "${mood}". ${theme.description || theme.title}. Visual elements: ${tokens}. Style: ${motifs}. Non-representational, no text, no faces, no logos, no recognizable symbols. Museum-quality abstract expressionism with bold but harmonious colors. Clean high-resolution digital painting.`;
}

const NEGATIVE_PROMPT = "text, words, letters, numbers, logos, faces, people, hands, fingers, weapons, flags, maps, identifiable symbols, photorealistic, blurry, low quality, watermark, signature";

export async function generateArtwork(
  theme: Theme,
  compositionMotifs?: string,
  customNegativePrompt?: string
): Promise<GeneratedArt> {
  const prompt = buildPrompt(theme, compositionMotifs);
  const negativePrompt = customNegativePrompt || NEGATIVE_PROMPT;

  const fullPrompt = `${prompt} Avoid: ${negativePrompt}`;

  const imageBuffer = await generateImageBuffer(fullPrompt, "1024x1024");

  const date = new Date().toISOString().split("T")[0];
  const outputDir = join(process.cwd(), "client", "public", "artworks", date);
  await mkdir(outputDir, { recursive: true });

  const filename = `artwork-${theme.id}-${Date.now()}.png`;
  const filePath = join(outputDir, filename);
  await writeFile(filePath, imageBuffer);

  return {
    imageUrl: `/artworks/${date}/${filename}`,
    prompt,
    negativePrompt,
  };
}
