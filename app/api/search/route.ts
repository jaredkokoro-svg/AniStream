import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Falta ID' }, { status: 400 });

  const cacheKey = `anime:${id}`;

  try {
    // ---------------------------------------------------------
    // A. MEMORIA: Revisar Supabase primero
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
    // B. SCRAPING BLINDADO (Intenta múltiples caminos)
    // ---------------------------------------------------------
    console.log(`🌐 SCRAPING: Buscando info fresca para "${id}"...`);
    const targetUrl = `https://www3.animeflv.net/anime/${id}`;

    // Lista de intentos en orden de prioridad
    const strategies = [
      // 1. CorsProxy.io (Suele ser rápido)
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      // 2. AllOrigins (Respaldo)
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      // 3. Directo (Por si acaso el servidor no está bloqueado)
      targetUrl 
    ];

    let html = '';
    let success = false;

    // Bucle de intentos: Si falla uno, prueba el siguiente
    for (const url of strategies) {
      try {
        console.log(`Trying connection via: ${url.substring(0, 30)}...`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          signal: AbortSignal.timeout(5000) // 5 segundos máximo por intento
        });

        if (response.ok) {
          html = await response.text();
          // Verificamos que sea HTML válido y no un error del proxy
          if (html.includes('<html') || html.includes('<!DOCTYPE')) {
            success = true;
            break; // ¡Éxito! Salimos del bucle
          }
        }
      } catch (e) {
        console.warn(`Falló intento con proxy, probando siguiente...`);
      }
    }

    if (!success || !html) {
      return NextResponse.json({ error: 'No se pudo conectar con ninguna fuente' }, { status: 503 });
    }

    // ---------------------------------------------------------
    // C. PROCESAMIENTO (Cheerio)
    // ---------------------------------------------------------
    const $ = cheerio.load(html);
    const title = $('h1.Title').text().trim();
    
    if (!title) {
       return NextResponse.json({ error: 'Anime no encontrado o estructura cambió' }, { status: 404 });
    }

    // Corrección de imagen robusta
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
    // D. GUARDADO EN SUPABASE
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