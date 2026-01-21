import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const animeId = searchParams.get('id');
  const epNumber = searchParams.get('ep');

  if (!animeId || !epNumber) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });

  try {
    // 1. Usamos el Proxy
    const targetUrl = `https://www3.animeflv.net/ver/${animeId}-${epNumber}`;
    const url = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. Extraemos el script de videos
    const scripts = $('script').map((_, el) => $(el).html()).get();
    const scriptWithVideos = scripts.find(s => s?.includes('var videos ='));

    if (!scriptWithVideos) return NextResponse.json({ error: 'No se encontraron videos' }, { status: 404 });

    const regex = /var videos = (\{.*?\});/s;
    const match = scriptWithVideos.match(regex);

    if (!match || !match[1]) return NextResponse.json({ error: 'Error parseando' }, { status: 500 });

    const data = JSON.parse(match[1]);
    const rawServers = data.SUB || [];

    // 3. LIMPIEZA MASIVA: Limpiamos TODAS las opciones disponibles
    const servers = rawServers.map((s: any) => {
      let cleanUrl = s.code;
      // Si viene con etiqueta iframe, sacamos solo el link
      if (cleanUrl.includes('<iframe')) {
        const srcMatch = cleanUrl.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) cleanUrl = srcMatch[1];
      }
      return {
        name: s.server, // Ej: "okru", "mega", "sw"
        url: cleanUrl
      };
    });

    return NextResponse.json({ servers });

  } catch (error) {
    console.error('Error Video API:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}