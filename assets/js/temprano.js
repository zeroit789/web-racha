/*
  temprano.js: Se carga en <head> antes de pintar: marca <html> con la clase "js".
  temprano.js: Loaded in <head> before painting: flags <html> with the "js" class.
  Los estados ocultos y las animaciones continuas no dependen de ella: dependen de las clases que
  pone movimiento.js tras instalar sus manejadores, así que si ese script falla todo se ve y nada se mueve.
  Hidden states and continuous animations do not depend on it: they depend on the classes that
  movimiento.js sets after installing its handlers, so if that script fails everything shows and nothing moves.
*/
document.documentElement.classList.add('js');
// Con «reducir movimiento», todo lo continuo empieza en pausa (el botón lo puede reanudar)
// With reduced motion, everything continuous starts paused (the button can resume it)
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('pausa');
