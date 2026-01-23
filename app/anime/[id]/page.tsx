'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Play, Loader2, Info, PlayCircle, Server, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
// 👇 1. IMPORTAMOS NUESTRA FUNCIÓN INTELIGENTE
import { getOrFetch } from '@/lib/smart-fetch';

export default function AnimeDetail() {
  const params = useParams();
  const id = params?.id as string;

  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentEp, setCurrentEp] = useState<any>(null);
  const [serverList, setServerList] = useState<any[]>([]); 
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [loadingVideo, setLoadingVideo] = useState(false);

  // 👇 2. MODIFICAMOS EL EFECTO PARA USAR EL CEREBRO (getOrFetch)
  useEffect(() => {
    if (!id) return;

    const loadAnimeData = async () => {
      // Usamos getOrFetch:
      // Clave: "anime/nombre-del-anime"
      // Fetcher: La función que descarga si no hay caché
      const data = await getOrFetch(`anime/${id}`, async () => {
        const res = await fetch(`/api/info?id=${id}`);
        return await res.json();
      });

      if (data) {
        setInfo(data);
        setLoading(false);
      }
    };

    loadAnimeData();
  }, [id]);

  const loadEpisode = async (episode: any) => {
    if (!episode) return;
    
    // Scroll suave hacia arriba para ver el video
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setCurrentEp(episode);
    setLoadingVideo(true);
    setServerList([]);
    setCurrentVideoUrl('');

    try {
      // NOTA: Los videos caducan rápido, por eso NO los guardamos en caché permanente igual que la info.
      // Los pedimos frescos siempre.
      const res = await fetch(`/api/video?id=${id}&ep=${episode.number}`);
      const data = await res.json();
      
      if (data.servers && data.servers.length > 0) {
        setServerList(data.servers);
        setCurrentVideoUrl(data.servers[0].url);
      } else {
        alert('No hay servidores disponibles.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingVideo(false);
    }
  };

  // --- LÓGICA DE NAVEGACIÓN ---
  const nextEp = currentEp ? info?.episodes?.find((e: any) => e.number === currentEp.number + 1) : null;
  const prevEp = currentEp ? info?.episodes?.find((e: any) => e.number === currentEp.number - 1) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-600" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      
      {/* FONDO INMERSIVO (Backdrop) */}
      <div className="absolute top-0 left-0 w-full h-[60vh] -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#0a0a0a]/80 to-[#0a0a0a]" />
        <img src={info?.poster} alt="Fondo Anime" className="w-full h-full object-cover opacity-30 blur-2xl" />
      </div>

      {/* NAVBAR SIMPLE */}
      <div className="p-6 flex items-center gap-4 z-10 relative">
        <Link href="/" className="p-3 bg-black/50 hover:bg-orange-600 rounded-full transition-colors backdrop-blur-md group">
          <ArrowLeft size={20} className="group-hover:scale-110 transition-transform" />
        </Link>
        <h1 className="text-2xl font-black tracking-tight drop-shadow-lg truncate">{info?.title}</h1>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-10 z-10 relative">
        
        {/* COLUMNA IZQUIERDA: VIDEO Y DETALLES */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* REPRODUCTOR ESTILIZADO */}
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-orange-900/20 border border-neutral-800 relative group">
            {loadingVideo ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-neutral-900">
                <Loader2 className="animate-spin text-orange-500" size={48} />
                <p className="text-neutral-400 font-medium animate-pulse">Conectando con servidores...</p>
              </div>
            ) : currentVideoUrl ? (
              <iframe 
                src={currentVideoUrl} 
                className="w-full h-full" 
                allowFullScreen 
                allow="autoplay; encrypted-media"
                referrerPolicy="no-referrer"
              />
            ) : (
              // ESTADO INICIAL
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                <img src={info?.poster} alt="Portada Anime" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                <div className="z-10 text-center">
                  <PlayCircle size={64} className="mx-auto text-orange-500 mb-4 drop-shadow-lg animate-bounce" />
                  <p className="text-xl font-bold">Selecciona un episodio</p>
                </div>
              </div>
            )}
          </div>

          {/* BARRA DE CONTROL (ANTERIOR / SIGUIENTE) */}
          {currentEp && (
            <div className="flex items-center justify-between gap-4">
              <button 
                onClick={() => prevEp && loadEpisode(prevEp)}
                disabled={!prevEp}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-all ${
                  prevEp 
                    ? 'bg-neutral-800 hover:bg-neutral-700 hover:text-orange-400 cursor-pointer' 
                    : 'bg-neutral-900/50 text-neutral-600 cursor-not-allowed'
                }`}
              >
                <ChevronLeft size={20} /> Anterior
              </button>

              <div className="px-4 py-2 bg-neutral-900 rounded-lg text-sm font-bold text-orange-500 border border-neutral-800">
                Episodio {currentEp.number}
              </div>

              <button 
                onClick={() => nextEp && loadEpisode(nextEp)}
                disabled={!nextEp}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-all ${
                  nextEp 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/20 cursor-pointer' 
                    : 'bg-neutral-900/50 text-neutral-600 cursor-not-allowed'
                }`}
              >
                Siguiente <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* CONTROLES DE SERVIDOR */}
          {serverList.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 backdrop-blur-sm">
              <span className="text-xs font-bold text-neutral-400 uppercase flex items-center gap-2 mr-2">
                <Server size={14}/> Servidores:
              </span>
              {serverList.map((server, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentVideoUrl(server.url)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wide ${
                    currentVideoUrl === server.url
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                  }`}
                >
                  {server.name}
                </button>
              ))}
            </div>
          )}

          {/* SINOPSIS */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Info className="text-orange-500" size={20}/> Sinopsis
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold px-3 py-1 bg-orange-600/20 text-orange-400 rounded-md border border-orange-500/20 uppercase">
                {info?.type}
              </span>
              <span className="text-xs font-bold px-3 py-1 bg-green-600/20 text-green-400 rounded-md border border-green-500/20 uppercase">
                {info?.status}
              </span>
              {info?.genres?.map((g: string) => (
                <span key={g} className="text-xs font-bold px-3 py-1 bg-neutral-800 text-neutral-300 rounded-md border border-neutral-700">
                  {g}
                </span>
              ))}
            </div>
            <p className="text-neutral-300 leading-relaxed text-lg">{info?.description}</p>
          </div>
        </div>

        {/* COLUMNA DERECHA: LISTA DE EPISODIOS */}
        <div className="lg:col-span-4 flex flex-col h-[600px] bg-neutral-900/40 rounded-2xl border border-neutral-800 overflow-hidden backdrop-blur-md">
          <div className="p-4 border-b border-neutral-800 bg-neutral-900/80 sticky top-0 z-10">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Star className="text-orange-500 fill-orange-500" size={18} /> 
              Episodios ({info?.episodes?.length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {info?.episodes?.map((ep: any) => (
              <button
                key={ep.number}
                onClick={() => loadEpisode(ep)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group ${
                  currentEp?.number === ep.number
                    ? 'bg-gradient-to-r from-orange-600/20 to-transparent border-l-4 border-orange-500'
                    : 'hover:bg-neutral-800 border-l-4 border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  currentEp?.number === ep.number ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-500 group-hover:text-white group-hover:bg-neutral-700'
                }`}>
                  {ep.number}
                </div>
                <div className="text-left">
                  <span className={`block text-sm font-medium ${currentEp?.number === ep.number ? 'text-orange-400' : 'text-white'}`}>
                    Episodio {ep.number}
                  </span>
                </div>
                {currentEp?.number === ep.number && <Play size={16} className="ml-auto text-orange-500 animate-pulse"/>}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}