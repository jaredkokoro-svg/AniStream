import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// Función auxiliar para scrapear listas de animes (reutilizamos la lógica)
async function scrapeAnimeList(urlTarget: string) {
  try {
    const url = `https://corsproxy.io/?${encodeURIComponent(urlTarget)}`;
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const animes: any[] = [];

    $('article.Anime').each((_, element) => {
      const $el = $(element);
      const id = $el.find('a').attr('href')?.split('/anime/')[1] || '';
      const title = $el.find('.Title').text().trim();
      // Aseguramos que la imagen tenga el dominio completo
      let poster = $el.find('img').attr('src') || '';
      if (poster && !poster.startsWith('http')) {
        poster = 'https://www3.animeflv.net' + poster;
      }
      const type = $el.find('.Type').text().trim();
      const rating = $el.find('.Vts').text().trim();

      if (id && title) {
        animes.push({ id, title, poster, type, rating });
      }
    });

    return animes;
  } catch (error) {
    console.error(`Error scraping ${urlTarget}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // 1. Definimos las URLs para cada categoría
    // Tendencias: En emisión (status=1) y ordenados por calificación (order=rating)
    const urlTrending = 'https://www3.animeflv.net/browse?status=1&order=rating';
    
    // Nuevos: Ordenados por fecha de agregado (order=added)
    const urlNew = 'https://www3.animeflv.net/browse?order=added';
    
    // Clásicos: Finalizados y mejor calificados
    const urlClassics = 'https://www3.animeflv.net/browse?status=2&order=rating';

    // 2. Ejecutamos las 3 búsquedas EN PARALELO (para que sea rápido)
    const [trending, newReleases, classics] = await Promise.all([
      scrapeAnimeList(urlTrending),
      scrapeAnimeList(urlNew),
      scrapeAnimeList(urlClassics)
    ]);

    // 3. Devolvemos todo organizado
    return NextResponse.json({
      trending: trending.slice(0, 10),    // Top 10 tendencias
      newReleases: newReleases.slice(0, 10), // Top 10 nuevos
      classics: classics.slice(0, 10)     // Top 10 clásicos
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error cargando home' }, { status: 500 });
  }
}