/*
  server.js: servidor local para ver la web con las mismas cabeceras que Cloudflare Pages.
  server.js: local server to view the site with the same headers as Cloudflare Pages.
  Solo módulos nativos de Node. Uso: node server.js [puerto]  (por defecto 8080)
  Native Node modules only. Usage: node server.js [port]  (default 8080)
*/
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = __dirname;
const PUERTO = Number(process.argv[2]) || 8080;

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

// Sirve un fichero o la página 404, como Cloudflare Pages / Serves a file or the 404 page, like Cloudflare Pages
const servidor = http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const fichero = path.normalize(path.join(RAIZ, ruta));
  const dentro = fichero.startsWith(RAIZ) && !fichero.includes(`${path.sep}.local`);
  const enviar = (codigo, f) => {
    res.writeHead(codigo, { ...CABECERAS, 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  };
  if (dentro && fs.existsSync(fichero) && fs.statSync(fichero).isFile()) return enviar(200, fichero);
  // Sin extensión: probar «ruta.html» (URL limpia) / No extension: try "path.html" (clean URL)
  if (dentro && !path.extname(fichero) && fs.existsSync(fichero + '.html')) return enviar(200, fichero + '.html');
  const pagina404 = path.join(RAIZ, '404.html');
  if (fs.existsSync(pagina404)) return enviar(404, pagina404);
  res.writeHead(404, { ...CABECERAS, 'Content-Type': 'text/plain; charset=utf-8' });
  return res.end('404');
});

servidor.listen(PUERTO, '127.0.0.1', () => {
  // Guarda su PID para poder cerrarlo luego sin tocar otros procesos / Saves its PID to stop it later without touching other processes
  try { fs.writeFileSync(path.join(RAIZ, '.local', 'server.pid'), String(process.pid)); } catch { /* sin carpeta / no folder */ }
  console.log(`Racha en http://127.0.0.1:${PUERTO}/  (PID ${process.pid})`);
});
