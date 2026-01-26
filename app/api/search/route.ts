import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Falta búsqueda' }, { status: 400 });
  }

  try {
    const targetUrl = `https://www3.animeflv.net/browse?q=${encodeURIComponent(query)}`;
    
    // 1. CAMBIO DE PROXY: Usamos 'allorigins' que es más amigable para servidores
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    
    console.log(`🔌 Conectando a: ${proxyUrl}`);

    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      },
      next: { revalidate: 0 } // Evitamos caché vieja
    });

    if (!response.ok) {
      throw new Error(`Proxy falló con status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: any[] = [];

    $('.ListAnimes li').each((_, element) => {
      const $el = $(element);
      const id = $el.find('a').attr('href')?.split('/').pop() || '';
      // Usamos .last() para evitar títulos duplicados
      const title = $el.find('.Title').last().text().trim();
      
      // 2. CORRECCIÓN DE IMAGEN
      let poster = $el.find('img').attr('src') || '';
      if (poster.startsWith('/')) {
        poster = `https://www3.animeflv.net${poster}`;
      }

      const type = $el.find('.Type').text().trim();

      if (id && title) {
        results.push({ 
          id, 
          title, 
          image: poster, 
          type 
        });
      }
    });

    console.log(`✅ Encontrados: ${results.length}`);
    return NextResponse.json(results);

  } catch (error) {
    console.error('⚠️ Error controlado en búsqueda:', error);
    // 3. PROTECCIÓN: Si falla, devolvemos array vacío.
    // Esto evita que tu página explote con error 500.
    return NextResponse.json([]); 
  }
}