// =====================================================================
//  Actions.js: el juego no lee teclas directamente, lee ACCIONES
//  (izquierda, derecha, saltar, interactuar). Hoy las activa el teclado;
//  los botones táctiles del celular solo tendrán que llamar a
//  setVirtual('izquierda', true/false) sin cambiar nada más.
// =====================================================================

export const ACCIONES = ['izquierda', 'derecha', 'saltar', 'interactuar'];

export class Actions {
  constructor(scene) {
    const K = Phaser.Input.Keyboard.KeyCodes;
    const kb = scene.input.keyboard;
    const teclas = (...codigos) => codigos.map((k) => kb.addKey(k));

    this.teclas = {
      izquierda: teclas(K.LEFT, K.A),
      derecha: teclas(K.RIGHT, K.D),
      saltar: teclas(K.SPACE, K.UP, K.W),
      interactuar: teclas(K.E, K.ENTER),
    };
    // Evita que el navegador desplace la página con las flechas y el espacio
    kb.addCapture([K.LEFT, K.RIGHT, K.UP, K.DOWN, K.SPACE]);

    this.virtual = {};
    this.activa = {};
    this.antes = {};
    this.presionada = {};   // true mientras se mantiene
    this.alPresionar = {};  // true solo en el cuadro en que se presiona
    this.alSoltar = {};     // true solo en el cuadro en que se suelta
    for (const a of ACCIONES) {
      this.virtual[a] = false;
      this.activa[a] = false;
      this.antes[a] = false;
      this.presionada[a] = false;
      this.alPresionar[a] = false;
      this.alSoltar[a] = false;
    }
  }

  // Para los botones táctiles (más adelante)
  setVirtual(accion, valor) {
    this.virtual[accion] = !!valor;
  }

  // Llamar una vez por cuadro, antes de leer las acciones
  update() {
    for (const a of ACCIONES) {
      const tecla = this.teclas[a].some((t) => t.isDown);
      const ahora = tecla || this.virtual[a];
      this.alPresionar[a] = ahora && !this.antes[a];
      this.alSoltar[a] = !ahora && this.antes[a];
      this.presionada[a] = ahora;
      this.antes[a] = ahora;
    }
  }

  // Descarta lo presionado (por ejemplo, al cambiar de escena)
  limpiar() {
    for (const a of ACCIONES) {
      this.alPresionar[a] = false;
      this.alSoltar[a] = false;
    }
  }
}
