// =====================================================================
//  Motas.js: motas de luz flotando por la pantalla. Doradas en el
//  bosque claro y violetas (luciérnagas) en el bosque sereno.
// =====================================================================

import { PANTALLA } from '../config.js';
import { grupoFijo } from './Pantalla.js';

export class Motas {
  constructor(scene, cantidad = 28) {
    this.lista = [];
    this.textura = 'mota_dorada';
    const imagenes = [];
    for (let i = 0; i < cantidad; i++) {
      const img = scene.add
        .image(Math.random() * PANTALLA.ancho, Math.random() * PANTALLA.alto, 'mota_dorada')
        .setBlendMode('ADD');
      imagenes.push(img);
      this.lista.push({
        img,
        vx: (Math.random() - 0.5) * 14,
        vy: -2 - Math.random() * 8,
        fase: Math.random() * Math.PI * 2,
        escala: 0.5 + Math.random() * 1.1,
      });
    }
    grupoFijo(scene, 25, imagenes);
  }

  // oscuro y sereno van de 0 a 1
  update(tiempoMs, dt, oscuro, sereno) {
    const queTextura = sereno > 0.5 ? 'mota_violeta' : 'mota_dorada';
    const cambiar = queTextura !== this.textura;
    if (cambiar) this.textura = queTextura;

    const visibilidad = 1 - 0.85 * oscuro;
    for (const m of this.lista) {
      m.img.x += m.vx * dt + Math.sin(tiempoMs * 0.0006 + m.fase) * 0.15;
      m.img.y += m.vy * dt;
      if (m.img.y < -10) m.img.y = PANTALLA.alto + 10;
      if (m.img.x < -10) m.img.x = PANTALLA.ancho + 10;
      if (m.img.x > PANTALLA.ancho + 10) m.img.x = -10;

      if (cambiar) m.img.setTexture(this.textura);
      const parpadeo = 0.5 + 0.5 * Math.sin(tiempoMs * 0.0015 + m.fase);
      m.img.setAlpha((0.2 + 0.5 * parpadeo) * visibilidad);
      m.img.setScale(m.escala * (0.8 + 0.3 * parpadeo));
    }
  }
}
