/*
  movimiento.js: entradas escalonadas de cada sección, menú del móvil accesible, botón de pausa del
  movimiento continuo y vídeo en bucle.
  movimiento.js: staggered entrances for each section, accessible phone menu, pause button for
  continuous motion and looping video.
  Los estados ocultos solo existen con la clase "js" y sin «reducir movimiento» (ver estilos.css).
  Hidden states only exist with the "js" class and without reduced motion (see estilos.css).
*/
(function () {
  'use strict';

  var html = document.documentElement;
  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- Entradas al hacer scroll / Scroll entrances ----------
  // Cada elemento [data-r] recibe .is-in una sola vez al entrar en pantalla;
  // el retraso escalonado sale de su variable --i en el CSS.
  // Each [data-r] element gets .is-in once as it enters the screen;
  // the staggered delay comes from its --i variable in the CSS.
  var piezas = Array.prototype.slice.call(document.querySelectorAll('[data-r]'));

  function mostrarTodo() { piezas.forEach(function (el) { el.classList.add('is-in'); }); }

  if (reducir.matches || !('IntersectionObserver' in window)) {
    mostrarTodo();
  } else {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    piezas.forEach(function (el) { io.observe(el); });

    // Red de seguridad: lo que ya quedó por encima de la pantalla se muestra igualmente
    // Safety net: anything already above the screen is shown anyway
    window.addEventListener('scroll', function () {
      piezas.forEach(function (el) {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().bottom < 0) el.classList.add('is-in');
      });
    }, { passive: true });
  }

  // ---------- Menú del móvil / Phone menu ----------
  // Sin JS, los enlaces se ven en la barra. Con JS, la clase «menu-listo» los pliega tras el botón.
  // Al abrir: el foco entra en el panel, Tab no sale de él y el resto de la página queda inerte;
  // Escape o «Cerrar» lo cierran y el foco vuelve al botón «Menú».
  // Without JS, the links show in the bar. With JS, the "menu-listo" class folds them behind the button.
  // On open: focus moves into the panel, Tab cannot leave it and the rest of the page is inert;
  // Escape or "Close" shuts it and focus returns to the "Menu" button.
  var boton = document.querySelector('.barra__menu');
  var panel = document.getElementById('menu-movil');

  // Partes de la página que quedan inertes con el menú abierto / Page parts made inert while the menu is open
  function resto() {
    return Array.prototype.slice.call(document.body.children).filter(function (el) { return el !== panel && el.tagName !== 'SCRIPT'; });
  }

  // Elementos que pueden recibir el foco dentro del panel / Focusable elements inside the panel
  function enfocables() {
    return Array.prototype.slice.call(panel.querySelectorAll('a[href], button:not([disabled])'));
  }

  function abrirMenu() {
    panel.hidden = false;
    boton.setAttribute('aria-expanded', 'true');
    html.classList.add('menu-abierto');
    resto().forEach(function (el) { el.inert = true; });
    var lista = enfocables();
    if (lista.length > 1) lista[1].focus(); else if (lista.length) lista[0].focus();
  }

  function cerrarMenu(devolverFoco) {
    if (panel.hidden) return;
    panel.hidden = true;
    boton.setAttribute('aria-expanded', 'false');
    html.classList.remove('menu-abierto');
    resto().forEach(function (el) { el.inert = false; });
    if (devolverFoco !== false) boton.focus();
  }

  if (boton && panel) {
    boton.addEventListener('click', abrirMenu);
    panel.querySelector('.menu-movil__cerrar').addEventListener('click', function () { cerrarMenu(); });
    // Un enlace a otra página cierra el panel sin robar el foco / A link closes the panel without stealing focus
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) cerrarMenu(false); });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); cerrarMenu(); return; }
      if (e.key !== 'Tab') return;
      // Trampa de foco: de la última pieza a la primera y al revés / Focus trap: last to first and back
      var lista = enfocables();
      var primero = lista[0], ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    });
    // Al pasar a escritorio con el menú abierto, se cierra y se quita el inert
    // When switching to desktop with the menu open, it closes and inert is removed
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (m) { if (m.matches) cerrarMenu(false); });
    // Solo ahora se pliegan los enlaces / Only now do the links fold
    html.classList.add('menu-listo');
  }

  // ---------- Pausa del movimiento continuo / Pause for continuous motion ----------
  // La cinta, el lienzo de viento, la deriva de la duna, las flechas del mapa y el vídeo se paran
  // con este botón. Con «reducir movimiento» la página carga en pausa (temprano.js) y el botón
  // los vuelve a poner en marcha.
  // The tape, wind canvas, dune drift, map arrows and video stop with this button. With reduced
  // motion the page loads paused (temprano.js) and the button starts them again.
  var pausa = document.querySelector('.barra__pausa');
  var video = document.querySelector('.loop');
  var videoVisible = false;

  function pausado() { return html.classList.contains('pausa'); }

  // Arranca o para el vídeo según la pausa y si se ve / Starts or stops the video depending on pause and visibility
  function gobernarVideo() {
    if (!video) return;
    if (!pausado() && videoVisible) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    else video.pause();
  }

  function aplicarPausa(p) {
    html.classList.toggle('pausa', p);
    if (pausa) pausa.textContent = p ? 'Reanudar movimiento' : 'Pausar movimiento';
    gobernarVideo();
  }

  if (pausa && document.querySelector('[data-continuo]')) {
    pausa.hidden = false;
    pausa.addEventListener('click', function () { aplicarPausa(!pausado()); });
    aplicarPausa(pausado());
  }

  // ---------- Vídeo en bucle / Looping video ----------
  // Sin autoplay en el HTML: solo se reproduce si no hay pausa y está en pantalla
  // No autoplay in the HTML: it only plays when not paused and on screen
  if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      videoVisible = e[0].isIntersecting;
      gobernarVideo();
    }).observe(video);
  }
})();
