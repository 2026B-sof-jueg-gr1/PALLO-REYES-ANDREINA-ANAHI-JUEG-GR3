// =====================================================================
//  main.js: punto de entrada. Crea el juego de Phaser 4 con las escenas.
//  El tamaño y la física se cambian en config.js.
// =====================================================================

import { PANTALLA, RES, DEBUG } from './config.js';
import { BootScene } from './scenes/Boot.js';
import { MenuScene } from './scenes/Menu.js';
import { GameScene } from './scenes/Game.js';
import { UIScene } from './scenes/UI.js';
import { EndScene } from './scenes/End.js';

const config = {
  type: Phaser.AUTO,
  parent: 'juego',
  width: PANTALLA.ancho * RES,    // el lienzo real es RES veces más grande (más nítido)
  height: PANTALLA.alto * RES,
  backgroundColor: '#070d12',
  scale: {
    mode: Phaser.Scale.FIT,                 // se ajusta a cualquier pantalla (computadora o celular)
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: DEBUG },   // la gravedad de Sylva se define en config.js
  },
  input: { activePointers: 3 },             // varios dedos a la vez (para los botones táctiles)
  scene: [BootScene, MenuScene, GameScene, UIScene, EndScene],
};

// Todos los textos se dibujan con la resolución del juego, para que se lean nítidos.
const crearTexto = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, texto, estilo) {
  return crearTexto.call(this, x, y, texto, { ...estilo, resolution: RES });
};

new Phaser.Game(config);
