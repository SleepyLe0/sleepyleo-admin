"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GifResult {
  id: string;
  title: string;
  preview: string;
  url: string;
}

interface MemePickerProps {
  currentUrl?: string | null;
  onSelect: (url: string | null) => void;
}

export function MemePicker({ currentUrl, onSelect }: MemePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/giphy?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (url: string) => {
    onSelect(url);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
    setOpen(isOpen);
  };

  return (
    <>
      <div className="space-y-2">
        {currentUrl ? (
          <div className="relative rounded-lg overflow-hidden h-32 bg-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt="Current meme"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-800/50">
            <div className="text-center">
              <ImageIcon className="h-6 w-6 text-neutral-600 mx-auto mb-1" />
              <p className="text-xs text-neutral-500">No meme selected</p>
            </div>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
          onClick={() => setOpen(true)}
        >
          <Search className="h-3.5 w-3.5 mr-2" />
          {currentUrl ? "Change Meme" : "Pick a Meme"}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-neutral-900 border-neutral-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Pick a Meme</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a GIF..."
              className="pl-9 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
              autoFocus
            />
          </div>
          <div className="min-h-[240px]">
            {loading ? (
              <div className="flex items-center justify-center h-60">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 max-h-[360px] overflow-y-auto pr-1">
                {results.map((gif) => (
                  <button
                    key={gif.id}
                    type="button"
                    onClick={() => handleSelect(gif.url)}
                    className="relative aspect-square rounded-lg overflow-hidden bg-neutral-800 hover:ring-2 hover:ring-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    title={gif.title}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gif.preview}
                      alt={gif.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="flex items-center justify-center h-60 text-neutral-500 text-sm">
                No results for &quot;{query}&quot;
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 gap-2 text-neutral-500">
                <Search className="h-8 w-8 text-neutral-700" />
                <p className="text-sm">Type to search GIFs via Tenor</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-neutral-600 text-right">
            Powered by GIPHY
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
