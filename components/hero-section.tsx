"use client";

import Link from "next/link";
import { Play, Plus, Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  anime: {
    id: string;
    title: string;
    description: string;
    image: string;
    rating?: number;
    year?: number;
    genre?: string[];
    type?: string;
  };
}

export function HeroSection({ anime }: HeroSectionProps) {
  if (!anime) return null;

  return (
    <section className="relative w-full h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-full object-cover object-center"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center pt-20">
        <div className="max-w-3xl space-y-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
             <span className="px-3 py-1 bg-orange-600 text-white rounded-md text-xs font-bold uppercase tracking-wider">
               {anime.type || 'Anime'}
             </span>
             {anime.genre?.slice(0, 3).map((g) => (
              <span key={g} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-xs font-medium text-white border border-white/10">
                {g}
              </span>
             ))}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl">
            {anime.title}
          </h1>

          {/* Description */}
          <p className="text-neutral-300 text-lg md:text-xl leading-relaxed line-clamp-3 max-w-2xl drop-shadow-md">
            {anime.description || "Sin descripción disponible."}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link href={`/anime/${anime.id}`}>
              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white gap-2 px-8 h-14 text-lg font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all hover:scale-105"
              >
                <Play className="w-6 h-6 fill-current" />
                Ver Ahora
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 gap-2 px-6 h-14 text-base rounded-xl backdrop-blur-sm bg-black/20"
            >
              <Plus className="w-5 h-5" />
              Mi Lista
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}