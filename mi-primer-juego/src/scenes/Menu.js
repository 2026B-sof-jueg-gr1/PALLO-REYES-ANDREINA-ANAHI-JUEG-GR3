// =====================================================================
//  Menu.js: pantalla de inicio. También sirve para "desbloquear" el
//  audio del navegador (los navegadores exigen un clic o una tecla
//  antes de dejar sonar la música), en computadora y en celular.
// =====================================================================

import { PANTALLA, DIALOGO } from '../config.js';
import { HISTORIA } from '../data/story.js';
import { Fondo } from '../systems/Fondo.js';
import { Motas } from '../systems/Motas.js';
import { camaraFija } from '../systems/Pantalla.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { ancho, alto } = PANTALLA;
    camaraFija(this);
    this.iniciando = false;

    this.fondo = new Fondo(this, { estatico: true });
    this.fondo.mezcla(0);
    this.motas = new Motas(this, 36);
    this.add.image(ancho / 2, alto / 2, 'vineta').setDepth(36).setScale(1.2);

    this.add
      .text(ancho / 2, 140, HISTORIA.titulo, {
        fontFamily: DIALOGO.fuente,
        fontSize: '84px',
        color: '#f4f8ee',
        stroke: '#1b4a4c',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(40);

    this.add
      .text(ancho / 2, 212, HISTORIA.subtitulo, {
        fontFamily: DIALOGO.fuente,
        fontSize: '24px',
        color: '#e6f3e8',
        fontStyle: 'italic',
      })
      .setOrigin(0.5)
      .setDepth(40);

    const inicio = this.add
      .text(ancho / 2, 330, HISTORIA.iniciar, {
        fontFamily: DIALOGO.fuente,
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: 'rgba(8,16,24,0.45)',
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(40);
    this.tweens.add({ targets: inicio, alpha: 0.35, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add
      .text(ancho / 2, alto - 18, HISTORIA.controles, {
        fontFamily: DIALOGO.fuente,
        fontSize: '15px',
        color: '#d8efe8',
      })
      .setOrigin(0.5, 1)
      .setDepth(40);

    const empezar = () => {
      if (this.iniciando) return;
      this.iniciando = true;
      this.cameras.main.fadeOut(700, 0, 0, 0);
      this.time.delayedCall(760, () => this.scene.start('Game'));
    };
    this.input.keyboard.once('keydown', empezar);
    this.input.once('pointerdown', empezar);
  }

  update(tiempo, delta) {
    const dt = delta / 1000;
    this.fondo.moverSuave(dt);
    this.motas.update(tiempo, dt, 0, 0);
  }
}
