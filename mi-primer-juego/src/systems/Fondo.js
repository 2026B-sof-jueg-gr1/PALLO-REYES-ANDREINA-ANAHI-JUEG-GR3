// =====================================================================
//  Fondo.js: cielo y tres capas de árboles con parallax (cada capa se
//  mueve a distinta velocidad para dar profundidad). Hay dos juegos de
//  capas, el claro y el oscuro, y se mezclan según dónde está Sylva.
// =====================================================================

import { PANTALLA, RES } from '../config.js';
import { grupoFijo } from './Pantalla.js';

const CAPAS = [
  { k: 'far',  vx: 0.10, vy: 0.12, prof: -28 },
  { k: 'mid',  vx: 0.28, vy: 0.18, prof: -26 },
  { k: 'near', vx: 0.55, vy: 0.25, prof: -24 },
];

export class Fondo {
  // estatico = true: sin cámara (menú y final), se dibuja una vez
  constructor(scene, { estatico = false } = {}) {
    const { ancho, alto } = PANTALLA;
    const cx = ancho / 2;
    const cy = alto / 2;
    this.estatico = estatico;

    const hijos = [];
    this.cieloClaro = scene.add.image(cx, cy, 'cielo_claro');
    this.cieloOscuro = scene.add.image(cx, cy, 'cielo_oscuro').setAlpha(0);

    this.capas = { claro: [], oscuro: [] };
    const porProfundidad = [];
    for (const paleta of ['claro', 'oscuro']) {
      for (const def of CAPAS) {
        const capa = scene.add.tileSprite(cx, cy, ancho, alto, `capa_${paleta}_${def.k}`);
        capa.tileScaleX = capa.tileScaleY = 1 / RES;   // la textura trae RES veces más píxeles
        capa.tilePositionY = 20 * RES;
        if (paleta === 'oscuro') capa.setAlpha(0);
        this.capas[paleta].push({ capa, def });
        porProfundidad.push({ capa, prof: def.prof + (paleta === 'oscuro' ? 1 : 0) });
      }
    }
    porProfundidad.sort((a, b) => a.prof - b.prof);

    this.niebla = scene.add.tileSprite(cx, alto - 60, ancho, 220, 'niebla').setAlpha(0.35);

    // Todo el fondo va en un grupo pegado a la pantalla, de atrás hacia adelante
    grupoFijo(scene, -30, [this.cieloClaro, this.cieloOscuro, ...porProfundidad.map((o) => o.capa), this.niebla]);
    this.tiempo = 0;
  }

  // peso: 0 = bosque claro, 1 = bosque oscuro (o sereno)
  update(camara, peso, dt) {
    this.tiempo += dt;
    this.cieloOscuro.setAlpha(peso);
    for (const paleta of ['claro', 'oscuro']) {
      const alfa = paleta === 'claro' ? 1 : peso;
      for (const { capa, def } of this.capas[paleta]) {
        capa.setAlpha(paleta === 'claro' && def.k === 'far' ? 1 : alfa);
        capa.tilePositionX = camara.scrollX * def.vx * RES;
        capa.tilePositionY = (20 + camara.scrollY * def.vy) * RES;
      }
    }
    this.niebla.tilePositionX = camara.scrollX * 0.8 + this.tiempo * 6;
    this.niebla.setAlpha(0.22 + peso * 0.3);
  }

  // Para escenas sin cámara móvil: un fondo fijo con un poco de movimiento
  moverSuave(dt) {
    this.tiempo += dt;
    for (const paleta of ['claro', 'oscuro']) {
      for (const { capa, def } of this.capas[paleta]) {
        capa.tilePositionX = this.tiempo * 10 * def.vx * 4 * RES;
      }
    }
    this.niebla.tilePositionX = this.tiempo * 6;
  }

  // Cuánto del bosque oscuro se ve (0 a 1), para el menú y el final
  mezcla(peso) {
    this.cieloOscuro.setAlpha(peso);
    for (const { capa } of this.capas.oscuro) capa.setAlpha(peso);
  }
}
