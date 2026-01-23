import { supabase } from './supabase';

/**
 * Función Maestra: Busca en caché primero, si falla, descarga de internet.
 * @param key - El nombre único para guardar (ej: "anime/naruto")
 * @param fetcher - La función que descarga los datos si no existen en memoria
 */
export async function getOrFetch(key: string, fetcher: () => Promise<any>) {
  // 1. Intentar leer de Supabase (Memoria)
  try {
    const { data: cached, error } = await supabase
      .from('api_cache')
      .select('data')
      .eq('key', key)
      .single();

    if (cached && !error) {
      console.log(`⚡ [CACHE HIT] Encontrado en Supabase: ${key}`);
      return cached.data;
    }
  } catch (e) {
    // Si falla la lectura, no pasa nada, seguimos a internet
    console.log("⚠️ Error leyendo caché, yendo a internet...");
  }

  // 2. Si no existe, ejecutar la descarga real (Internet)
  console.log(`🌐 [CACHE MISS] Descargando de internet: ${key}...`);
  try {
    const freshData = await fetcher();

    // 3. Guardar en Supabase para el futuro (sin esperar, background)
    if (freshData) {
      supabase
        .from('api_cache')
        .insert({ key: key, data: freshData })
        .then(({ error }) => {
            if (error) console.error("Error guardando en caché:", error);
            else console.log(`💾 [SAVED] Guardado en Supabase: ${key}`);
        });
    }

    return freshData;
  } catch (err) {
    console.error("Error fatal descargando:", err);
    return null;
  }
}