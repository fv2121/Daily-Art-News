import OpenAI from "openai";

/**
 * Shared OpenAI client that works in both Replit and local environments.
 *
 * - On Replit: uses AI_INTEGRATIONS_OPENAI_API_KEY + AI_INTEGRATIONS_OPENAI_BASE_URL
 *   (automatically injected by Replit's AI Integration proxy)
 * - Locally: uses OPENAI_API_KEY directly against OpenAI's standard API endpoint
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
