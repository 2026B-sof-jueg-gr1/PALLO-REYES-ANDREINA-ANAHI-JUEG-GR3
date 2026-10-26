// =====================================================================
//  Boot.js: prepara todo antes de empezar. Dibuja las texturas por
//  código y carga la música si existe en assets/audio/.
// =====================================================================

import { PANTALLA, AUDIO, DIALOGO } from '../config.js';
import { generarTexturas } from '../art/textures.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.add
      .text(PANTALLA.ancho / 2, PANTALLA.alto / 2, 'Cargando…', {
        fontFamily: DIALOGO.fuente,
        fontSize: '22px',
        color: '#cfeee6',
      })
      .setOrigin(0.5);

    // Si un archivo de música no existe todavía, el juego sigue sin él
    this.load.on('loaderror', () => {});
    for (const [clave, archivo] of Object.entries(AUDIO.archivos)) {
      this.load.audio(clave, AUDIO.carpeta + archivo);
    }
  }

  create() {
    generarTexturas(this);
    this.scene.start('Menu');
  }
}
