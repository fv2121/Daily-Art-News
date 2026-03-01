import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, Rss, Palette, ShieldAlert, Loader2, Printer } from "lucide-react";
import { useState, useEffect } from "react";

interface StyleConfig {
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

export default function Settings() {
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery<StyleConfig>({
    queryKey: ["/api/settings"],
  });

  const [form, setForm] = useState<StyleConfig>({
    rssSources: [],
    artistName: "Daily AI Artist",
    negativePrompt: "",
    compositionMotifs: "",
    allowedColors: [],
    bannedColors: [],
    forbiddenContent: [],
    gelatoStoreId: "",
    gelatoTemplateId: "",
  });

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async (data: StyleConfig) => {
      const res = await apiRequest("PUT", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold" data-testid="text-settings-title">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure RSS sources, art style, and safety rules.
          </p>
        </div>
        <Button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          data-testid="button-save-settings"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          ) : (
            <Save className="w-4 h-4 mr-1.5" />
          )}
          Save Settings
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Rss className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">News Sources</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rss-sources">RSS Feed URLs (one per line)</Label>
          <Textarea
            id="rss-sources"
            value={form.rssSources.join("\n")}
            onChange={(e) => setForm({ ...form, rssSources: e.target.value.split("\n").filter(Boolean) })}
            className="text-sm min-h-[120px]"
            data-testid="input-rss-sources"
          />
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Art Style</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="artist-name">Artist Persona Name</Label>
            <Input
              id="artist-name"
              value={form.artistName}
              onChange={(e) => setForm({ ...form, artistName: e.target.value })}
              data-testid="input-artist-name"
            />
          </div>
          <div>
            <Label htmlFor="composition">Composition Motifs</Label>
            <Input
              id="composition"
              value={form.compositionMotifs}
              onChange={(e) => setForm({ ...form, compositionMotifs: e.target.value })}
              placeholder="e.g. lines + dots, asymmetry, high negative space"
              data-testid="input-composition"
            />
          </div>
          <div>
            <Label htmlFor="negative-prompt">Negative Prompt (things to avoid in generation)</Label>
            <Textarea
              id="negative-prompt"
              value={form.negativePrompt}
              onChange={(e) => setForm({ ...form, negativePrompt: e.target.value })}
              className="text-sm"
              data-testid="input-negative-prompt"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Safety & Content Rules</h3>
        </div>
        <div>
          <Label htmlFor="forbidden">Forbidden Content (comma-separated)</Label>
          <Input
            id="forbidden"
            value={form.forbiddenContent.join(", ")}
            onChange={(e) => setForm({ ...form, forbiddenContent: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            placeholder="text, faces, flags, weapons, maps"
            data-testid="input-forbidden-content"
          />
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Printer className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Gelato Integration</h3>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Connect your Gelato store to create on-demand T-shirt products from artworks. Find your Store ID and Template ID in your{" "}
          <a href="https://dashboard.gelato.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            Gelato dashboard
          </a>
          . The <code className="text-xs bg-muted px-1 rounded">GELATO_API_KEY</code> secret must also be set.
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="gelato-store-id">Store ID</Label>
            <Input
              id="gelato-store-id"
              value={form.gelatoStoreId}
              onChange={(e) => setForm({ ...form, gelatoStoreId: e.target.value })}
              placeholder="e.g. abc123-store-id"
              data-testid="input-gelato-store-id"
            />
          </div>
          <div>
            <Label htmlFor="gelato-template-id">T-shirt Template ID</Label>
            <Input
              id="gelato-template-id"
              value={form.gelatoTemplateId}
              onChange={(e) => setForm({ ...form, gelatoTemplateId: e.target.value })}
              placeholder="e.g. tpl_xyz789"
              data-testid="input-gelato-template-id"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
