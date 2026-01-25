'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar'; // Asegúrate de que la ruta sea correcta
import { AnimeCard } from '@/components/anime-card'; // Asegúrate de tener este componente
import { Loader2, SearchX } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q'); // Lee lo que escribiste en el buscador
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargamos el usuario para la Navbar (opcional, si quieres que salga el avatar)
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Cargar usuario del localStorage
    const userData = localStorage.getItem('userData');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        // AQUÍ LLAMAMOS A TU ARCHIVO API EXISTENTE 👇
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar fija */}
      <Navbar user={user} isGuest={!user} />

      <main className="container mx-auto px-4 pt-28 pb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
          Resultados para: <span className="text-orange-500">"{query}"</span>
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-60">
            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
            <p className="text-gray-400">Buscando en el catálogo...</p>
          </div>
        ) : results.length > 0 ? (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {results.map((anime) => (
              // USAR {...anime} es la clave para que no de error
              <AnimeCard key={anime.id} {...anime} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 text-gray-500">
            <SearchX size={60} className="mb-4 opacity-50" />
            <p className="text-xl font-medium">No encontramos nada.</p>
            <p className="text-sm">Intenta con otro nombre o revisa la ortografía.</p>
          </div>
        )}
      </main>
    </div>
  );
}