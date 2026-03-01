const GELATO_API_BASE = "https://ecommerce.gelatoapis.com";

function getApiKey(): string {
  const key = process.env.GELATO_API_KEY;
  if (!key) throw new Error("GELATO_API_KEY is not configured. Please add it in Settings.");
  return key;
}

export interface CreateGelatoProductParams {
  storeId: string;
  templateId: string;
  title: string;
  description?: string;
  imageUrl: string;
}

export interface GelatoProductResult {
  id: string;
  storeUrl?: string;
  title: string;
  status: string;
}

export async function createGelatoProduct(
  params: CreateGelatoProductParams
): Promise<GelatoProductResult> {
  const { storeId, templateId, title, description, imageUrl } = params;

  const apiKey = getApiKey();

  const body: Record<string, any> = {
    templateId,
    title,
    description: description || title,
    variants: [
      {
        imagePlaceholders: [
          {
            name: "front",
            fileUrl: imageUrl,
            fitType: "fit",
          },
        ],
      },
    ],
  };

  const response = await fetch(
    `${GELATO_API_BASE}/v1/stores/${storeId}/products:create-from-template`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json() as any;

  if (!response.ok) {
    const message = data?.message || data?.error || `Gelato API error ${response.status}`;
    throw new Error(message);
  }

  return {
    id: data.id || data.productId || "",
    title: data.title || title,
    status: data.status || "created",
    storeUrl: data.storeUrl || data.previewUrl || undefined,
  };
}
