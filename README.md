# Racha · web de demostración

[Español](#español) · [English](#english)

---

## Español

### Qué es

Racha es una **escuela de kitesurf ficticia** en Tarifa. Esta web es una demostración de cómo podría ser la web de un negocio así: no existe la escuela, no se venden cursos y los precios, direcciones y correos son de ejemplo. Todas las páginas llevan `noindex` para que no salgan en buscadores como si el negocio fuera real.

La idea de la web: **el viento manda**. En la portada eliges Levante o Poniente y su fuerza en nudos, y la página te dice qué playa, qué clase y qué cometa tocarían; la cinta del titular, las rayas de viento y las cometas dibujadas se mueven en la dirección y a la fuerza elegidas.

### Páginas

| Fichero | Contenido |
| --- | --- |
| `index.html` | Portada: cinta con el nombre, intro, parte del viento interactivo, cursos, precios, dudas y contacto |
| `cursos.html` | Niveles, ficha completa de cada curso, un día de curso |
| `spots.html` | Mapa esquemático con el viento, las tres playas y cuándo no se sale |
| `sobre-nosotros.html` | Historia, equipo (oficios, sin caras), el lugar y valores |
| `contacto.html` | Formulario de demostración (no envía nada), dirección inventada y plano dibujado |
| `aviso-legal.html`, `privacidad.html`, `cookies.html` | Textos legales de la demostración |
| `creditos.html` | Autor y licencia de cada foto, del vídeo y de la tipografía |
| `404.html` | Página no encontrada (rutas desde la raíz) |

### Tecnología

- HTML, CSS y JavaScript sin dependencias ni paso de compilación.
- Tipografía Bricolage Grotesque (versión v9 de Google Fonts, subconjunto latino, fichero variable; se usan los pesos 400 a 800) servida desde `assets/fonts/`, con su licencia en `assets/fonts/OFL.txt`.
- Nada se carga de CDN. La única petición externa es la analítica Plausible (`analytics.danimefle.com`), sin cookies.
- `_headers` con la política de seguridad (CSP), HSTS, `nosniff`, `Referrer-Policy` y `Permissions-Policy` para Cloudflare Pages.
- `server.js` para verla en local con las mismas cabeceras: solo módulos nativos de Node (probado con Node 24.22.2).

### Verla en local

```bash
node server.js 8080
# abre http://127.0.0.1:8080/
```

El servidor quita `upgrade-insecure-requests` y HSTS de la CSP porque en local se sirve por http. Guarda su PID en `.local/server.pid` (si la carpeta existe) para poder cerrarlo sin tocar otros procesos.

También se puede abrir `index.html` directamente con el navegador (`file://`); en ese modo no se aplican las cabeceras.

### Desplegar en Cloudflare Pages

1. Sube la carpeta a un repositorio de GitHub.
2. En Cloudflare, *Workers & Pages* → *Create* → *Pages* → *Connect to Git* y elige el repositorio.
3. Sin comando de compilación; directorio de salida: `/` (la raíz).
4. Cloudflare aplica `_headers` y sirve `404.html` para las rutas que no existen.
5. Añade el dominio propio (por ejemplo `racha.danimefle.com`).

### Cómo adaptarla

- **Textos:** están en cada `.html`. Los cursos y precios se repiten en `index.html`, `cursos.html` y en el `<select>` de `contacto.html`.
- **Colores y tipografía:** variables al principio de `assets/css/estilos.css` (`--bg`, `--ink`, `--accent`, `--grey`, `--mint`, `--orange` y los cinco pasos de letra). Si cambias la tipografía, vuelve a medir el factor del nombre del pie (`.pie__mark`, comentado en el CSS).
- **Imágenes:** en `assets/img/` (WebP). Cambia el `src`, el `width`/`height` y el `alt`, y actualiza `creditos.html` y `CREDITOS.md`.
- **El parte del viento:** la lógica está en `assets/js/viento.js` (función `recomendar`): playas, nudos por curso y la fórmula de la cometa (m² ≈ peso / nudos × 2,2 para 75 kg).
- **URL base:** `https://racha.danimefle.com` aparece solo en las etiquetas `canonical`, `og:url`, `og:image`, `twitter:image`, en el JSON-LD de la portada, en `sitemap.xml` y en `robots.txt`. Los enlaces internos son relativos. El dominio de la analítica va aparte, en el atributo `data-domain="racha.danimefle.com"` del script de Plausible de cada página.
- **Quitar `noindex`:** si la web pasa a ser de un negocio real, borra `<meta name="robots" content="noindex, follow">` de cada página y revisa los textos legales.
- **Formulario:** `assets/js/formulario.js` valida y limpia sin enviar. Para enviarlo de verdad hace falta un servicio de formularios y abrir su dominio en `form-action` y `connect-src` de `_headers`.

### Créditos y licencias

- **Código:** licencia MIT (ver `LICENSE`).
- **Fotos y vídeo:** Wikimedia Commons, con licencias CC BY-SA 4.0, CC BY 2.0 y CC0. Detalle por imagen en `creditos.html` y `CREDITOS.md`. Las obras CC BY-SA se comparten con la misma licencia.
- **Tipografía:** Bricolage Grotesque, de Mathieu Triay (The Bricolage Grotesque Project Authors), con licencia SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).

---

## English

### What it is

Racha is a **fictitious kitesurf school** in Tarifa, Spain. This site shows what such a business's website could look like: the school does not exist, nothing is sold, and prices, addresses and emails are examples. Every page carries `noindex` so it does not show up in search engines as if the business were real.

The idea: **the wind is in charge**. On the home page you pick Levante or Poniente and its strength in knots, and the page tells you which beach, which lesson and which kite size would fit; the headline tape, the wind streaks and the drawn kites move in the chosen direction and strength.

### Pages

| File | Content |
| --- | --- |
| `index.html` | Home: name tape, intro, interactive wind report, courses, prices, FAQ and contact |
| `cursos.html` | Levels, full card for each course, a course day |
| `spots.html` | Schematic map with the wind, the three beaches and when nobody goes out |
| `sobre-nosotros.html` | Story, team (trades, no faces), the place and values |
| `contacto.html` | Demo form (sends nothing), invented address and drawn plan |
| `aviso-legal.html`, `privacidad.html`, `cookies.html` | Legal texts for the demo |
| `creditos.html` | Author and licence of every photo, the video and the typeface |
| `404.html` | Not found page (root-relative paths) |

### Technology

- HTML, CSS and JavaScript with no dependencies and no build step.
- Bricolage Grotesque typeface (Google Fonts v9, Latin subset, one variable file; weights 400 to 800 are used) served from `assets/fonts/`, with its licence in `assets/fonts/OFL.txt`.
- Nothing is loaded from a CDN. The only external request is Plausible analytics (`analytics.danimefle.com`), cookie-free.
- `_headers` with the Content Security Policy, HSTS, `nosniff`, `Referrer-Policy` and `Permissions-Policy` for Cloudflare Pages.
- `server.js` to view it locally with the same headers: native Node modules only (tested with Node 24.22.2).

### Run it locally

```bash
node server.js 8080
# open http://127.0.0.1:8080/
```

The server drops `upgrade-insecure-requests` and HSTS because it serves plain http locally. It writes its PID to `.local/server.pid` (if that folder exists) so it can be stopped without touching other processes.

You can also open `index.html` straight in the browser (`file://`); headers do not apply in that mode.

### Deploy to Cloudflare Pages

1. Push the folder to a GitHub repository.
2. In Cloudflare, *Workers & Pages* → *Create* → *Pages* → *Connect to Git* and pick the repository.
3. No build command; output directory: `/` (the root).
4. Cloudflare applies `_headers` and serves `404.html` for missing routes.
5. Add the custom domain (for example `racha.danimefle.com`).

### How to adapt it

- **Copy:** lives in each `.html`. Courses and prices appear in `index.html`, `cursos.html` and the `<select>` in `contacto.html`.
- **Colours and type:** variables at the top of `assets/css/estilos.css` (`--bg`, `--ink`, `--accent`, `--grey`, `--mint`, `--orange` and the five type steps). If you change the typeface, re-measure the footer name factor (`.pie__mark`, commented in the CSS).
- **Images:** in `assets/img/` (WebP). Change `src`, `width`/`height` and `alt`, and update `creditos.html` and `CREDITOS.md`.
- **Wind report:** the logic is in `assets/js/viento.js` (`recomendar` function): beaches, knots per course and the kite formula (m² ≈ weight / knots × 2.2 for 75 kg).
- **Base URL:** `https://racha.danimefle.com` only appears in `canonical`, `og:url`, `og:image`, `twitter:image`, the home page JSON-LD, `sitemap.xml` and `robots.txt`. Internal links are relative. The analytics domain is separate: the `data-domain="racha.danimefle.com"` attribute of the Plausible script on every page.
- **Removing `noindex`:** if the site becomes a real business, delete `<meta name="robots" content="noindex, follow">` from every page and review the legal texts.
- **Form:** `assets/js/formulario.js` validates and clears without sending. Sending for real needs a form service, and its domain added to `form-action` and `connect-src` in `_headers`.

### Credits and licences

- **Code:** MIT licence (see `LICENSE`).
- **Photos and video:** Wikimedia Commons, under CC BY-SA 4.0, CC BY 2.0 and CC0. Per-image detail in `creditos.html` and `CREDITOS.md`. CC BY-SA works are shared under the same licence.
- **Typeface:** Bricolage Grotesque by Mathieu Triay (The Bricolage Grotesque Project Authors), under the SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).
