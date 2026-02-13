import Parser from "rss-parser";
import type { InsertNewsItem } from "@shared/schema";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "DailyAIArtist/1.0",
  },
});

const DEFAULT_RSS_SOURCES = [
  "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://www.theguardian.com/world/rss",
  "https://feeds.reuters.com/reuters/topNews",
];

export async function fetchNews(
  rssSources?: string[],
  pipelineRunId?: number
): Promise<InsertNewsItem[]> {
  const sources = rssSources && rssSources.length > 0 ? rssSources : DEFAULT_RSS_SOURCES;
  const allItems: InsertNewsItem[] = [];

  for (const url of sources) {
    try {
      const feed = await parser.parseURL(url);
      const sourceName = feed.title || new URL(url).hostname;

      for (const item of (feed.items || []).slice(0, 5)) {
        allItems.push({
          pipelineRunId: pipelineRunId || null,
          source: sourceName,
          title: item.title || "Untitled",
          snippet: item.contentSnippet || item.content || null,
          url: item.link || null,
          publishedAt: item.pubDate || null,
        });
      }
    } catch (err) {
      console.error(`Failed to fetch RSS feed ${url}:`, err);
    }
  }

  return allItems;
}
