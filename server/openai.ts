import OpenAI from "openai";

/**
 * Shared OpenAI client that works in both Replit and local environments.
 *
 * Priority order:
 * 1. OPENAI_API_KEY — standard key, works in all environments (preferred)
 * 2. AI_INTEGRATIONS_OPENAI_API_KEY + AI_INTEGRATIONS_OPENAI_BASE_URL — Replit's
 *    managed proxy, used as a fallback if OPENAI_API_KEY is not set
 */
function createOpenAIClient(): OpenAI {
  const standardKey = process.env.OPENAI_API_KEY;
  const replitKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const replitBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

  if (standardKey) {
    return new OpenAI({ apiKey: standardKey });
  }

  if (replitKey && replitBase) {
    return new OpenAI({ apiKey: replitKey, baseURL: replitBase });
  }

  throw new Error(
    "No OpenAI API key found. Set OPENAI_API_KEY in your .env file (local) " +
    "or as a secret in Replit."
  );
}

export const openai = createOpenAIClient();
