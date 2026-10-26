// =====================================================================
//  Sonido.js: efectos de sonido generados por código con Web Audio
//  (campanitas, la caja musical). No necesita archivos de audio, así
//  que funciona igual aunque todavía no hayas subido la música.
// =====================================================================

import { AUDIO, CAJA_MUSICAL } from '../config.js';

export class Sonido {
  constructor(scene) {
    const gestor = scene.sound;
    this.ctx = gestor && gestor.context ? gestor.context : null;
    // Se conecta al volumen general de Phaser, para respetar silencio y volumen
    this.destino = gestor && gestor.masterVolumeNode ? gestor.masterVolumeNode : this.ctx ? this.ctx.destination : null;
  }

  get disponible() {
    return !!(this.ctx && this.destino);
  }

  // Una nota suave, tipo campanita o caja musical
  tono(frecuencia, { inicio = 0, duracion = 1.4, volumen = 0.16, tipo = 'triangle' } = {}) {
    if (!this.disponible) return;
    const ctx = this.ctx;
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime + inicio;
    const vol = volumen * AUDIO.efectos;

    const capas = [
      { f: frecuencia, tipo, v: 1, d: duracion },
      { f: frecuencia * 2.76, tipo: 'sine', v: 0.22, d: duracion * 0.45 }, // brillo metálico
    ];
    for (const c of capas) {
      const osc = ctx.createOscillator();
      const ganancia = ctx.createGain();
      osc.type = c.tipo;
      osc.frequency.value = c.f;
      ganancia.gain.setValueAtTime(0.0001, t0);
      ganancia.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * c.v), t0 + 0.012);
      ganancia.gain.exponentialRampToValueAtTime(0.0001, t0 + c.d);
      osc.connect(ganancia);
      ganancia.connect(this.destino);
      osc.start(t0);
      osc.stop(t0 + c.d + 0.05);
    }
  }

  // Recuerdo feliz: dos notas que suben. Recuerdo triste: dos que bajan.
  recuerdoFeliz() {
    this.tono(659.25, { duracion: 1.5 });
    this.tono(987.77, { inicio: 0.16, duracion: 1.8, volumen: 0.12 });
  }

  recuerdoTriste() {
    this.tono(440, { duracion: 1.6 });
    this.tono(329.63, { inicio: 0.2, duracion: 2.0, volumen: 0.12 });
  }

  // Fragmento de la melodía de la caja musical (0, 1 o 2)
  fragmentoCaja(indice) {
    const [desde, hasta] = CAJA_MUSICAL.fragmentos[indice];
    for (let i = desde; i < hasta; i++) {
      this.tono(CAJA_MUSICAL.notas[i], { inicio: (i - desde) * CAJA_MUSICAL.separacion, duracion: 1.8, volumen: 0.17 });
    }
  }

  // La melodía completa
  cajaCompleta() {
    const n = CAJA_MUSICAL.notas;
    n.forEach((f, i) => {
      const ultima = i === n.length - 1;
      this.tono(f, {
        inicio: i * CAJA_MUSICAL.separacionFinal,
        duracion: ultima ? 3.8 : 1.9,
        volumen: 0.18,
      });
    });
    return n.length * CAJA_MUSICAL.separacionFinal; // cuánto dura, en segundos
  }

  // Un toquecito suave al avanzar el texto
  avanzar() {
    this.tono(880, { duracion: 0.18, volumen: 0.05, tipo: 'sine' });
  }

  // Un pequeño sonido al volver al punto seguro
  regresar() {
    this.tono(392, { duracion: 0.9, volumen: 0.08 });
  }
}
