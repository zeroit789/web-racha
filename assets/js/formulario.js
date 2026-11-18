/*
  formulario.js: formulario de contacto de demostración. Valida con errores accesibles,
  rellena el curso o el viento que llegan en la dirección y, al enviar, no manda nada:
  limpia el formulario y avisa de que es una demo.
  formulario.js: demo contact form. Validates with accessible errors, fills in the course or
  wind passed in the URL and, on submit, sends nothing: it clears the form and says it is a demo.
*/
(function () {
  'use strict';

  var form = document.getElementById('formulario');
  if (!form) return;
  var estado = document.getElementById('f-estado');

  // ---------- Relleno desde la dirección / Prefill from the URL ----------
  // ?curso=bautismo elige el curso; ?viento=levante&nudos=18 lo escribe en el mensaje
  // ?curso=bautismo picks the course; ?viento=levante&nudos=18 writes it in the message
  var q = new URLSearchParams(window.location.search);
  var curso = q.get('curso');
  if (curso && form.curso.querySelector('option[value="' + curso.replace(/[^a-z-]/g, '') + '"]')) form.curso.value = curso;
  var viento = q.get('viento');
  var nudos = parseInt(q.get('nudos'), 10);
  if ((viento === 'levante' || viento === 'poniente') && nudos >= 4 && nudos <= 40) {
    form.mensaje.value = 'Vengo del parte del viento: ' + (viento === 'levante' ? 'Levante' : 'Poniente') + ' de ' + nudos + ' nudos. ¿Qué clase me tocaría?';
  }

  // ---------- Reglas de cada campo / Rules for each field ----------
  var REGLAS = [
    { campo: 'nombre', error: 'e-nombre', vale: function (v) { return v.trim().length > 0; }, msg: 'Escribe tu nombre.' },
    { campo: 'correo', error: 'e-correo', vale: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, msg: 'Escribe un correo con @ y dominio, por ejemplo nombre@dominio.es.' },
    { campo: 'curso', error: 'e-curso', vale: function (v) { return v !== ''; }, msg: 'Elige un curso o «No lo sé».' },
    { campo: 'dias', error: 'e-dias', vale: function (v) { return v.trim().length > 0; }, msg: 'Dinos qué días estás en Tarifa.' },
    { campo: 'privacidad', error: 'e-privacidad', vale: function (v, el) { return el.checked; }, msg: 'Marca que has leído la política de privacidad.' }
  ];

  // Comprueba un campo y escribe (o borra) su error / Checks one field and writes (or clears) its error
  function comprobar(regla) {
    var el = form.elements[regla.campo];
    var ok = regla.vale(el.value, el);
    var caja = document.getElementById(regla.error);
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    caja.textContent = ok ? '' : regla.msg;
    return ok;
  }

  // Al salir de un campo con error, se vuelve a comprobar / Re-check a field with an error when leaving it
  REGLAS.forEach(function (r) {
    form.elements[r.campo].addEventListener('blur', function () {
      if (form.elements[r.campo].getAttribute('aria-invalid') === 'true') comprobar(r);
    });
    form.elements[r.campo].addEventListener('change', function () {
      if (form.elements[r.campo].getAttribute('aria-invalid') === 'true') comprobar(r);
    });
  });

  // ---------- Envío / Submit ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    estado.textContent = '';
    var primero = null;
    REGLAS.forEach(function (r) {
      if (!comprobar(r) && !primero) primero = form.elements[r.campo];
    });
    if (primero) { primero.focus(); return; }
    var nombre = form.nombre.value.trim();
    form.reset();
    REGLAS.forEach(function (r) { form.elements[r.campo].removeAttribute('aria-invalid'); });
    estado.textContent = 'Gracias, ' + nombre + '. Esta web es una demostración: el formulario no ha enviado ni guardado nada.';
  });
})();
