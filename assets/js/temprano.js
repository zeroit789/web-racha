/*
  temprano.js: Se carga en <head> antes de pintar: marca <html> con la clase "js".
  temprano.js: Loaded in <head> before painting: flags <html> with the "js" class.
  Así los estados ocultos de las entradas solo se aplican si hay JavaScript.
  So the hidden entrance states only apply when JavaScript runs.
*/
document.documentElement.classList.add('js');
// Con «reducir movimiento», todo lo continuo empieza en pausa (el botón lo puede reanudar)
// With reduced motion, everything continuous starts paused (the button can resume it)
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('pausa');
