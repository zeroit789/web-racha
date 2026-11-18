/*
  viento.js: La cosa viva de la página: el viento manda.
  viento.js: The page's live thing: the wind is in charge.
  1) Mueve la línea del héroe en la dirección y a la velocidad del viento elegido.
     Moves the hero line in the direction and at the speed of the chosen wind.
  2) Lleva el «parte del viento»: Levante o Poniente + nudos -> playa, clase, cometa y mar,
     y dibuja rayas de viento (canvas) y tres cometas (SVG) que reaccionan.
     Runs the "wind report": Levante or Poniente + knots -> beach, lesson, kite and sea,
     and draws wind streaks (canvas) and three kites (SVG) that react.
  Sin JS, la página enseña el parte por defecto escrito en el HTML.
  Without JS, the page shows the default report written in the HTML.
*/
(function () {
  'use strict';

  // ---------- Estado compartido / Shared state ----------
  // dir: 'levante' (sopla del este, empuja hacia la izquierda) o 'poniente' (empuja hacia la derecha)
  // dir: 'levante' (blows from the east, pushes left) or 'poniente' (pushes right)
  var estado = { dir: 'levante', kn: 18 };
  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Sentido del movimiento en pantalla: -1 izquierda (Levante), +1 derecha (Poniente)
  // On-screen direction of travel: -1 left (Levante), +1 right (Poniente)
  function sentido() { return estado.dir === 'levante' ? -1 : 1; }

  // Racha: el Levante llega a golpes; el Poniente es más constante
  // Gust: Levante comes in bursts; Poniente is steadier
  function racha(t) {
    if (estado.dir !== 'levante') return 1 + 0.08 * Math.sin(t * 0.7);
    var g = Math.sin(t * 0.9) + 0.5 * Math.sin(t * 2.3 + 1.3);
    return 1 + 0.45 * Math.max(0, g);
  }

  // ======================================================================
  // 1. LA LÍNEA DEL HÉROE / THE HERO LINE
  // ======================================================================
  var linea = document.querySelector('[data-linea]');
  var pistas = linea ? Array.prototype.slice.call(linea.querySelectorAll('[data-pista]')) : [];
  var anchoSeg = 0;      // ancho de un grupo de tres copias (con sus tres fotos) / width of a group of three copies (with their three photos)
  var x = 0;             // desplazamiento actual / current offset
  var heroVisible = true;

  // Mide el grupo que se repite (tres copias con fotos distintas) y coloca la cinta
  // con la primera copia centrada (también es el estado quieto)
  // Measures the repeating group (three copies with different photos) and places the tape
  // with the first copy centred (also the still state)
  function medirLinea() {
    if (!pistas.length) return;
    var segs = pistas[0].querySelectorAll('.hero__seg');
    if (!segs.length) return;
    var unaCopia = segs[0].getBoundingClientRect().width;
    anchoSeg = segs.length > 3 ? segs[3].offsetLeft - segs[0].offsetLeft : unaCopia;
    x = (linea.clientWidth - unaCopia) / 2;
    while (x > 0) x -= anchoSeg;
    pintarLinea();
  }

  // Aplica el desplazamiento a la cinta / Applies the offset to the tape
  function pintarLinea() {
    for (var i = 0; i < pistas.length; i++) {
      pistas[i].style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    }
  }

  // Avanza la línea: unos 2,2 px/s por nudo (18 nudos, unos 40 px/s)
  // Moves the line on: about 2.2 px/s per knot (18 knots, about 40 px/s)
  function moverLinea(dt, t) {
    if (!anchoSeg || !heroVisible) return;
    var v = Math.max(estado.kn, 3) * 2.2 * racha(t);
    x += sentido() * v * dt;
    // Bucle sin costura: mantener x en (-anchoSeg, 0]
    // Seamless loop: keep x within (-anchoSeg, 0]
    while (x <= -anchoSeg) x += anchoSeg;
    while (x > 0) x -= anchoSeg;
    pintarLinea();
  }

  // ======================================================================
  // 2. EL PARTE DEL VIENTO / THE WIND REPORT
  // ======================================================================
  var form = document.querySelector('.mandos');
  var rango = document.getElementById('nudos');
  var salidaNudos = document.getElementById('nudos-out');
  var oPlaya = document.getElementById('o-playa');
  var oCometa = document.getElementById('o-cometa');
  var oCurso = document.getElementById('o-curso');
  var oMar = document.getElementById('o-mar');
  var reserva = document.getElementById('reserva-viento');

  // Cometa recomendada para 75 kg: m² ≈ peso / nudos × 2,2, entre 5 y 17
  // Recommended kite for 75 kg: m² ≈ weight / knots × 2.2, between 5 and 17
  function metros(kn) {
    return Math.max(5, Math.min(17, Math.round((75 / Math.max(kn, 1)) * 2.2)));
  }

  // Traduce viento y nudos a lo que haría la escuela ese día
  // Turns wind and knots into what the school would do that day
  function recomendar(dir, kn) {
    var lev = dir === 'levante';
    var r = {};
    // Levante -> Valdevaqueros; Poniente -> Los Lances (la regla de las escuelas de Tarifa)
    // Levante -> Valdevaqueros; Poniente -> Los Lances (Tarifa schools' rule of thumb)
    r.playa = lev ? 'Valdevaqueros' : 'Los Lances';
    r.cometa = kn < 8 ? 'Ninguna' : metros(kn) + ' m²';

    if (kn < 8) r.curso = 'Sin viento: no hay clase y no se cobra';
    else if (kn < 12) r.curso = 'Bautismo con cometa grande';
    else if (lev ? kn <= 18 : kn <= 22) r.curso = lev ? 'Curso de iniciación, en grupos de dos' : 'Curso de iniciación';
    else if (lev ? kn <= 25 : kn <= 27) r.curso = lev ? 'Perfeccionamiento, con lancha en el agua' : 'Perfeccionamiento';
    else if (kn <= 33) r.curso = 'Solo alquiler, para quien navega solo';
    else r.curso = lev ? 'Hoy manda el Levante: nadie sale al agua' : 'Temporal de Poniente: hoy no se sale';

    if (lev) {
      if (kn < 15) r.mar = 'Viento de costado desde tierra y agua bastante plana';
      else if (kn <= 30) r.mar = 'Viento de costado desde tierra, agua más plana y rachas';
      else r.mar = 'Rachas fuertes desde tierra que empujan mar adentro';
    } else {
      if (kn < 15) r.mar = 'Viento de costado hacia la orilla y mar tranquilo';
      else if (kn <= 25) r.mar = 'Viento de costado hacia la orilla y ola corta';
      else r.mar = 'Mar picado y ola formada en toda la bahía';
    }
    return r;
  }

  // Cambia un texto y lo hace destellar si es distinto
  // Changes a text and flashes it if it is different
  function poner(el, texto) {
    if (!el || el.textContent === texto) return;
    el.textContent = texto;
    if (reducir.matches) return;
    el.classList.remove('is-new');
    void el.offsetWidth; // reinicia la animación / restarts the animation
    el.classList.add('is-new');
  }

  // Lee los mandos, escribe el parte y prepara el correo de reserva
  // Reads the controls, writes the report and prepares the booking email
  function actualizar() {
    var marcado = form ? form.querySelector('input[name="viento"]:checked') : null;
    estado.dir = marcado ? marcado.value : 'levante';
    estado.kn = rango ? parseInt(rango.value, 10) : 18;
    var r = recomendar(estado.dir, estado.kn);
    var nombre = estado.dir === 'levante' ? 'Levante' : 'Poniente';
    if (salidaNudos) salidaNudos.textContent = estado.kn + ' nudos';
    poner(oPlaya, r.playa);
    poner(oCometa, r.cometa);
    poner(oCurso, r.curso);
    poner(oMar, r.mar);
    // La barra dice «18 nudos» a los lectores de pantalla / The slider says "18 knots" to screen readers
    if (rango) rango.setAttribute('aria-valuetext', estado.kn + ' nudos');
    // El botón lleva el viento al formulario de contacto, que lo escribe en el mensaje
    // The button carries the wind to the contact form, which writes it in the message
    if (reserva) {
      reserva.href = 'contacto.html?viento=' + estado.dir + '&nudos=' + estado.kn + '#formulario';
    }
    if (reducir.matches) dibujarQuieto();
    return r;
  }

  // Resumen en una frase para lectores de pantalla, solo al soltar el mando (no en cada paso)
  // One-sentence summary for screen readers, only when the control is released (not on every step)
  var resumen = document.getElementById('resumen-parte');
  function anunciar() {
    var r = actualizar();
    if (!resumen) return;
    var nombre = estado.dir === 'levante' ? 'Levante' : 'Poniente';
    resumen.textContent = nombre + ' de ' + estado.kn + ' nudos: ' + r.playa + ', ' + r.curso.toLowerCase() + ', cometa ' + r.cometa.toLowerCase() + '.';
  }

  if (form) {
    form.addEventListener('input', actualizar);
    form.addEventListener('change', anunciar);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  }

  // ---------- Lienzo de rayas de viento / Wind streak canvas ----------
  var lienzo = document.querySelector('.stage__wind');
  var ctx = lienzo ? lienzo.getContext('2d') : null;
  var rayas = [];
  var W = 800, H = 420, dpr = 1;
  var escenarioVisible = false;

  // Ajusta el lienzo a su tamaño real en pantalla y reparte las rayas
  // Fits the canvas to its real on-screen size and scatters the streaks
  function ajustarLienzo() {
    if (!lienzo) return;
    var caja = lienzo.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, caja.width); H = Math.max(1, caja.height);
    lienzo.width = Math.round(W * dpr); lienzo.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!rayas.length) {
      for (var i = 0; i < 72; i++) rayas.push({ x: Math.random(), y: Math.random(), v: 0.55 + Math.random() * 0.9 });
    }
  }

  // Pinta las rayas: más largas y más rápidas cuantos más nudos
  // Paints the streaks: longer and faster the more knots
  function pintarRayas(dt, t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    var kn = estado.kn, s = sentido(), g = racha(t);
    var cuantas = Math.round(Math.min(72, 8 + kn * 1.9));
    ctx.strokeStyle = '#000';
    ctx.lineCap = 'butt';
    for (var i = 0; i < cuantas; i++) {
      var r = rayas[i];
      // avance horizontal en fracción del ancho / horizontal advance as a fraction of the width
      r.x += s * (kn * 14 * r.v * g * dt) / W;
      if (r.x > 1.15) { r.x -= 1.3; r.y = Math.random(); }
      if (r.x < -0.15) { r.x += 1.3; r.y = Math.random(); }
      var largo = (12 + kn * 3.4) * r.v * (0.8 + 0.3 * g);
      var px = r.x * W, py = r.y * H * 0.82 + 6;
      ctx.lineWidth = r.v > 1.1 ? 4 : 2.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - s * largo, py);
      ctx.stroke();
    }
  }

  // ---------- Cometas en SVG / SVG kites ----------
  var cometas = Array.prototype.slice.call(document.querySelectorAll('[data-kite]')).map(function (g, i) {
    return { g: g, linea: g.querySelector('.k-line'), baseX: [220, 420, 620][i], baseY: [120, 90, 140][i], fase: i * 1.7 };
  });

  // Coloca cada cometa: inclinada hacia donde va el viento, con tamaño según los m²
  // y, sin viento, caída sobre la arena. Las líneas bajan hasta el rider.
  // Places each kite: tilted downwind, sized by the m², and lying on the sand with
  // no wind. Its lines run down to the rider.
  function pintarCometas(t) {
    var kn = estado.kn, s = sentido();
    var m2 = metros(kn);
    var escala = Math.sqrt(m2 / 10) * 0.95;
    var calma = kn < 8;
    for (var i = 0; i < cometas.length; i++) {
      var c = cometas[i];
      var amp = 4 + kn * 0.55;
      var bob = Math.sin(t * (0.6 + kn * 0.045) + c.fase) * amp * racha(t + c.fase);
      var sway = Math.sin(t * 0.45 + c.fase) * kn * 0.6;
      var kx = c.baseX + s * kn * 1.4 + sway;
      var ky = calma ? 372 : c.baseY + bob + Math.max(0, 14 - kn) * 6;
      var ang = calma ? s * 78 : s * (6 + kn * 0.75) + Math.sin(t * 1.3 + c.fase) * (kn * 0.18);
      c.g.setAttribute('transform', 'translate(' + kx.toFixed(1) + ' ' + ky.toFixed(1) + ') rotate(' + ang.toFixed(1) + ') scale(' + escala.toFixed(3) + ')');
      // Punto del rider en coordenadas de mundo, a barlovento de la cometa
      // Rider point in world coordinates, upwind of the kite
      var rx = kx - s * 130, ry = 412;
      var a = ang * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
      var dx = (rx - kx) / escala, dy = (ry - ky) / escala;
      var lx = dx * co + dy * si, ly = -dx * si + dy * co;
      c.linea.setAttribute('d', calma ? 'M0 0' : 'M-58 22L' + lx.toFixed(1) + ' ' + ly.toFixed(1) + 'M58 22L' + lx.toFixed(1) + ' ' + ly.toFixed(1));
    }
  }

  // Un fotograma quieto para «reducir movimiento» / A still frame for reduced motion
  function dibujarQuieto() {
    pintarRayas(0, 0);
    pintarCometas(0);
  }

  // ======================================================================
  // 3. BUCLE ÚNICO / SINGLE LOOP
  // ======================================================================
  var ultimo = 0;
  function fotograma(ahora) {
    var t = ahora / 1000;
    var dt = ultimo ? Math.min(0.05, t - ultimo) : 0;
    ultimo = t;
    if (!reducir.matches) {
      moverLinea(dt, t);
      if (escenarioVisible) { pintarRayas(dt, t); pintarCometas(t); }
    }
    requestAnimationFrame(fotograma);
  }

  // Solo se anima lo que está en pantalla / Only what is on screen animates
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.target === linea) heroVisible = e.isIntersecting;
        else escenarioVisible = e.isIntersecting;
      });
    }, { rootMargin: '100px' });
    if (linea) io.observe(linea);
    if (lienzo) io.observe(lienzo);
  } else {
    escenarioVisible = true;
  }

  // ---------- Arranque / Start ----------
  function arrancar() {
    ajustarLienzo();
    medirLinea();
    actualizar();
    dibujarQuieto();
    requestAnimationFrame(fotograma);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(arrancar); else arrancar();

  // Al cambiar el tamaño se vuelve a medir / Re-measure on resize
  var espera;
  window.addEventListener('resize', function () {
    clearTimeout(espera);
    espera = setTimeout(function () { ajustarLienzo(); medirLinea(); if (reducir.matches) dibujarQuieto(); }, 120);
  });
  // Si cambia la preferencia de movimiento, la línea vuelve a su copia centrada
  // If the motion preference changes, the line returns to its centred copy
  reducir.addEventListener && reducir.addEventListener('change', function () { medirLinea(); dibujarQuieto(); });
})();
