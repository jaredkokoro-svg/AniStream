'use client';

import { useState, useEffect } from 'react';
import { Play, Plus, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HeroSectionProps {
  anime: any;
  user?: any;
}

export function HeroSection({ anime, user }: HeroSectionProps) {
  // Prioridad: Banner (Ancho) -> Imagen (Original) -> Poster (Vertical)
  // Si usas una API como Jikan, intenta buscar la propiedad .jpg.large_image_url
  const bgImage = anime.banner || anime.image || anime.poster;
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  // Lógica de Favoritos (Intacta)
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
      
      {/* 1. IMAGEN DE FONDO MEJORADA */}
      {/* Usamos <img> en lugar de backgroundImage para mejor renderizado */}
      <div className="absolute inset-0 select-none">
        <img 
          src={bgImage} 
          alt={anime.title}
          className="w-full h-full object-cover opacity-60 scale-105" // scale-105 evita bordes blancos y da efecto zoom leve
        />
        
        {/* Truco: Si la imagen es muy mala, descomenta la siguiente línea para difuminarla un poco y que se vea 'aesthetic' */}
        {/* <div className="absolute inset-0 backdrop-blur-[2px]"></div> */}
      </div>

      {/* 2. CAPAS DE DEGRADADO (VIGNETTE) */}
      {/* Esto oscurece los bordes y hace que la imagen se fusione con el fondo negro de la app */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>

      {/* 3. CONTENIDO (TEXTO Y BOTONES) */}
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

          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight drop-shadow-2xl text-white">
            {anime.title}
          </h1>
          
          <p className="text-gray-200 text-lg md:text-xl line-clamp-3 max-w-xl drop-shadow-lg font-medium">
            {anime.description || "Sin descripción disponible."}
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition transform hover:scale-105 shadow-xl shadow-orange-900/30">
              <Play fill="currentColor" size={20} />
              Ver Ahora
            </button>
            
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

        {/* SALUDO DE BIENVENIDA */}
        {user && (
          <div className="hidden lg:block text-right animate-fade-in-up pr-10 pointer-events-none select-none">
            <h2 className="text-4xl font-light text-white drop-shadow-lg opacity-90">
              Bienvenido
            </h2>
            <h2 className="text-6xl font-bold text-white mt-[-5px] drop-shadow-2xl tracking-tight">
              {user.user_metadata?.full_name || user.name || "Nakama"}
            </h2>
          </div>
        )}

      </div>
    </div>
  );
}