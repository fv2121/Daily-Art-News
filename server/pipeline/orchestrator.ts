import { storage } from "../storage";
import { fetchNews } from "./ingestion";
import { extractThemes } from "./analysis";
import { generateArtwork } from "./artist";
import { generateCaption } from "./publisher";

interface StyleConfig {
  rssSources: string[];
  artistName: string;
  negativePrompt: string;
  compositionMotifs: string;
}

export async function runPipeline(config: StyleConfig): Promise<number> {
  const run = await storage.createPipelineRun({ status: "pending" });
  const runId = run.id;

  (async () => {
    try {
      await storage.updatePipelineRun(runId, { status: "ingesting" });
      const newsData = await fetchNews(config.rssSources, runId);

      if (newsData.length === 0) {
        await storage.updatePipelineRun(runId, {
          status: "failed",
          error: "No news articles found. Check your RSS sources.",
          completedAt: new Date(),
        });
        return;
      }

      for (const item of newsData) {
        await storage.createNewsItem(item);
      }
      await storage.updatePipelineRun(runId, { newsCount: newsData.length });

      await storage.updatePipelineRun(runId, { status: "analyzing" });
      const extractedThemes = await extractThemes(newsData);

      if (extractedThemes.length === 0) {
        await storage.updatePipelineRun(runId, {
          status: "failed",
          error: "Failed to extract themes from news.",
          completedAt: new Date(),
        });
        return;
      }

      for (const t of extractedThemes) {
        await storage.createTheme({
          pipelineRunId: runId,
          rank: t.rank,
          title: t.title,
          description: t.description,
          mood: t.mood,
          visualTokens: t.visualTokens,
          score: t.score,
          selected: false,
          safetyFlag: t.safetyFlag,
        });
      }

      const safeThemes = extractedThemes.filter((t) => !t.safetyFlag);
      const selectedTheme = safeThemes.length > 0
        ? safeThemes.sort((a, b) => b.score - a.score)[0]
        : extractedThemes.sort((a, b) => b.score - a.score)[0];

      const savedThemes = await storage.getThemesByRun(runId);
      const matchedTheme = savedThemes.find((t) => t.title === selectedTheme.title);
      if (matchedTheme) {
        await storage.updateTheme(matchedTheme.id, { selected: true });
      }

      const themeForArt = matchedTheme || savedThemes[0];

      await storage.updatePipelineRun(runId, { status: "generating" });
      const art = await generateArtwork(
        themeForArt,
        config.compositionMotifs,
        config.negativePrompt || undefined
      );

      await storage.updatePipelineRun(runId, { status: "publishing" });
      const publishContent = await generateCaption(themeForArt, config.artistName);

      const artwork = await storage.createArtwork({
        pipelineRunId: runId,
        themeId: themeForArt.id,
        imageUrl: art.imageUrl,
        prompt: art.prompt,
        negativePrompt: art.negativePrompt,
        caption: publishContent.caption,
        rationale: publishContent.rationale,
        hashtags: publishContent.hashtags,
        published: true,
        publishedAt: new Date(),
      });

      await storage.updatePipelineRun(runId, {
        status: "completed",
        completedAt: new Date(),
      });
    } catch (err: any) {
      console.error("Pipeline failed:", err);
      await storage.updatePipelineRun(runId, {
        status: "failed",
        error: err.message || "Unknown error",
        completedAt: new Date(),
      });
    }
  })();

  return runId;
}
