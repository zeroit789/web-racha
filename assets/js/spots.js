/*
  spots.js: mapa de spots. Al elegir Levante o Poniente se marca la playa que toca,
  las flechas de viento cambian de sentido y el texto lo dice (también a lectores de pantalla).
  spots.js: spots map. Choosing Levante or Poniente highlights the matching beach,
  the wind arrows turn around and the text says so (to screen readers too).
  Sin JS, el mapa queda con Levante marcado y el texto por defecto.
  Without JS, the map stays with Levante highlighted and the default text.
*/
(function () {
  'use strict';

  var form = document.querySelector('.mapa__ctrl');
  if (!form) return;
  var flechas = document.getElementById('m-flechas');
  var res = document.getElementById('mapa-res');
  var spots = Array.prototype.slice.call(document.querySelectorAll('.m-spot'));

  // Texto de cada viento / Text for each wind
  var TEXTOS = {
    levante: ['Valdevaqueros', 'El viento entra de costado y el agua está más plana. Damos todas las clases, con lancha.'],
    poniente: ['Los Lances', 'El viento llega de costado hacia la orilla: el mejor sitio para empezar.']
  };

  // Marca el spot, gira las flechas y escribe el resultado / Highlights the spot, turns the arrows and writes the result
  function aplicar() {
    var marcado = form.querySelector('input[name="viento-mapa"]:checked');
    var v = marcado ? marcado.value : 'levante';
    spots.forEach(function (s) { s.classList.toggle('is-activo', s.getAttribute('data-spot') === v); });
    if (flechas) flechas.classList.toggle('is-poniente', v === 'poniente');
    if (res) {
      res.textContent = '';
      var fuerte = document.createElement('strong');
      fuerte.textContent = TEXTOS[v][0];
      res.appendChild(fuerte);
      res.appendChild(document.createTextNode(TEXTOS[v][1]));
    }
  }

  form.addEventListener('change', aplicar);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  aplicar();
})();
