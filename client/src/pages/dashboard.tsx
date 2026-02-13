import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Newspaper,
  Palette,
  Sparkles,
  Eye,
  RotateCcw,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";
import type { PipelineRun, Theme, Artwork, NewsItem } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive"; icon: React.ReactNode }> = {
    pending: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
    ingesting: { variant: "default", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    analyzing: { variant: "default", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    generating: { variant: "default", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    publishing: { variant: "default", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    completed: { variant: "secondary", icon: <CheckCircle2 className="w-3 h-3" /> },
    failed: { variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
  };
  const c = config[status] || config.pending;
  return (
    <Badge variant={c.variant} data-testid={`badge-status-${status}`}>
      {c.icon}
      <span className="ml-1 capitalize">{status}</span>
    </Badge>
  );
}

function PipelineRunCard({ run, isLatest }: { run: PipelineRun; isLatest: boolean }) {
  const [expanded, setExpanded] = useState(isLatest);

  const { data: themes } = useQuery<Theme[]>({
    queryKey: ["/api/pipeline-runs", run.id, "themes"],
    enabled: expanded,
  });

  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: ["/api/pipeline-runs", run.id, "artworks"],
    enabled: expanded,
  });

  const { data: newsItems } = useQuery<NewsItem[]>({
    queryKey: ["/api/pipeline-runs", run.id, "news"],
    enabled: expanded,
  });

  const isActive = ["pending", "ingesting", "analyzing", "generating", "publishing"].includes(run.status);

  return (
    <Card className="overflow-visible" data-testid={`card-run-${run.id}`}>
      <div
        className="p-4 flex items-center justify-between gap-4 flex-wrap cursor-pointer hover-elevate rounded-md"
        onClick={() => setExpanded(!expanded)}
        data-testid={`button-expand-run-${run.id}`}
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={run.status} />
          <span className="text-sm font-medium" data-testid={`text-run-date-${run.id}`}>
            {format(new Date(run.startedAt), "MMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {run.newsCount !== null && run.newsCount > 0 && (
            <Badge variant="secondary">
              <Newspaper className="w-3 h-3 mr-1" />
              {run.newsCount} articles
            </Badge>
          )}
          <Eye className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t pt-4">
              {run.error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md text-sm" data-testid="text-run-error">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <span className="text-destructive">{run.error}</span>
                </div>
              )}

              {newsItems && newsItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5 text-muted-foreground" />
                    News Sources
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {newsItems.slice(0, 10).map((item) => (
                      <div key={item.id} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="shrink-0 text-foreground/60">{item.source}:</span>
                        <span className="line-clamp-1">{item.title}</span>
                      </div>
                    ))}
                    {newsItems.length > 10 && (
                      <span className="text-xs text-muted-foreground">+{newsItems.length - 10} more</span>
                    )}
                  </div>
                </div>
              )}

              {themes && themes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                    Extracted Themes
                  </h4>
                  <div className="grid gap-2">
                    {themes.map((theme) => (
                      <div
                        key={theme.id}
                        className={`p-3 rounded-md border text-sm ${
                          theme.selected
                            ? "border-primary/30 bg-primary/5"
                            : "border-border"
                        }`}
                        data-testid={`card-theme-${theme.id}`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <span className="font-medium">{theme.title}</span>
                          <div className="flex items-center gap-1.5">
                            {theme.selected && (
                              <Badge variant="default" className="text-[10px]">Selected</Badge>
                            )}
                            {theme.safetyFlag && (
                              <Badge variant="destructive" className="text-[10px]">
                                <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                                Flagged
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-[10px]">
                              #{theme.rank}
                            </Badge>
                          </div>
                        </div>
                        {theme.description && (
                          <p className="text-xs text-muted-foreground mb-1.5">{theme.description}</p>
                        )}
                        {theme.visualTokens && theme.visualTokens.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {theme.visualTokens.map((token, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">
                                {token}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {artworks && artworks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                    Generated Artwork
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {artworks.map((art) => (
                      <div key={art.id} className="space-y-2" data-testid={`card-generated-art-${art.id}`}>
                        <div className="aspect-square rounded-md overflow-hidden">
                          <img
                            src={art.imageUrl}
                            alt={art.caption || "Generated artwork"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {art.published ? (
                            <Badge variant="default" className="text-[10px]">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                          )}
                        </div>
                        {art.caption && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{art.caption}</p>
                        )}
                        {art.rationale && (
                          <div className="mt-1.5 pt-1.5 border-t">
                            <div className="flex items-center gap-1 mb-1">
                              <BookOpen className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-medium text-muted-foreground">Artist's Process</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed" data-testid={`text-dashboard-rationale-${art.id}`}>
                              {art.rationale}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isActive && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-md">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-primary">Pipeline is running...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-md" />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();

  const { data: runs, isLoading } = useQuery<PipelineRun[]>({
    queryKey: ["/api/pipeline-runs"],
    refetchInterval: 5000,
  });

  const runPipeline = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/pipeline/run");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline-runs"] });
      toast({ title: "Pipeline started", description: "Generating today's artwork from the latest news." });
    },
    onError: (error: Error) => {
      toast({ title: "Pipeline failed to start", description: error.message, variant: "destructive" });
    },
  });

  const isAnyRunning = runs?.some((r) =>
    ["pending", "ingesting", "analyzing", "generating", "publishing"].includes(r.status)
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold" data-testid="text-dashboard-title">Pipeline Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Run the daily pipeline to generate abstract art from today's news.
          </p>
        </div>
        <Button
          onClick={() => runPipeline.mutate()}
          disabled={runPipeline.isPending || !!isAnyRunning}
          data-testid="button-run-pipeline"
        >
          {runPipeline.isPending || isAnyRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1.5" />
              Run Pipeline
            </>
          )}
        </Button>
      </div>

      {(!runs || runs.length === 0) ? (
        <Card className="p-8 flex flex-col items-center text-center" data-testid="section-empty-runs">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <RotateCcw className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No pipeline runs yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Click "Run Pipeline" to fetch news, extract themes, and generate your first artwork.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run, i) => (
            <PipelineRunCard key={run.id} run={run} isLatest={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
