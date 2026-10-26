// =====================================================================
//  Oscuridad.js: capa oscura con un círculo de visión alrededor de
//  Sylva. Se arma con una imagen (el círculo suave) y cuatro rectángulos
//  grandes que cubren el resto de la pantalla.
// =====================================================================

import { LUZ } from '../config.js';

const RADIO_TEXTURA = 256;   // radio exterior del círculo dibujado en textures.js
const MITAD_TEXTURA = 512;
const GRANDE = 4000;

export class Oscuridad {
  constructor(scene) {
    this.imagen = scene.add.image(0, 0, 'oscuridad').setDepth(30);
    this.rects = [];
    for (let i = 0; i < 4; i++) {
      this.rects.push(scene.add.rectangle(0, 0, 10, 10, LUZ.colorOscuridad).setDepth(30));
    }
    this.radio = LUZ.radioSinFarol;
    this.intensidad = 0;
    this.visible = false;
    this.mostrar(false);
  }

  mostrar(v) {
    this.visible = v;
    this.imagen.setVisible(v);
    for (const r of this.rects) r.setVisible(v);
  }

  // x, y: posición de Sylva. intensidad: 0 a 1. radioMeta: visibilidad que se busca.
  update(x, y, intensidad, radioMeta) {
    this.intensidad += (intensidad - this.intensidad) * 0.2;
    this.radio += (radioMeta - this.radio) * LUZ.suavizado;

    if (this.intensidad < 0.01) {
      if (this.visible) this.mostrar(false);
      return;
    }
    if (!this.visible) this.mostrar(true);

    const alfa = this.intensidad * LUZ.opacidadMaxima;
    const escala = this.radio / RADIO_TEXTURA;
    const mitad = MITAD_TEXTURA * escala;

    this.imagen.setPosition(x, y).setScale(escala).setAlpha(alfa);

    const [arriba, abajo, izquierda, derecha] = this.rects;
    const solape = 1; // se superponen 1 px para que no quede una línea clara

    arriba.setSize(GRANDE * 2, GRANDE).setPosition(x, y - mitad + solape - GRANDE / 2);
    abajo.setSize(GRANDE * 2, GRANDE).setPosition(x, y + mitad - solape + GRANDE / 2);
    izquierda.setSize(GRANDE, mitad * 2).setPosition(x - mitad + solape - GRANDE / 2, y);
    derecha.setSize(GRANDE, mitad * 2).setPosition(x + mitad - solape + GRANDE / 2, y);
    for (const r of this.rects) r.setAlpha(alfa);
  }
}
