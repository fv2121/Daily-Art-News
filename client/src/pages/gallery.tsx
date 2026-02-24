import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Hash, Sparkles, ExternalLink, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Artwork } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "wouter";

function HeroArtwork({ artwork }: { artwork: Artwork }) {
  const [showRationale, setShowRationale] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full rounded-md"
      data-testid="section-hero"
    >
      <Link href={`/artwork/${artwork.id}`}>
      <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-t-md cursor-pointer">
        <img
          src={artwork.imageUrl}
          alt={artwork.caption || "Today's artwork"}
          className="w-full h-full object-cover"
          data-testid="img-hero-artwork"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="default" data-testid="badge-todays-drop">
              <Sparkles className="w-3 h-3 mr-1" />
              Today's Drop
            </Badge>
            {artwork.publishedAt && (
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(artwork.publishedAt), "MMM d, yyyy")}
              </Badge>
            )}
          </div>
          <p className="text-white text-sm md:text-lg max-w-2xl leading-relaxed" data-testid="text-hero-caption">
            {artwork.caption}
          </p>
          {artwork.hashtags && artwork.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {artwork.hashtags.map((tag, i) => (
                <span key={i} className="text-white/60 text-xs">
                  <Hash className="w-3 h-3 inline mr-0.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      </Link>
      {artwork.rationale && (
        <div className="border border-t-0 rounded-b-md bg-card">
          <button
            onClick={() => setShowRationale(!showRationale)}
            className="w-full flex items-center justify-between gap-2 p-3 md:p-4 text-sm font-medium text-foreground hover-elevate rounded-b-md"
            data-testid="button-toggle-rationale"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              Artist's Process
            </span>
            {showRationale ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <AnimatePresence>
            {showRationale && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p
                  className="px-3 md:px-4 pb-3 md:pb-4 text-sm text-muted-foreground leading-relaxed"
                  data-testid="text-hero-rationale"
                >
                  {artwork.rationale}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}

function ArtworkCard({ artwork, index }: { artwork: Artwork; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card
        className="overflow-visible group hover-elevate"
        data-testid={`card-artwork-${artwork.id}`}
      >
        <Link href={`/artwork/${artwork.id}`}>
          <div className="aspect-square overflow-hidden rounded-t-md cursor-pointer">
            <img
              src={artwork.imageUrl}
              alt={artwork.caption || "Artwork"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              data-testid={`img-artwork-${artwork.id}`}
            />
          </div>
        </Link>
        <div className="p-3">
          <p className="text-sm text-foreground line-clamp-2 mb-2" data-testid={`text-caption-${artwork.id}`}>
            {artwork.caption || "Untitled piece"}
          </p>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {artwork.publishedAt && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(artwork.publishedAt), "MMM d")}
              </span>
            )}
            {artwork.rationale && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-muted-foreground flex items-center gap-1 hover-elevate rounded-md px-1.5 py-0.5"
                data-testid={`button-rationale-${artwork.id}`}
              >
                <BookOpen className="w-3 h-3" />
                Process
              </button>
            )}
          </div>
          <AnimatePresence>
            {expanded && artwork.rationale && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p
                  className="text-xs text-muted-foreground leading-relaxed mt-2 pt-2 border-t"
                  data-testid={`text-rationale-${artwork.id}`}
                >
                  {artwork.rationale}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

function GallerySkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="w-full aspect-[21/9] rounded-md" />
      <div>
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyGallery() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="section-empty-gallery">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No artworks yet</h2>
      <p className="text-muted-foreground max-w-md">
        Run the pipeline from the Dashboard to generate your first AI artwork from today's news.
      </p>
    </div>
  );
}

export default function Gallery() {
  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks"],
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <GallerySkeleton />
      </div>
    );
  }

  const publishedArtworks = artworks?.filter((a) => a.published) || [];
  const latestArtwork = publishedArtworks[0];
  const archiveArtworks = publishedArtworks.slice(1);

  if (publishedArtworks.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <EmptyGallery />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
      {latestArtwork && <HeroArtwork artwork={latestArtwork} />}

      {archiveArtworks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" data-testid="text-archive-heading">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            Archive
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {archiveArtworks.map((artwork, i) => (
              <ArtworkCard key={artwork.id} artwork={artwork} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
