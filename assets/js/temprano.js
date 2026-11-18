/*
  temprano.js: Se carga en <head> antes de pintar: marca <html> con la clase "js".
  temprano.js: Loaded in <head> before painting: flags <html> with the "js" class.
  Así los estados ocultos de las entradas solo se aplican si hay JavaScript.
  So the hidden entrance states only apply when JavaScript runs.
*/
document.documentElement.classList.add('js');
