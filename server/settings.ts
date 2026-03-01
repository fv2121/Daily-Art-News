import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

export interface StyleConfig {
  rssSources: string[];
  artistName: string;
  negativePrompt: string;
  compositionMotifs: string;
  allowedColors: string[];
  bannedColors: string[];
  forbiddenContent: string[];
  gelatoStoreId: string;
  gelatoTemplateId: string;
}

const CONFIG_PATH = join(process.cwd(), "data", "style_config.json");

const DEFAULT_CONFIG: StyleConfig = {
  rssSources: [
    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    "https://feeds.bbci.co.uk/news/world/rss.xml",
  ],
  artistName: "Daily AI Artist",
  negativePrompt: "text, words, letters, logos, faces, people, weapons, flags, maps, identifiable symbols, blurry, low quality, watermark",
  compositionMotifs: "asymmetric composition, high negative space, geometric precision, flowing lines, bold color blocks",
  allowedColors: [],
  bannedColors: [],
  forbiddenContent: ["text", "faces", "flags", "weapons", "maps", "identifiable symbols"],
  gelatoStoreId: "",
  gelatoTemplateId: "",
};

export async function getSettings(): Promise<StyleConfig> {
  try {
    const data = await readFile(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveSettings(config: StyleConfig): Promise<StyleConfig> {
  const dir = join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  const merged = { ...DEFAULT_CONFIG, ...config };
  await writeFile(CONFIG_PATH, JSON.stringify(merged, null, 2));
  return merged;
}
