import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Hash,
  BookOpen,
  Palette,
  Newspaper,
  Sparkles,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import type { Artwork, Theme, NewsItem } from "@shared/schema";
import { motion } from "framer-motion";
import { GelatoModal } from "@/components/gelato-modal";

type ArtworkDetailResponse = {
  artwork: Artwork;
  theme: Theme | null;
  news: NewsItem[];
};

function DetailSkeleton() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="w-full aspect-[4/3] rounded-md" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function ArtworkDetail() {
  const [, params] = useRoute("/artwork/:id");
  const id = params?.id;
  const [gelatoOpen, setGelatoOpen] = useState(false);

  const { data, isLoading, error } = useQuery<ArtworkDetailResponse>({
    queryKey: ["/api/artworks", id],
    enabled: !!id,
  });

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back-gallery">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Gallery
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-semibold mb-2">Artwork not found</h2>
          <p className="text-muted-foreground">This artwork may have been removed or doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { artwork, theme, news } = data;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back-gallery">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Gallery
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGelatoOpen(true)}
          data-testid="button-send-to-gelato-detail"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Send to Gelato
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="rounded-md overflow-hidden border">
          <img
            src={artwork.imageUrl}
            alt={artwork.caption || "Artwork"}
            className="w-full h-auto"
            data-testid="img-artwork-detail"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {artwork.published && (
            <Badge variant="default" data-testid="badge-published">
              <Sparkles className="w-3 h-3 mr-1" />
              Published
            </Badge>
          )}
          {artwork.publishedAt && (
            <Badge variant="secondary" data-testid="badge-date">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(artwork.publishedAt), "MMMM d, yyyy")}
            </Badge>
          )}
        </div>

        {artwork.caption && (
          <p className="text-lg md:text-xl text-foreground leading-relaxed" data-testid="text-detail-caption">
            {artwork.caption}
          </p>
        )}

        {artwork.hashtags && artwork.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2" data-testid="section-hashtags">
            {artwork.hashtags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                <Hash className="w-3 h-3 mr-0.5" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {artwork.rationale && (
          <Card className="p-4 md:p-6 bg-primary/5 border-primary/15" data-testid="section-rationale">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-primary">Artist's Process</h3>
            </div>
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed" data-testid="text-detail-rationale">
              {artwork.rationale}
            </p>
          </Card>
        )}

        {theme && (
          <Card className="p-4 md:p-6" data-testid="section-theme">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-base font-semibold">Theme: {theme.title}</h3>
            </div>
            {theme.description && (
              <p className="text-sm text-muted-foreground mb-3">{theme.description}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              {theme.mood && (
                <Badge variant="secondary">Mood: {theme.mood}</Badge>
              )}
              {theme.visualTokens && theme.visualTokens.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {theme.visualTokens.map((token, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{token}</Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {news && news.length > 0 && (
          <Card className="p-4 md:p-6" data-testid="section-news-sources">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-base font-semibold">Inspiring Headlines</h3>
            </div>
            <div className="space-y-2">
              {news.map((item) => (
                <div key={item.id} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground shrink-0 font-medium">{item.source}:</span>
                  <span className="text-foreground/80">{item.title}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </motion.div>

      <GelatoModal
        artwork={artwork}
        open={gelatoOpen}
        onOpenChange={setGelatoOpen}
      />
    </div>
  );
}
