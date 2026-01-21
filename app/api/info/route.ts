import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Falta ID' }, { status: 400 });

  try {
    // 1. Usamos el Proxy para saltar bloqueos
    const targetUrl = `https://www3.animeflv.net/anime/${id}`;
    const url = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. EXTRACCIÓN QUIRÚRGICA (Aquí estaba el error)
    // Antes agarraba todo el bloque, ahora buscamos específicamente h1.Title
    const title = $('h1.Title').text().trim();
    
    // Si el título sale vacío (error de carga), ponemos un fallback
    if (!title) {
       return NextResponse.json({ error: 'No se pudo leer el título' }, { status: 404 });
    }

    const poster = 'https://www3.animeflv.net' + ($('.Image figure img').attr('src') || '');
    const description = $('.Description p').text().trim();
    const type = $('.Type').text().trim(); // TV, OVA, Película
    
    // Extraer Géneros
    const genres = $('nav.Nvgnrs a').map((_, el) => $(el).text().trim()).get();

    // Extraer Estado (En emisión / Finalizado)
    const status = $('.AnmStts span').text().trim();

    // 3. Extraer Episodios (Truco: están en un script, no en el HTML visible)
    const scripts = $('script').map((_, el) => $(el).html()).get();
    const scriptWithEpisodes = scripts.find(s => s?.includes('var episodes ='));
    
    let episodes = [];
    if (scriptWithEpisodes) {
      const regex = /var episodes = (\[.*?\]);/s;
      const match = scriptWithEpisodes.match(regex);
      if (match && match[1]) {
        // Los episodios en AnimeFLV vienen como [num, id], los mapeamos a objetos limpios
        const rawEpisodes = JSON.parse(match[1]);
        episodes = rawEpisodes.map((ep: any[]) => ({
          number: ep[0],
          id: ep[1] // ID necesario para el video
        })).reverse(); // Invertimos para que el 1 salga primero (opcional)
      }
    }

    return NextResponse.json({
      id,
      title,
      poster,
      description,
      type,
      genres,
      status,
      episodes
    });

  } catch (error) {
    console.error('Error Info API:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}