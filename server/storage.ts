import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  users, newsItems, themes, artworks, pipelineRuns,
  type User, type InsertUser,
  type NewsItem, type InsertNewsItem,
  type Theme, type InsertTheme,
  type Artwork, type InsertArtwork,
  type PipelineRun, type InsertPipelineRun,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createPipelineRun(data: InsertPipelineRun): Promise<PipelineRun>;
  getPipelineRun(id: number): Promise<PipelineRun | undefined>;
  updatePipelineRun(id: number, data: Partial<PipelineRun>): Promise<PipelineRun | undefined>;
  getAllPipelineRuns(): Promise<PipelineRun[]>;

  createNewsItem(data: InsertNewsItem): Promise<NewsItem>;
  getNewsItemsByRun(runId: number): Promise<NewsItem[]>;

  createTheme(data: InsertTheme): Promise<Theme>;
  getThemesByRun(runId: number): Promise<Theme[]>;
  updateTheme(id: number, data: Partial<Theme>): Promise<Theme | undefined>;

  createArtwork(data: InsertArtwork): Promise<Artwork>;
  getArtworkById(id: number): Promise<Artwork | undefined>;
  getArtworksByRun(runId: number): Promise<Artwork[]>;
  getAllPublishedArtworks(): Promise<Artwork[]>;
  updateArtwork(id: number, data: Partial<Artwork>): Promise<Artwork | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({ ...insertUser, id: randomUUID() }).returning();
    return user;
  }

  async createPipelineRun(data: InsertPipelineRun): Promise<PipelineRun> {
    const [run] = await db.insert(pipelineRuns).values(data).returning();
    return run;
  }

  async getPipelineRun(id: number): Promise<PipelineRun | undefined> {
    const [run] = await db.select().from(pipelineRuns).where(eq(pipelineRuns.id, id));
    return run;
  }

  async updatePipelineRun(id: number, data: Partial<PipelineRun>): Promise<PipelineRun | undefined> {
    const [run] = await db.update(pipelineRuns).set(data).where(eq(pipelineRuns.id, id)).returning();
    return run;
  }

  async getAllPipelineRuns(): Promise<PipelineRun[]> {
    return db.select().from(pipelineRuns).orderBy(desc(pipelineRuns.startedAt));
  }

  async createNewsItem(data: InsertNewsItem): Promise<NewsItem> {
    const [item] = await db.insert(newsItems).values(data).returning();
    return item;
  }

  async getNewsItemsByRun(runId: number): Promise<NewsItem[]> {
    return db.select().from(newsItems).where(eq(newsItems.pipelineRunId, runId));
  }

  async createTheme(data: InsertTheme): Promise<Theme> {
    const [theme] = await db.insert(themes).values(data).returning();
    return theme;
  }

  async getThemesByRun(runId: number): Promise<Theme[]> {
    return db.select().from(themes).where(eq(themes.pipelineRunId, runId));
  }

  async updateTheme(id: number, data: Partial<Theme>): Promise<Theme | undefined> {
    const [theme] = await db.update(themes).set(data).where(eq(themes.id, id)).returning();
    return theme;
  }

  async createArtwork(data: InsertArtwork): Promise<Artwork> {
    const [artwork] = await db.insert(artworks).values(data).returning();
    return artwork;
  }

  async getArtworkById(id: number): Promise<Artwork | undefined> {
    const [artwork] = await db.select().from(artworks).where(eq(artworks.id, id));
    return artwork;
  }

  async getArtworksByRun(runId: number): Promise<Artwork[]> {
    return db.select().from(artworks).where(eq(artworks.pipelineRunId, runId));
  }

  async getAllPublishedArtworks(): Promise<Artwork[]> {
    return db.select().from(artworks).where(eq(artworks.published, true)).orderBy(desc(artworks.publishedAt));
  }

  async updateArtwork(id: number, data: Partial<Artwork>): Promise<Artwork | undefined> {
    const [artwork] = await db.update(artworks).set(data).where(eq(artworks.id, id)).returning();
    return artwork;
  }
}

export const storage = new DatabaseStorage();
