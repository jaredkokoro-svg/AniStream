import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
// 1. Importamos Supabase
import { createClient } from '@supabase/supabase-js';

// 2. Configuración (igual que en search)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Falta ID' }, { status: 400 });

  // Clave única para la caché (Ej: "anime:one-piece-tv")
  const cacheKey = `anime:${id}`;

  try {
    // ---------------------------------------------------------
    // A. PRIMERO MIRAMOS EN SUPABASE (MEMORIA)
    // ---------------------------------------------------------
    const { data: cachedEntry } = await supabase
      .from('api_cache')
      .select('data')
      .eq('key', cacheKey)
      .single();

    if (cachedEntry && cachedEntry.data) {
      console.log(`⚡ CACHÉ HIT: Info recuperada para "${id}"`);
      return NextResponse.json(cachedEntry.data);
    }

    // ---------------------------------------------------------
    // B. SI NO ESTÁ, HACEMOS SCRAPING (INTERNET)
    // ---------------------------------------------------------
    console.log(`🌐 SCRAPING: Buscando info fresca para "${id}"...`);

    const targetUrl = `https://www3.animeflv.net/anime/${id}`;
    // Usamos allorigins para mantener consistencia con el buscador
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });

    if (!response.ok) throw new Error('Error al conectar con AnimeFLV');

    const html = await response.text();
    const $ = cheerio.load(html);

    // -- Extracción de datos --
    const title = $('h1.Title').text().trim();
    
    if (!title) {
       // Si falla, no guardamos en caché para no guardar basura
       return NextResponse.json({ error: 'No se pudo leer el título' }, { status: 404 });
    }

    // Corrección de imagen
    let poster = $('.Image figure img').attr('src') || '';
    if (poster.startsWith('/')) {
      poster = `https://www3.animeflv.net${poster}`;
    }

    const description = $('.Description p').text().trim();
    const type = $('.Type').text().trim();
    const genres = $('nav.Nvgnrs a').map((_, el) => $(el).text().trim()).get();
    const status = $('.AnmStts span').text().trim();

    // Extraer Episodios
    const scripts = $('script').map((_, el) => $(el).html()).get();
    const scriptWithEpisodes = scripts.find(s => s?.includes('var episodes ='));
    
    let episodes: any[] = [];
    if (scriptWithEpisodes) {
      const regex = /var episodes = (\[.*?\]);/s;
      const match = scriptWithEpisodes.match(regex);
      if (match && match[1]) {
        const rawEpisodes = JSON.parse(match[1]);
        episodes = rawEpisodes.map((ep: any[]) => ({
          number: ep[0],
          id: ep[1]
        })).reverse();
      }
    }

    const animeInfo = {
      id,
      title,
      poster,
      description,
      type,
      genres,
      status,
      episodes
    };

    // ---------------------------------------------------------
    // C. GUARDAMOS EN SUPABASE
    // ---------------------------------------------------------
    if (episodes.length > 0) {
      const { error } = await supabase
        .from('api_cache')
        .insert({ 
          key: cacheKey, 
          data: animeInfo 
        });
      
      if (!error) console.log(`💾 INFO GUARDADA: "${id}" en Supabase.`);
    }

    return NextResponse.json(animeInfo);

  } catch (error) {
    console.error('Error Info API:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}