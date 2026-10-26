// =====================================================================
//  End.js: el final. Muestra lo que Sylva decidió, los créditos y deja
//  volver al inicio.
// =====================================================================

import { PANTALLA, DIALOGO, AUDIO, LUZ } from '../config.js';
import { HISTORIA } from '../data/story.js';
import { Fondo } from '../systems/Fondo.js';
import { Motas } from '../systems/Motas.js';
import { camaraFija } from '../systems/Pantalla.js';
import { Musica } from '../systems/Musica.js';

export class EndScene extends Phaser.Scene {
  constructor() {
    super('End');
  }

  init(datos) {
    this.final = datos && typeof datos.final === 'number' ? datos.final : 0;
  }

  create() {
    const { ancho, alto } = PANTALLA;
    camaraFija(this);
    const opcion = HISTORIA.eleccion.opciones[this.final];
    this.volviendo = false;

    // Cuidar todo: luz y penumbra juntas. Dejar ir: un bosque más claro.
    this.fondo = new Fondo(this, { estatico: true });
    this.fondo.mezcla(this.final === 0 ? 0.55 : 0);
    this.motas = new Motas(this, 36);
    this.add
      .rectangle(ancho / 2, alto / 2, ancho, alto, LUZ.colorSereno)
      .setDepth(29)
      .setAlpha(this.final === 0 ? 0.14 : 0.04)
      .setBlendMode('ADD');
    this.add.image(ancho / 2, alto / 2, 'vineta').setDepth(36).setScale(1.2);

    const estilo = (tamano, color, extra = {}) => ({
      fontFamily: DIALOGO.fuente,
      fontSize: `${tamano}px`,
      color,
      align: 'center',
      wordWrap: { width: 640 },
      ...extra,
    });

    const caja = this.add.rectangle(ancho / 2, 150, 700, 190, 0x0b1620, 0.6).setDepth(38);
    caja.setStrokeStyle(2, 0xbfe9e0, 0.7);
    this.add.text(ancho / 2, 90, opcion.texto, estilo(21, '#f4f1e6', { lineSpacing: 6 })).setOrigin(0.5, 0).setDepth(40);
    this.add.text(ancho / 2, 182, opcion.resultado, estilo(18, '#cfeee6', { fontStyle: 'italic' })).setOrigin(0.5, 0).setDepth(40);

    this.add.text(ancho / 2, 276, HISTORIA.fin, estilo(30, '#ffffff')).setOrigin(0.5).setDepth(40);
    this.add
      .text(ancho / 2, 318, AUDIO.creditos.concat('Hecho con Phaser 4').join('\n'), estilo(13, '#d8efe8', { lineSpacing: 3 }))
      .setOrigin(0.5, 0)
      .setDepth(40);

    const volver = this.add
      .text(ancho / 2, alto - 14, HISTORIA.reiniciar, estilo(14, '#ffffff'))
      .setOrigin(0.5, 1)
      .setDepth(40)
      .setAlpha(0);

    this.cameras.main.fadeIn(1600, 0, 0, 0);

    // Música final (si existe la pista)
    this.musica = new Musica(this);
    this.musica.pasarAFinal();
    this.musica.iniciar();
    this.events.once('shutdown', () => this.musica && this.musica.detener());

    this.time.delayedCall(2800, () => {
      this.tweens.add({ targets: volver, alpha: 0.9, duration: 800 });
      const ir = () => {
        if (this.volviendo) return;
        this.volviendo = true;
        this.scene.start('Menu');
      };
      this.input.keyboard.once('keydown', ir);
      this.input.once('pointerdown', ir);
    });
  }

  update(tiempo, delta) {
    const dt = delta / 1000;
    this.fondo.moverSuave(dt);
    this.motas.update(tiempo, dt, 0, this.final === 0 ? 0.6 : 0);
    this.musica.mezclar(0, 0, dt);
  }
}
