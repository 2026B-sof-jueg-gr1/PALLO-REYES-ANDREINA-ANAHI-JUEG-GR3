// =====================================================================
//  Pantalla.js: ayudas para la calidad de imagen.
//  El juego "piensa" en PANTALLA.ancho x PANTALLA.alto (800x450) y el
//  lienzo real mide RES veces más. Cada escena usa estas ayudas para
//  que las coordenadas sigan siendo las de siempre.
// =====================================================================

import { RES } from '../config.js';

// Cámara de una escena fija (menú, final, interfaz): coordenadas 1:1 con el diseño.
export function camaraFija(scene) {
  const cam = scene.cameras.main;
  cam.setOrigin(0, 0);
  cam.setZoom(RES);
  return cam;
}

// Agrupa objetos que deben quedarse pegados a la pantalla (cielo, bruma, viñeta)
// aunque la cámara del juego haga zoom. Se les contrarresta el zoom cada cuadro
// con escena.zoomFijos(zoom) (solo la escena del juego lo necesita).
export function grupoFijo(scene, profundidad, hijos) {
  const c = scene.add.container(0, 0, hijos).setScrollFactor(0).setDepth(profundidad);
  if (!scene.fijos) scene.fijos = [];
  scene.fijos.push(c);
  return c;
}

export function contrarrestarZoom(scene, zoom) {
  if (!scene.fijos) return;
  const e = 1 / zoom;
  for (const c of scene.fijos) c.setScale(e);
}
