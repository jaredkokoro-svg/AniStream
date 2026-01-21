'use client';

import { useState, useEffect, Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { AnimeCard } from '@/components/anime-card';
import { Loader2, Filter, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

// Lista de géneros oficiales de AnimeFLV (Slug vs Nombre Real)
const GENRES = [
  { id: 'accion', name: 'Acción', color: 'bg-red-500' },
  { id: 'aventura', name: 'Aventura', color: 'bg-orange-500' },
  { id: 'comedia', name: 'Comedia', color: 'bg-yellow-500' },
  { id: 'drama', name: 'Drama', color: 'bg-blue-500' },
  { id: 'fantasia', name: 'Fantasía', color: 'bg-purple-500' },
  { id: 'ciencia-ficcion', name: 'Ciencia Ficción', color: 'bg-cyan-500' },
  { id: 'misterio', name: 'Misterio', color: 'bg-slate-500' },
  { id: 'terror', name: 'Terror', color: 'bg-stone-800' },
  { id: 'romance', name: 'Romance', color: 'bg-pink-500' },
  { id: 'deportes', name: 'Deportes', color: 'bg-emerald-500' },
  { id: 'recuentos-de-la-vida', name: 'Slice of Life', color: 'bg-lime-600' },
  { id: 'ecchi', name: 'Ecchi', color: 'bg-fuchsia-600' },
  { id: 'musica', name: 'Música', color: 'bg-indigo-500' },
  { id: 'escolares', name: 'Escolares', color: 'bg-sky-600' },
];

function BrowseContent() {
  const [selectedGenre, setSelectedGenre] = useState('accion');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenre = async () => {
      setLoading(true);
      setResults([]);
      try {
        const res = await fetch(`/api/browse?genre=${selectedGenre}&order=default`);
        const data = await res.json();
        if (Array.isArray(data)) setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenre();
  }, [selectedGenre]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <Navbar />

      <div className="container mx-auto px-4 pt-28">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* BARRA LATERAL DE GÉNEROS */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-neutral-900/50 rounded-2xl p-6 border border-white/5 sticky top-28">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Filter size={20} className="text-orange-500"/> Géneros
              </h2>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all text-left flex items-center justify-between group",
                      selectedGenre === genre.id 
                        ? `${genre.color} text-white shadow-lg` 
                        : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                    )}
                  >
                    {genre.name}
                    {selectedGenre === genre.id && <Sparkles size={14} className="animate-pulse"/>}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* GRID DE RESULTADOS */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Explorando: <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase">{GENRES.find(g => g.id === selectedGenre)?.name}</span>
              </h1>
              <p className="text-neutral-500 mt-1">Los animes más populares de esta categoría</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-neutral-900 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {results.map((anime) => (
                  <AnimeCard key={anime.id} {...anime} image={anime.poster} />
                ))}
              </div>
            )}
            
            {!loading && results.length === 0 && (
              <div className="text-center py-20 text-neutral-500">
                No se encontraron animes para este género (o AnimeFLV está lento).
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

export default function Browse() {
  return (
    <Suspense fallback={<div className="bg-black h-screen" />}>
      <BrowseContent />
    </Suspense>
  );
}