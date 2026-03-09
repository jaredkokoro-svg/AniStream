import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// 🛠️ LA NUEVA ARMA: El Rotador Antibloqueos
async function getHtmlRobust(targetUrl: string) {
  // Lista de disfraces (Estrategias)
  const strategies = [
    targetUrl, // 1. Intento Directo
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`, // 2. Proxy CodeTabs (Muy bueno para Cloudflare)
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`       // 3. Proxy AllOrigins (Respaldo final)
  ];

  for (const url of strategies) {
    try {
      console.log(`Intentando conectar vía: ${url.substring(0, 40)}...`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        },
        // Si el servidor se queda pensando 4 segundos, lo abortamos y probamos el siguiente
        signal: AbortSignal.timeout(4000) 
      });

      if (response.ok) {
        const html = await response.text();
        // Verificamos que no sea la página de "Verificando que eres humano" de Cloudflare
        if (html.includes('<html') && !html.toLowerCase().includes('just a moment')) {
          return html; // ¡Tuvimos éxito! Devolvemos el HTML
        }
      }
    } catch (error) {
      // Si da SocketError o Timeout, lo ignoramos y el bucle pasa al siguiente proxy
      console.warn(`Falló este intento, saltando al siguiente...`);
    }
  }
  
  return null; // Si fallan los 3, devolvemos null
}


// Función auxiliar para scrapear listas de animes
async function scrapeAnimeList(urlTarget: string) {
  try {
    const html = await getHtmlRobust(urlTarget);
    
    if (!html) {
      console.error(`Todos los intentos fallaron para ${urlTarget}`);
      return [];
    }

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
    console.error(`Error procesando datos de ${urlTarget}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    const urlTrending = 'https://www3.animeflv.net/browse?status=1&order=rating';
    const urlNew = 'https://www3.animeflv.net/browse?order=added';
    const urlClassics = 'https://www3.animeflv.net/browse?status=2&order=rating';

    // Para evitar abrumar los proxies y que nos bloqueen, ejecutamos 1 por 1 en lugar de Promise.all
    const trending = await scrapeAnimeList(urlTrending);
    const newReleases = await scrapeAnimeList(urlNew);
    const classics = await scrapeAnimeList(urlClassics);

    return NextResponse.json({
      trending: trending.slice(0, 10),
      newReleases: newReleases.slice(0, 10),
      classics: classics.slice(0, 10)
    });

  } catch (error) {
    console.error('Error cargando home:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}