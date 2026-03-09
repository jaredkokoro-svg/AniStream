import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// Función auxiliar para scrapear listas de animes (SIN PROXY, CON DISFRAZ)
async function scrapeAnimeList(urlTarget: string) {
  try {
    const response = await fetch(urlTarget, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer': 'https://www3.animeflv.net/'
      }
    });

    if (!response.ok) {
      console.error(`Error HTTP ${response.status} al scrapear ${urlTarget}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const animes: any[] = [];

    $('article.Anime').each((_, element) => {
      const $el = $(element);
      const id = $el.find('a').attr('href')?.split('/anime/')[1] || '';
      const title = $el.find('.Title').text().trim();
      
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
    const urlTrending = 'https://www3.animeflv.net/browse?status=1&order=rating';
    const urlNew = 'https://www3.animeflv.net/browse?order=added';
    const urlClassics = 'https://www3.animeflv.net/browse?status=2&order=rating';

    const [trending, newReleases, classics] = await Promise.all([
      scrapeAnimeList(urlTrending),
      scrapeAnimeList(urlNew),
      scrapeAnimeList(urlClassics)
    ]);

    return NextResponse.json({
      trending: trending.slice(0, 10),
      newReleases: newReleases.slice(0, 10),
      classics: classics.slice(0, 10)
    });

  } catch (error) {
    console.error('Error cargando home:', error);
    return NextResponse.json({ error: 'Error cargando home' }, { status: 500 });
  }
}