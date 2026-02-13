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
      rationale: "Today's headlines spoke of a climate summit where world leaders found rare common ground. I was drawn to the tension between opposing forces finding equilibrium\u2014the rigid geometry of political structures meeting the organic flow of nature. The deep indigo represents the gravity of the moment, while coral accents pulse with the warmth of collective hope. The shapes converge at the center, neither side dominating, capturing that fragile balance between human ambition and natural forces.",
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
      rationale: "An architecture exhibition challenging how we see urban spaces sparked this piece. I chose layered, translucent rectangles to evoke blueprints and building facades, then shattered them with sharp diagonals\u2014the way new ideas fracture old assumptions. Earth tones ground the composition in the physical world, while unexpected magenta bursts represent the creative vision that dares to reimagine what a city could become.",
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
      rationale: "A breakthrough in renewable energy storage drew my attention to the hidden forces that power our world. I translated this into organic, flowing forms that suggest ocean currents\u2014energy moving beneath the surface, unseen but powerful. The navy blue speaks to the depth and mystery of scientific discovery, while emerald green hints at the promise of sustainability. White highlights emerge like breakthroughs piercing through the unknown.",
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
      rationale: "Global markets reacting in unison to policy shifts reminded me of invisible networks\u2014how distant events ripple through interconnected systems. I painted circles as nodes of influence, connected by thin, purposeful lines that carry information and consequence. Teal conveys the cool logic of systems thinking, while amber gradients pulse with the warmth of human decision-making. The composition is deliberately balanced yet dynamic, mirroring the tension between stability and change.",
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
