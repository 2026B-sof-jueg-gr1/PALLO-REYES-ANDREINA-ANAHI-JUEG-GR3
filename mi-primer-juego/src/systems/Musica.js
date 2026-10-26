// =====================================================================
//  Musica.js: reproduce las pistas de assets/audio/ (si existen) y
//  mezcla sus volúmenes según dónde está Sylva. Si falta un archivo,
//  esa pista simplemente no suena y el juego sigue.
// =====================================================================

import { AUDIO } from '../config.js';

export class Musica {
  constructor(scene) {
    this.scene = scene;
    this.pistas = {};
    this.volumenActual = {};
    for (const clave of Object.keys(AUDIO.archivos)) {
      if (scene.cache.audio.exists(clave)) {
        this.pistas[clave] = scene.sound.add(clave, { loop: true, volume: 0 });
        this.volumenActual[clave] = 0;
      }
    }
    this.iniciada = false;
    this.modoFinal = false;
  }

  iniciar() {
    if (this.iniciada) return;
    this.iniciada = true;
    for (const pista of Object.values(this.pistas)) pista.play();
  }

  // claro y oscuro van de 0 a 1 según el ambiente donde está Sylva
  mezclar(claro, oscuro, dt) {
    if (!this.iniciada) return;
    const objetivo = {
      mus_claro: this.modoFinal ? 0 : claro,
      mus_oscuro: this.modoFinal ? 0 : oscuro,
      mus_final: this.modoFinal ? 1 : 0,
      amb_bosque: 1,
    };
    for (const [clave, pista] of Object.entries(this.pistas)) {
      const meta = objetivo[clave] * AUDIO.volumen[clave];
      const v = this.volumenActual[clave];
      const nuevo = v + (meta - v) * Math.min(1, dt * 1.5);
      this.volumenActual[clave] = nuevo;
      pista.setVolume(nuevo);
    }
  }

  // Cambia a la pista final (suave)
  pasarAFinal() {
    this.modoFinal = true;
  }

  detener() {
    for (const pista of Object.values(this.pistas)) {
      pista.stop();
      pista.destroy();
    }
    this.pistas = {};
  }
}
