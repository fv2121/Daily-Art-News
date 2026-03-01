import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Printer, ExternalLink, AlertTriangle, Settings2 } from "lucide-react";
import { Link } from "wouter";
import type { Artwork } from "@shared/schema";

interface GelatoModalProps {
  artwork: Artwork | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StyleConfig {
  gelatoStoreId: string;
  gelatoTemplateId: string;
}

interface GelatoResult {
  id: string;
  title: string;
  status: string;
  storeUrl?: string;
}

export function GelatoModal({ artwork, open, onOpenChange }: GelatoModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<GelatoResult | null>(null);

  const { data: settings } = useQuery<StyleConfig>({
    queryKey: ["/api/settings"],
    enabled: open,
  });

  const isConfigured = !!(settings?.gelatoStoreId && settings?.gelatoTemplateId);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/gelato/create-product", {
        artworkId: artwork!.id,
        title,
        description,
      });
      return res.json() as Promise<GelatoResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({ title: "Product created in Gelato!" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create product",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  function handleOpenChange(open: boolean) {
    if (!open) {
      setResult(null);
      setTitle("");
      setDescription("");
      mutation.reset();
    }
    onOpenChange(open);
  }

  function handleOpen() {
    if (artwork) {
      setTitle(artwork.caption || "");
      setDescription(artwork.rationale || "");
      setResult(null);
      mutation.reset();
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="max-w-md"
        onOpenAutoFocus={() => handleOpen()}
        data-testid="dialog-gelato"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Send to Gelato
          </DialogTitle>
          <DialogDescription>
            Create a T-shirt product listing in your Gelato store using this artwork.
          </DialogDescription>
        </DialogHeader>

        {!isConfigured ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" data-testid="alert-gelato-not-configured">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">Gelato not configured</p>
                <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                  Add your Gelato Store ID and Template ID in Settings to enable product creation.
                </p>
              </div>
            </div>
            <Button asChild className="w-full" variant="outline" data-testid="button-go-to-settings">
              <Link href="/settings">
                <Settings2 className="w-4 h-4 mr-2" />
                Open Settings
              </Link>
            </Button>
          </div>
        ) : result ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800" data-testid="alert-gelato-success">
              <div className="text-sm">
                <p className="font-medium text-green-800 dark:text-green-300">Product created!</p>
                <p className="text-green-700 dark:text-green-400 mt-0.5">
                  "{result.title}" has been added to your Gelato store.
                </p>
                {result.id && (
                  <p className="text-green-600 dark:text-green-500 text-xs mt-1">
                    Product ID: {result.id}
                  </p>
                )}
              </div>
            </div>
            {result.storeUrl && (
              <Button asChild className="w-full" data-testid="button-view-in-gelato">
                <a href={result.storeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in Gelato
                </a>
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => handleOpenChange(false)} data-testid="button-close-gelato">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {artwork && (
              <div className="flex gap-3 items-start">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.caption || "Artwork"}
                  className="w-16 h-16 object-cover rounded-md shrink-0"
                  data-testid="img-gelato-preview"
                />
                <div className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                  {artwork.rationale || artwork.caption}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="gelato-title">Product Title</Label>
              <Input
                id="gelato-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this product"
                data-testid="input-gelato-title"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gelato-description">Description</Label>
              <Textarea
                id="gelato-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description shown in your store"
                className="text-sm min-h-[80px]"
                data-testid="input-gelato-description"
              />
            </div>

            <Button
              className="w-full"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !title.trim()}
              data-testid="button-create-gelato-product"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Printer className="w-4 h-4 mr-2" />
              )}
              {mutation.isPending ? "Creating product..." : "Create Product"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
