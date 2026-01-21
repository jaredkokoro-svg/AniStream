import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre') || 'all';
  const order = searchParams.get('order') || 'default';

  try {
    // Construimos la URL de AnimeFLV con el filtro
    let targetUrl = `https://www3.animeflv.net/browse?order=${order}`;
    if (genre !== 'all') {
      targetUrl += `&genre=${genre}`;
    }

    const url = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(url);
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
    return NextResponse.json({ error: 'Error filtrando animes' }, { status: 500 });
  }
}