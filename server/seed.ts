import { storage } from "./storage";
import { db } from "./db";
import { artworks, pipelineRuns, themes, newsItems } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  const existingArtworks = await storage.getAllPublishedArtworks();
  if (existingArtworks.length > 0) return;

  const seedRuns = [
    { status: "completed", newsCount: 12, completedAt: new Date(Date.now() - 3 * 86400000) },
    { status: "completed", newsCount: 15, completedAt: new Date(Date.now() - 2 * 86400000) },
    { status: "completed", newsCount: 10, completedAt: new Date(Date.now() - 86400000) },
    { status: "completed", newsCount: 18, completedAt: new Date() },
  ];

  const runIds: number[] = [];
  for (const runData of seedRuns) {
    const run = await storage.createPipelineRun({ status: runData.status });
    await storage.updatePipelineRun(run.id, {
      newsCount: runData.newsCount,
      completedAt: runData.completedAt,
    });
    runIds.push(run.id);
  }

  const seedThemes = [
    {
      pipelineRunId: runIds[3],
      rank: 1,
      title: "Tidal Convergence",
      description: "Opposing forces meeting at a point of equilibrium, where chaos and order coexist",
      mood: "Tension",
      visualTokens: ["bold geometric shapes", "flowing curves", "deep indigo", "coral accents"],
      score: 9,
      selected: true,
      safetyFlag: false,
    },
    {
      pipelineRunId: runIds[3],
      rank: 2,
      title: "Silent Networks",
      description: "Invisible connections that bind distant entities, pulsing with quiet energy",
      mood: "Contemplative",
      visualTokens: ["interconnected circles", "thin lines", "teal tones", "amber gradients"],
      score: 8,
      selected: false,
      safetyFlag: false,
    },
    {
      pipelineRunId: runIds[2],
      rank: 1,
      title: "Fragmented Horizons",
      description: "Perspectives shattered and reassembled, revealing new ways of seeing the familiar",
      mood: "Introspective",
      visualTokens: ["layered rectangles", "diagonal lines", "earth tones", "magenta accents"],
      score: 9,
      selected: true,
      safetyFlag: false,
    },
    {
      pipelineRunId: runIds[1],
      rank: 1,
      title: "Undercurrents",
      description: "Hidden forces shaping surfaces, the tension between depth and appearance",
      mood: "Mysterious",
      visualTokens: ["organic flowing shapes", "navy blue", "emerald green", "white highlights"],
      score: 8,
      selected: true,
      safetyFlag: false,
    },
  ];

  const themeIds: number[] = [];
  for (const t of seedThemes) {
    const theme = await storage.createTheme(t);
    themeIds.push(theme.id);
  }

  const seedNews = [
    { pipelineRunId: runIds[3], source: "BBC News", title: "Climate Summit Reaches Historic Agreement on Emissions", snippet: "World leaders have agreed to unprecedented emission reduction targets...", url: null, publishedAt: null },
    { pipelineRunId: runIds[3], source: "Reuters", title: "Global Markets React to Policy Shifts", snippet: "Financial markets showed mixed responses to recent policy announcements...", url: null, publishedAt: null },
    { pipelineRunId: runIds[3], source: "The Guardian", title: "New Discovery Challenges Understanding of Deep Ocean Ecosystems", snippet: "Marine biologists have found previously unknown species...", url: null, publishedAt: null },
    { pipelineRunId: runIds[2], source: "NY Times", title: "Architecture Exhibition Explores Future of Urban Living", snippet: "A groundbreaking exhibition reimagines how cities might evolve...", url: null, publishedAt: null },
    { pipelineRunId: runIds[1], source: "BBC News", title: "Breakthrough in Renewable Energy Storage Technology", snippet: "Scientists announce a major advancement in battery technology...", url: null, publishedAt: null },
  ];

  for (const n of seedNews) {
    await storage.createNewsItem(n);
  }

  const seedArtworks = [
    {
      pipelineRunId: runIds[3],
      themeId: themeIds[0],
      imageUrl: "/artworks/seed/seed-artwork-1.png",
      prompt: "Abstract contemporary art piece, bold geometric shapes with flowing organic curves, deep indigo and coral color palette",
      negativePrompt: "text, faces, logos",
      caption: "Where opposing tides meet, a momentary equilibrium emerges\u2014bold geometry yielding to the organic pull of unseen currents.",
      hashtags: ["abstractart", "aiart", "dailydrop", "contemporaryart", "digitalpainting"],
      published: true,
      publishedAt: new Date(),
    },
    {
      pipelineRunId: runIds[2],
      themeId: themeIds[2],
      imageUrl: "/artworks/seed/seed-artwork-3.png",
      prompt: "Abstract art with layered translucent rectangles and sharp diagonal lines, earth tones with magenta accents",
      negativePrompt: "text, faces, logos",
      caption: "Familiar horizons, dismantled and reassembled\u2014each fragment a lens onto what we thought we knew.",
      hashtags: ["abstractart", "deconstructivism", "aiart", "galleryart", "dailydrop"],
      published: true,
      publishedAt: new Date(Date.now() - 86400000),
    },
    {
      pipelineRunId: runIds[1],
      themeId: themeIds[3],
      imageUrl: "/artworks/seed/seed-artwork-4.png",
      prompt: "Abstract artwork with organic flowing shapes suggesting ocean currents, navy blue and emerald green palette",
      negativePrompt: "text, faces, logos",
      caption: "Beneath the surface, invisible currents shape what we see\u2014the quiet architecture of depth.",
      hashtags: ["abstractart", "oceanic", "aiart", "contemporaryart", "dailydrop"],
      published: true,
      publishedAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      pipelineRunId: runIds[0],
      themeId: themeIds[1],
      imageUrl: "/artworks/seed/seed-artwork-2.png",
      prompt: "Abstract expressionist digital painting, interconnected circles and lines, teal and amber tones",
      negativePrompt: "text, faces, logos",
      caption: "Silent threads connect distant points of light\u2014a network pulsing with quiet, purposeful energy.",
      hashtags: ["abstractart", "networked", "aiart", "minimalart", "dailydrop"],
      published: true,
      publishedAt: new Date(Date.now() - 3 * 86400000),
    },
  ];

  for (const a of seedArtworks) {
    await storage.createArtwork(a);
  }

  console.log("Seed data inserted successfully");
}
