import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
// 1. IMPORTAMOS SUPABASE
import { createClient } from '@supabase/supabase-js';

// 2. CONFIGURAMOS LA CONEXIÓN
// Asegúrate de que estas variables estén en tu .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Limpiamos la búsqueda (minúsculas y sin espacios extra) para que sea uniforme
  const query = searchParams.get('q')?.toLowerCase().trim();

  if (!query) {
    return NextResponse.json({ error: 'Falta búsqueda' }, { status: 400 });
  }

  // Creamos la LLAVE ÚNICA para la caché. Ej: "search:naruto"
  const cacheKey = `search:${query}`;

  try {
    // ---------------------------------------------------------
    // A. PRIMERO PREGUNTAMOS A SUPABASE (LA MEMORIA)
    // ---------------------------------------------------------
    const { data: cachedEntry } = await supabase
      .from('api_cache')
      .select('data')
      .eq('key', cacheKey)
      .single();

    if (cachedEntry && cachedEntry.data) {
      console.log(`⚡ CACHÉ: Encontrado en Supabase: "${cacheKey}"`);
      return NextResponse.json(cachedEntry.data);
    }

    // ---------------------------------------------------------
    // B. SI NO ESTÁ, HACEMOS EL SCRAPING (TU CÓDIGO ACTUAL)
    // ---------------------------------------------------------
    console.log(`🌐 INTERNET: Buscando fuera: "${query}"...`);
    
    const targetUrl = `https://www3.animeflv.net/browse?q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) throw new Error(`Proxy falló: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: any[] = [];

    $('.ListAnimes li').each((_, element) => {
      const $el = $(element);
      const id = $el.find('a').attr('href')?.split('/').pop() || '';
      const title = $el.find('.Title').last().text().trim();
      
      let poster = $el.find('img').attr('src') || '';
      if (poster.startsWith('/')) {
        poster = `https://www3.animeflv.net${poster}`;
      }

      const type = $el.find('.Type').text().trim();

      if (id && title) {
        results.push({ id, title, image: poster, type });
      }
    });

    // ---------------------------------------------------------
    // C. GUARDAMOS EL RESULTADO EN SUPABASE (PARA LA PRÓXIMA)
    // ---------------------------------------------------------
    if (results.length > 0) {
      const { error: insertError } = await supabase
        .from('api_cache')
        .insert({ 
          key: cacheKey, 
          data: results 
        });

      if (!insertError) {
        console.log(`💾 GUARDADO: "${cacheKey}" se guardó en la DB.`);
      }
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('⚠️ Error controlado:', error);
    return NextResponse.json([]); 
  }
}