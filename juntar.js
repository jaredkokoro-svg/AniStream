const fs = require('fs');
const path = require('path');

const archivoSalida = 'todo_el_proyecto.txt';
const carpetasIgnoradas = ['node_modules', '.next', 'out', 'public', '.git'];
const extensionesValidas = ['.ts', '.tsx', '.js', '.jsx'];

if (fs.existsSync(archivoSalida)) fs.unlinkSync(archivoSalida);

let archivosContados = 0;

function recorrerCarpeta(directorioActual) {
    console.log(`📂 Explorando: ${directorioActual}`);
    const archivos = fs.readdirSync(directorioActual);

    archivos.forEach(archivo => {
        const rutaCompleta = path.join(directorioActual, archivo);
        const stats = fs.statSync(rutaCompleta);

        if (stats.isDirectory()) {
            if (!carpetasIgnoradas.includes(archivo)) {
                recorrerCarpeta(rutaCompleta);
            }
        } else if (stats.isFile()) {
            const ext = path.extname(archivo).toLowerCase();
            if (extensionesValidas.includes(ext) && archivo !== 'juntar.js') {
                console.log(`  📄 Archivo detectado: ${archivo}`);
                const contenido = fs.readFileSync(rutaCompleta, 'utf8');
                const separador = `\n\n=== FILE: ${rutaCompleta} ===\n`;
                fs.appendFileSync(archivoSalida, separador + contenido, 'utf8');
                archivosContados++;
            }
        }
    });
}

console.log('🚀 Iniciando extracción detallada...');
try {
    recorrerCarpeta('.');
    console.log(`\n✅ ¡Proceso terminado!`);
    console.log(`📊 Archivos procesados: ${archivosContados}`);
    console.log(`💾 Guardado en: ${archivoSalida}`);
} catch (err) {
    console.error(`❌ Error durante la ejecución: ${err.message}`);
}