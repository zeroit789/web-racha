/*
  formulario.js: formulario de contacto de demostración. Valida con errores accesibles,
  rellena el curso o el viento que llegan en la dirección y, al enviar, no manda nada:
  limpia el formulario y avisa de que es una demo. El botón «Enviar» nace desactivado en el
  HTML y solo se activa aquí, después de instalar el manejador que cancela el envío.
  formulario.js: demo contact form. Validates with accessible errors, fills in the course or
  wind passed in the URL and, on submit, sends nothing: it clears the form and says it is a demo.
  The "Send" button starts disabled in the HTML and is only enabled here, after installing the
  handler that cancels the submission.
*/
(function () {
  'use strict';

  var form = document.getElementById('formulario');
  if (!form) return;
  var estado = document.getElementById('f-estado');
  var boton = form.querySelector('button[type="submit"]');

  // Campos por su id (no tienen «name»: no hay nada que enviar) / Fields by id (no "name": nothing to send)
  var campo = function (id) { return document.getElementById(id); };

  // ---------- Relleno desde la dirección / Prefill from the URL ----------
  // ?curso=bautismo elige el curso; ?viento=levante&nudos=18 lo escribe en el mensaje.
  // Solo se aceptan valores de las listas propias y se escribe siempre como texto.
  // ?curso=bautismo picks the course; ?viento=levante&nudos=18 writes it in the message.
  // Only values from our own lists are accepted, always written as text.
  var CURSOS = { bautismo: true, iniciacion: true, perfeccionamiento: true, privadas: true, alquiler: true, 'no-se': true };
  var VIENTOS = { levante: 'Levante', poniente: 'Poniente' };
  var q;
  try { q = new URLSearchParams(window.location.search); } catch (e) { q = new URLSearchParams(''); }
  // Lee un parámetro sin dejar que una codificación rota rompa la página / Reads a parameter without letting bad encoding break the page
  function param(nombre) {
    try { var v = q.get(nombre); return v === null ? '' : String(v).trim().toLowerCase(); } catch (e) { return ''; }
  }
  var curso = param('curso');
  if (curso && Object.hasOwn(CURSOS, curso)) campo('f-curso').value = curso;
  var viento = param('viento');
  var nudos = parseInt(param('nudos'), 10);
  if (Object.hasOwn(VIENTOS, viento) && nudos >= 4 && nudos <= 40) {
    campo('f-mensaje').value = 'Vengo del parte del viento: ' + VIENTOS[viento] + ' de ' + nudos + ' nudos. ¿Qué clase me tocaría?';
  }

  // ---------- Reglas de cada campo / Rules for each field ----------
  var REGLAS = [
    { id: 'f-nombre', error: 'e-nombre', vale: function (el) { return el.value.trim().length > 0; }, msg: 'Escribe tu nombre.' },
    { id: 'f-correo', error: 'e-correo', vale: function (el) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()); }, msg: 'Escribe un correo con @ y dominio, por ejemplo nombre@dominio.es.' },
    { id: 'f-curso', error: 'e-curso', vale: function (el) { return el.value !== ''; }, msg: 'Elige un curso o «No lo sé».' },
    { id: 'f-dias', error: 'e-dias', vale: function (el) { return el.value.trim().length > 0; }, msg: 'Dinos qué días estás en Tarifa.' },
    { id: 'f-privacidad', error: 'e-privacidad', vale: function (el) { return el.checked; }, msg: 'Marca que has leído la política de privacidad.' }
  ];

  // Comprueba un campo y escribe (o borra) su error / Checks one field and writes (or clears) its error
  function comprobar(regla) {
    var el = campo(regla.id);
    var ok = regla.vale(el);
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    campo(regla.error).textContent = ok ? '' : regla.msg;
    return ok;
  }

  // Al salir de un campo con error, se vuelve a comprobar / Re-check a field with an error when leaving it
  REGLAS.forEach(function (r) {
    ['blur', 'change'].forEach(function (ev) {
      campo(r.id).addEventListener(ev, function () {
        if (campo(r.id).getAttribute('aria-invalid') === 'true') comprobar(r);
      });
    });
  });

  // ---------- Envío: nunca sale nada / Submit: nothing ever leaves ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    estado.textContent = '';
    var primero = null;
    REGLAS.forEach(function (r) {
      if (!comprobar(r) && !primero) primero = campo(r.id);
    });
    if (primero) { primero.focus(); return; }
    var nombre = campo('f-nombre').value.trim();
    form.reset();
    REGLAS.forEach(function (r) { campo(r.id).removeAttribute('aria-invalid'); });
    estado.textContent = 'Gracias, ' + nombre + '. Esta web es una demostración: el formulario no ha enviado ni guardado nada.';
  });

  // El manejador ya está puesto: ahora sí se puede pulsar / The handler is in place: now it can be pressed
  if (boton) boton.disabled = false;
})();
