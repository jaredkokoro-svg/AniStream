import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// 🛠️ EL ROTADOR ANTIBLOQUEOS (Opción B)
async function getHtmlRobust(targetUrl: string) {
  const strategies = [
    targetUrl, // 1. Intento Directo (Ideal para Vercel)
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`, // 2. CodeTabs (Ideal para StackBlitz)
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`       // 3. Respaldo
  ];

  for (const url of strategies) {
    try {
      console.log(`[VIDEO API] Intentando: ${url.substring(0, 45)}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Referer': 'https://www3.animeflv.net/'
        },
        signal: AbortSignal.timeout(4000)
      });

      if (response.ok) {
        const html = await response.text();
        // Si no es la pantalla de bloqueo de Cloudflare, triunfamos
        if (html.includes('<html') && !html.toLowerCase().includes('just a moment')) {
          return html; 
        }
      }
    } catch (error) {
      console.warn(`[VIDEO API] Falló intento, probando siguiente...`);
    }
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const animeId = searchParams.get('id');
  const epNumber = searchParams.get('ep');

  if (!animeId || !epNumber) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  try {
    // 1. URL real del episodio
    const targetUrl = `https://www3.animeflv.net/ver/${animeId}-${epNumber}`;
    
    // 2. Extraemos el HTML usando nuestro escudo
    const html = await getHtmlRobust(targetUrl);

    if (!html) {
      return NextResponse.json({ error: 'Bloqueo de seguridad o página no encontrada' }, { status: 503 });
    }

    const $ = cheerio.load(html);

    // 3. Extraemos el script de videos
    const scripts = $('script').map((_, el) => $(el).html()).get();
    const scriptWithVideos = scripts.find(s => s?.includes('var videos ='));

    if (!scriptWithVideos) {
      return NextResponse.json({ error: 'No se encontraron videos (estructura cambiada)' }, { status: 404 });
    }

    const regex = /var videos = (\{.*?\});/s;
    const match = scriptWithVideos.match(regex);

    if (!match || !match[1]) {
      return NextResponse.json({ error: 'Error parseando datos' }, { status: 500 });
    }

    const data = JSON.parse(match[1]);
    const rawServers = data.SUB || []; 

    // 4. LIMPIEZA MASIVA
    const servers = rawServers.map((s: any) => {
      let cleanUrl = s.code;
      if (cleanUrl.includes('<iframe')) {
        const srcMatch = cleanUrl.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) cleanUrl = srcMatch[1];
      }
      return {
        name: s.server,
        url: cleanUrl
      };
    });

    return NextResponse.json({ servers });

  } catch (error) {
    console.error('Error Video API:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}