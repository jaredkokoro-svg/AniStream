import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json({ error: 'Falta búsqueda' }, { status: 400 });

  try {
    // 1. Usamos el Proxy que SI funcionaba (allorigins)
    // Agregamos &t=... para evitar que nos de datos viejos guardados
    const targetUrl = `https://www3.animeflv.net/browse?q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}&t=${Date.now()}`;
    
    const response = await fetch(proxyUrl);
    const html = await response.text();

    const $ = cheerio.load(html);
    const results: any[] = [];

    // 2. Extraemos los datos
    $('.ListAnimes li').each((_, element) => {
      const $el = $(element);
      const id = $el.find('a').attr('href')?.split('/').pop() || '';
      const title = $el.find('.Title').last().text().trim();
      const type = $el.find('.Type').text().trim();
      
      // 3. LA CORRECCIÓN DE IMAGEN
      let poster = $el.find('img').attr('src') || '';
      
      // Si la imagen viene cortada (ej: /uploads...), le pegamos el dominio
      if (poster.startsWith('/')) {
        poster = `https://www3.animeflv.net${poster}`;
      }

      if (id && title) {
        results.push({ 
          id, 
          title, 
          image: poster, // Usamos 'image' que es lo que tu tarjeta pide
          type 
        });
      }
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}