import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { runPipeline } from "./pipeline/orchestrator";
import { getSettings, saveSettings, type StyleConfig } from "./settings";
import { createGelatoProduct } from "./gelato";
import { z } from "zod";

const settingsSchema = z.object({
  rssSources: z.array(z.string()).default([]),
  artistName: z.string().min(1).default("Daily AI Artist"),
  negativePrompt: z.string().default(""),
  compositionMotifs: z.string().default(""),
  allowedColors: z.array(z.string()).default([]),
  bannedColors: z.array(z.string()).default([]),
  forbiddenContent: z.array(z.string()).default([]),
  gelatoStoreId: z.string().default(""),
  gelatoTemplateId: z.string().default(""),
});

const gelatoProductSchema = z.object({
  artworkId: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/artwork-image/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtworkById(id);
      if (!artwork || !artwork.imageData) {
        return res.status(404).json({ message: "Image not found" });
      }
      const buffer = Buffer.from(artwork.imageData, "base64");
      res.set("Content-Type", "image/png");
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.send(buffer);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/artworks", async (_req, res) => {
    try {
      const artworks = await storage.getAllPublishedArtworks();
      const sanitized = artworks.map(({ imageData, ...rest }) => rest);
      res.json(sanitized);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/artworks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtworkById(id);
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }
      const theme = artwork.themeId ? (await storage.getThemesByRun(artwork.pipelineRunId!))
        .find(t => t.id === artwork.themeId) : null;
      const news = artwork.pipelineRunId ? await storage.getNewsItemsByRun(artwork.pipelineRunId) : [];
      const { imageData, ...artworkData } = artwork;
      res.json({ artwork: artworkData, theme, news });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/pipeline-runs", async (_req, res) => {
    try {
      const runs = await storage.getAllPipelineRuns();
      res.json(runs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/pipeline-runs/:id/themes", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const themesList = await storage.getThemesByRun(id);
      res.json(themesList);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/pipeline-runs/:id/artworks", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artworksList = await storage.getArtworksByRun(id);
      const sanitized = artworksList.map(({ imageData, ...rest }) => rest);
      res.json(sanitized);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/pipeline-runs/:id/news", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const news = await storage.getNewsItemsByRun(id);
      res.json(news);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/pipeline/run", async (_req, res) => {
    try {
      const config = await getSettings();
      const runId = await runPipeline(config);
      res.json({ runId, status: "started" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/settings", async (_req, res) => {
    try {
      const config = await getSettings();
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const parsed = settingsSchema.parse(req.body);
      const config = await saveSettings(parsed as StyleConfig);
      res.json(config);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return res.status(400).json({ message: "Invalid settings", errors: err.errors });
      }
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/pipeline-runs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const run = await storage.getPipelineRun(id);
      if (!run) {
        return res.status(404).json({ message: "Pipeline run not found" });
      }
      const isActive = ["pending", "ingesting", "analyzing", "generating", "publishing"].includes(run.status);
      if (isActive) {
        return res.status(400).json({ message: "Cannot delete a running pipeline" });
      }
      await storage.deletePipelineRun(id);
      res.json({ message: "Deleted" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/themes/:id/select", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const theme = await storage.updateTheme(id, { selected: true });
      if (!theme) return res.status(404).json({ message: "Theme not found" });
      res.json(theme);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/gelato/create-product", async (req, res) => {
    try {
      const parsed = gelatoProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.errors });
      }
      const { artworkId, title, description } = parsed.data;

      const settings = await getSettings();
      if (!settings.gelatoStoreId || !settings.gelatoTemplateId) {
        return res.status(400).json({
          message: "Gelato store ID and template ID must be configured in Settings before creating products.",
          configError: true,
        });
      }

      if (!process.env.GELATO_API_KEY) {
        return res.status(400).json({
          message: "Gelato API key is not configured. Please add it as a secret (GELATO_API_KEY).",
          configError: true,
        });
      }

      const artwork = await storage.getArtwork(artworkId);
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }

      const host = req.get("host") || "";
      const protocol = req.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      const imageUrl = `${protocol}://${host}/api/artwork-image/${artworkId}`;

      const result = await createGelatoProduct({
        storeId: settings.gelatoStoreId,
        templateId: settings.gelatoTemplateId,
        title,
        description,
        imageUrl,
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  return httpServer;
}
