import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic'; // Para que no guarde caché vieja

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Falta el parámetro de búsqueda' }, { status: 400 });
  }

  try {
    // 1. Conectamos con AnimeFLV
    const targetUrl = `https://www3.animeflv.net/browse?q=${encodeURIComponent(query)}`;
    const url = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const response = await fetch(url);
    const html = await response.text();

    // 2. Cargamos Cheerio
    const $ = cheerio.load(html);
    const results: any[] = [];

    // 3. Extraemos la información
    $('.ListAnimes li').each((_, element) => {
      const $el = $(element);
      const id = $el.find('a').attr('href')?.split('/').pop() || ''; // Sacamos el ID de la URL
      const title = $el.find('.Title').text().trim();
      const poster = $el.find('img').attr('src') || '';
      const type = $el.find('.Type').text().trim();

      if (id && title) {
        results.push({ id, title, poster, type });
      }
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error en scraping:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}