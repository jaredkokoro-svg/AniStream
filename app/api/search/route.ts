import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q'); // Obtenemos el término de búsqueda

  if (!query) return NextResponse.json([]);

  try {
    const targetUrl = `https://www3.animeflv.net/browse?q=${encodeURIComponent(query)}`;

    // Petición directa disfrazada
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Referer': 'https://www3.animeflv.net/'
      }
    });

    if (!response.ok) {
      return NextResponse.json([]);
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

    return NextResponse.json(animes);

  } catch (error) {
    console.error('Error Search API:', error);
    return NextResponse.json([], { status: 500 });
  }
}