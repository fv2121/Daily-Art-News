import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const pipelineRuns = pgTable("pipeline_runs", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("pending"),
  startedAt: timestamp("started_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  completedAt: timestamp("completed_at"),
  newsCount: integer("news_count").default(0),
  error: text("error"),
});

export const newsItems = pgTable("news_items", {
  id: serial("id").primaryKey(),
  pipelineRunId: integer("pipeline_run_id").references(() => pipelineRuns.id),
  source: text("source").notNull(),
  title: text("title").notNull(),
  snippet: text("snippet"),
  url: text("url"),
  publishedAt: text("published_at"),
  fetchedAt: timestamp("fetched_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  pipelineRunId: integer("pipeline_run_id").references(() => pipelineRuns.id),
  rank: integer("rank").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  mood: text("mood"),
  visualTokens: text("visual_tokens").array(),
  score: integer("score").default(0),
  selected: boolean("selected").default(false),
  safetyFlag: boolean("safety_flag").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  pipelineRunId: integer("pipeline_run_id").references(() => pipelineRuns.id),
  themeId: integer("theme_id").references(() => themes.id),
  imageUrl: text("image_url").notNull(),
  imageData: text("image_data"),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt"),
  caption: text("caption"),
  rationale: text("rationale"),
  hashtags: text("hashtags").array(),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPipelineRunSchema = createInsertSchema(pipelineRuns).omit({ id: true, startedAt: true });
export const insertNewsItemSchema = createInsertSchema(newsItems).omit({ id: true, fetchedAt: true });
export const insertThemeSchema = createInsertSchema(themes).omit({ id: true, createdAt: true });
export const insertArtworkSchema = createInsertSchema(artworks).omit({ id: true, createdAt: true });

export type PipelineRun = typeof pipelineRuns.$inferSelect;
export type InsertPipelineRun = z.infer<typeof insertPipelineRunSchema>;
export type NewsItem = typeof newsItems.$inferSelect;
export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;
export type Theme = typeof themes.$inferSelect;
export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Artwork = typeof artworks.$inferSelect;
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
