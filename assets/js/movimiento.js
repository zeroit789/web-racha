/*
  movimiento.js: entradas escalonadas de cada sección, menú del móvil accesible y vídeo en bucle.
  movimiento.js: staggered entrances for each section, accessible phone menu and looping video.
  Los estados ocultos solo existen con la clase "js" y sin «reducir movimiento» (ver estilos.css).
  Hidden states only exist with the "js" class and without reduced motion (see estilos.css).
*/
(function () {
  'use strict';

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
  // Al abrir: el foco entra en el panel y no sale con Tab; Escape o «Cerrar» lo cierran
  // y el foco vuelve al botón «Menú».
  // On open: focus moves into the panel and Tab cannot leave it; Escape or "Close" shuts it
  // and focus returns to the "Menu" button.
  var boton = document.querySelector('.barra__menu');
  var panel = document.getElementById('menu-movil');

  // Elementos que pueden recibir el foco dentro del panel / Focusable elements inside the panel
  function enfocables() {
    return Array.prototype.slice.call(panel.querySelectorAll('a[href], button:not([disabled])'));
  }

  function abrirMenu() {
    panel.hidden = false;
    boton.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-abierto');
    var lista = enfocables();
    if (lista.length > 1) lista[1].focus(); else if (lista.length) lista[0].focus();
  }

  function cerrarMenu(devolverFoco) {
    if (panel.hidden) return;
    panel.hidden = true;
    boton.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-abierto');
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
    // Si la ventana crece hasta escritorio, el panel se cierra / If the window grows to desktop, the panel closes
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (m) { if (m.matches) cerrarMenu(false); });
  }

  // ---------- Vídeo en bucle / Looping video ----------
  // Con «reducir movimiento» se para; fuera de pantalla se pausa para no gastar
  // Stops under reduced motion; pauses off screen to save power
  var video = document.querySelector('.loop');
  if (video) {
    if (reducir.matches) { video.pause(); video.removeAttribute('autoplay'); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
        else video.pause();
      }).observe(video);
    }
  }
})();
