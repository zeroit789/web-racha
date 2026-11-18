/*
  server.js: servidor local para ver la web con las mismas cabeceras que Cloudflare Pages.
  server.js: local server to view the site with the same headers as Cloudflare Pages.
  Solo módulos nativos de Node. Uso: node server.js [puerto]  (por defecto 8080)
  Native Node modules only. Usage: node server.js [port]  (default 8080)
  Solo escucha en 127.0.0.1 y solo sirve ficheros públicos de esta carpeta: nada que empiece por
  punto (.git, .local), nada fuera de la carpeta (tampoco por enlaces simbólicos) y nunca este fichero.
  Listens on 127.0.0.1 only and only serves public files from this folder: nothing starting with a
  dot (.git, .local), nothing outside the folder (not through symlinks either) and never this file.
*/
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = fs.realpathSync(__dirname);
const PUERTO = Number(process.argv[2]) || 8080;
const PRIVADOS = new Set(['server.js', 'node_modules']);

// Tipos MIME de los ficheros que tiene la web / MIME types of the site's files
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.webm': 'video/webm',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.md': 'text/plain; charset=utf-8'
};

// Lee las cabeceras del fichero _headers (bloque «/*») / Reads the headers from the _headers file ("/*" block)
function leerCabeceras() {
  const cab = {};
  try {
    const lineas = fs.readFileSync(path.join(RAIZ, '_headers'), 'utf8').split(/\r?\n/);
    for (const l of lineas) {
      const m = l.match(/^\s+([A-Za-z-]+):\s*(.+)$/);
      if (m) cab[m[1]] = m[2];
    }
  } catch { /* sin _headers / no _headers */ }
  // En local (http) no se puede pedir HTTPS ni HSTS / Locally (http) HTTPS and HSTS cannot apply
  if (cab['Content-Security-Policy']) cab['Content-Security-Policy'] = cab['Content-Security-Policy'].replace(/;\s*upgrade-insecure-requests/, '');
  delete cab['Strict-Transport-Security'];
  return cab;
}
const CABECERAS = leerCabeceras();

// Devuelve la ruta real de un fichero público, o null si no se debe servir
// Returns the real path of a public file, or null if it must not be served
function ficheroPublico(candidato) {
  let real;
  try { real = fs.realpathSync(candidato); } catch { return null; }
  const rel = path.relative(RAIZ, real);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  const partes = rel.split(path.sep);
  if (partes.some((p) => p.startsWith('.') || PRIVADOS.has(p))) return null;
  try { if (!fs.statSync(real).isFile()) return null; } catch { return null; }
  return real;
}

// Envía una respuesta de texto corta / Sends a short text response
function texto(res, codigo, msg) {
  res.writeHead(codigo, { ...CABECERAS, 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(msg);
}

// Envía un fichero ya comprobado / Sends an already checked file
function enviar(res, codigo, f) {
  res.writeHead(codigo, { ...CABECERAS, 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' });
  const flujo = fs.createReadStream(f);
  flujo.on('error', () => { if (!res.headersSent) texto(res, 500, '500'); else res.destroy(); });
  flujo.pipe(res);
}

// Sirve un fichero o la página 404, como Cloudflare Pages / Serves a file or the 404 page, like Cloudflare Pages
const servidor = http.createServer((req, res) => {
  try {
    let ruta;
    try { ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { return texto(res, 400, '400'); }
    if (ruta.includes('\0')) return texto(res, 400, '400');
    if (ruta.endsWith('/')) ruta += 'index.html';
    const candidato = path.join(RAIZ, ruta);
    const f = ficheroPublico(candidato) || (!path.extname(candidato) && ficheroPublico(candidato + '.html'));
    if (f) return enviar(res, 200, f);
    const pagina404 = ficheroPublico(path.join(RAIZ, '404.html'));
    if (pagina404) return enviar(res, 404, pagina404);
    return texto(res, 404, '404');
  } catch {
    if (!res.headersSent) texto(res, 500, '500'); else res.destroy();
  }
});

servidor.listen(PUERTO, '127.0.0.1', () => {
  // Guarda su PID en .local/ para poder cerrarlo luego sin tocar otros procesos
  // Saves its PID in .local/ to stop it later without touching other processes
  try {
    fs.mkdirSync(path.join(RAIZ, '.local'), { recursive: true });
    fs.writeFileSync(path.join(RAIZ, '.local', 'server.pid'), String(process.pid));
  } catch { /* sin permiso / no permission */ }
  console.log(`Racha en http://127.0.0.1:${PUERTO}/  (PID ${process.pid})`);
});
