'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // <--- IMPORTANTE: Importamos Link
import { Play, Plus, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HeroSectionProps {
  anime: any;
  user?: any;
}

export function HeroSection({ anime, user }: HeroSectionProps) {
  // Prioridad: Banner (Ancho) -> Imagen (Original) -> Poster (Vertical)
  const bgImage = anime.banner || anime.image || anime.poster;
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  // Lógica de Favoritos
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('anime_id', anime.id)
        .single();
      if (data) setIsFavorite(true);
    };
    checkFavorite();
  }, [anime.id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      alert("Necesitas iniciar sesión para guardar animes.");
      return;
    }
    setLoadingFav(true);

    if (isFavorite) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('anime_id', anime.id);
      if (!error) setIsFavorite(false);
    } else {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          anime_id: anime.id,
          title: anime.title,
          poster: anime.poster || anime.image,
        });
      if (!error) setIsFavorite(true);
    }
    setLoadingFav(false);
  };

  return (
    <div className="relative w-full h-[85vh] md:h-[75vh] flex items-center overflow-hidden bg-black">
      
      {/* 1. IMAGEN DE FONDO */}
      <div className="absolute inset-0 select-none">
        <img 
          src={bgImage} 
          alt={anime.title}
          className="w-full h-full object-cover opacity-60 scale-105"
        />
      </div>

      {/* 2. CAPAS DE DEGRADADO */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>

      {/* 3. CONTENIDO */}
      <div className="relative container mx-auto px-6 w-full flex flex-col md:flex-row items-end md:items-center justify-between mt-16 z-10">
        
        <div className="max-w-2xl space-y-6">
          <div className="flex gap-2">
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg shadow-orange-900/40">
              Destacado
            </span>
            <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-md border border-white/10">
              {anime.type || 'TV'}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black leading-none tracking-tight drop-shadow-2xl text-white">
            {anime.title}
          </h1>
          
          <p className="text-gray-200 text-lg md:text-xl line-clamp-3 max-w-xl drop-shadow-lg font-medium">
            {anime.description || "Sin descripción disponible."}
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            
            {/* --- CORRECCIÓN AQUÍ: Agregamos Link --- */}
            <Link href={`/anime/${anime.id}`}>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition transform hover:scale-105 shadow-xl shadow-orange-900/30">
                <Play fill="currentColor" size={20} />
                Ver Ahora
              </button>
            </Link>
            {/* --------------------------------------- */}
            
            <button 
              onClick={toggleFavorite}
              disabled={loadingFav}
              className={`
                px-6 py-3 rounded-lg font-medium border backdrop-blur-md flex items-center gap-2 transition-all shadow-lg
                ${isFavorite 
                  ? "bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600/30" 
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }
              `}
            >
              {loadingFav ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isFavorite ? (
                <>
                  <Check size={20} /> En mi lista
                </>
              ) : (
                <>
                  <Plus size={20} /> Mi Lista
                </>
              )}
            </button>
          </div>
        </div>

        {/* TARJETA DE BIENVENIDA (LADO DERECHO) */}
        {user && (
          <div className="hidden lg:flex flex-col items-end justify-center h-full pr-10 pointer-events-none select-none z-20 absolute right-0 top-0 bottom-0">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl transform transition-all hover:scale-105 duration-500 group">
               <div className="flex flex-col text-right">
                  <span className="text-[13px] text-orange-400 font-bold tracking-[0.2em] uppercase mb-1">
                    Bienvenido
                  </span>
                  <span className="text-3xl font-black text-white tracking-tight group-hover:text-orange-100 transition-colors">
                    {user.user_metadata?.full_name?.split(' ')[0] || user.name || "Nakama"}
                  </span>
               </div>
               <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
               <div className="relative">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-900/50 text-lg">
                    {user.user_metadata?.full_name ? user.user_metadata.full_name[0].toUpperCase() : "N"}
                 </div>
                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}