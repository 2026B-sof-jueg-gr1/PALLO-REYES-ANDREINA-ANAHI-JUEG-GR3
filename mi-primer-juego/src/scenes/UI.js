// =====================================================================
//  UI.js: todo lo que va fijo sobre la pantalla: contador, cuadros de
//  diálogo, la elección final, mensajes cortos y el fundido a negro.
//  Está en su propia escena para que el zoom de la cámara del juego
//  no la mueva ni la agrande.
//
//  Zona segura para celular: los textos importantes van arriba o al
//  centro; las esquinas de abajo quedan libres para los botones.
// =====================================================================

import { PANTALLA, DIALOGO } from '../config.js';
import { HISTORIA } from '../data/story.js';
import { camaraFija } from '../systems/Pantalla.js';

const TONOS = { feliz: 0xf3d17a, triste: 0x9a8cf0, neutro: 0xbfe9e0 };
const TOTAL_FELICES = 3;
const TOTAL_TRISTES = 3;

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  init(datos) {
    this.juego = datos.juego;
  }

  create() {
    const { ancho, alto } = PANTALLA;
    camaraFija(this);
    this.dialogoActivo = false;
    this.eleccionActiva = false;
    this.toque = false;
    this.pistaMeta = 0;

    this.crearContador();
    this.crearDialogo();

    // Pista corta (por ejemplo, "Es demasiado alto...")
    this.textoPista = this.add
      .text(ancho / 2, alto - 70, '', {
        fontFamily: DIALOGO.fuente,
        fontSize: '18px',
        color: '#e8f4ef',
        backgroundColor: 'rgba(8,16,24,0.55)',
        padding: { x: 12, y: 6 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(20);

    // Controles: se ven un rato al empezar
    this.textoControles = this.add
      .text(ancho / 2, alto - 14, HISTORIA.controles, {
        fontFamily: DIALOGO.fuente,
        fontSize: '15px',
        color: '#d8efe8',
      })
      .setOrigin(0.5, 1)
      .setAlpha(0.85)
      .setDepth(20);
    this.tweens.add({ targets: this.textoControles, alpha: 0, delay: 9000, duration: 1500 });

    // Fundido a negro
    this.velo = this.add.rectangle(ancho / 2, alto / 2, ancho + 4, alto + 4, 0x000000).setAlpha(1).setDepth(100);
    this.fundido(0, 1200);

    this.input.on('pointerdown', () => {
      this.toque = true;
    });

    this.juego.events.emit('ui-listo');
  }

  // ---------- contador ----------

  crearContador() {
    const { ancho } = PANTALLA;
    const estiloEtiqueta = { fontFamily: DIALOGO.fuente, fontSize: '15px', color: '#e8f4ef' };
    const fila = (y, etiqueta, total, claveActiva) => {
      const puntos = [];
      for (let i = 0; i < total; i++) {
        const x = ancho - 18 - (total - 1 - i) * 20;
        puntos.push(this.add.image(x, y, 'punto_vacio').setDepth(20));
      }
      this.add
        .text(ancho - 18 - total * 20 - 4, y, etiqueta, estiloEtiqueta)
        .setOrigin(1, 0.5)
        .setDepth(20);
      return { puntos, claveActiva };
    };
    this.filaBrillo = fila(20, 'Brillo', TOTAL_FELICES, 'punto_dorado');
    this.filaPenumbra = fila(42, 'Penumbra', TOTAL_TRISTES, 'punto_violeta');

    this.textoNombre = this.add
      .text(ancho - 18, 66, '', { fontFamily: DIALOGO.fuente, fontSize: '16px', color: '#cfc8ff' })
      .setOrigin(1, 0.5)
      .setAlpha(0)
      .setDepth(20);
  }

  actualizarContador(e) {
    const felices = (e.farol ? 1 : 0) + (e.botas ? 1 : 0) + (e.silbato ? 1 : 0);
    const tristes = (e.cuaderno ? 1 : 0) + (e.caja ? 1 : 0) + (e.mascota ? 1 : 0);
    const pintar = (fila, cuantos) => {
      fila.puntos.forEach((p, i) => p.setTexture(i < cuantos ? fila.claveActiva : 'punto_vacio'));
    };
    pintar(this.filaBrillo, felices);
    pintar(this.filaPenumbra, tristes);

    if (e.caja) {
      this.textoNombre.setText('Sylva');
    } else {
      const partes = HISTORIA.nombrePartes.map((p, i) => (e.partes[i] ? p : '?'));
      this.textoNombre.setText(partes.join(' · '));
    }
    if (e.piezas > 0) this.textoNombre.setAlpha(1);
  }

  // ---------- diálogo ----------

  crearDialogo() {
    this.caja = this.add.graphics().setDepth(40).setVisible(false);
    this.textoDialogo = this.add
      .text(0, 0, '', {
        fontFamily: DIALOGO.fuente,
        fontSize: `${DIALOGO.tamano}px`,
        color: '#f4f1e6',
        wordWrap: { width: 676 },
        lineSpacing: 6,
      })
      .setDepth(41)
      .setVisible(false);

    const tactil = !!(this.sys.game.device && this.sys.game.device.input && this.sys.game.device.input.touch);
    this.indicador = this.add
      .text(0, 0, tactil ? 'toca' : 'E', { fontFamily: DIALOGO.fuente, fontSize: '14px', color: '#cfeee6' })
      .setOrigin(1, 1)
      .setDepth(41)
      .setVisible(false);
    this.tweens.add({ targets: this.indicador, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });
  }

  mostrarDialogo(paginas, tono, alTerminar) {
    this.dialogoActivo = true;
    this.paginas = paginas;
    this.indice = 0;
    this.colorTono = TONOS[tono] || TONOS.neutro;
    this.alTerminar = alTerminar;
    this.abiertoEn = this.time.now;
    this.mostrarPagina();
  }

  mostrarPagina() {
    const texto = this.paginas[this.indice];
    this.textoActual = texto;

    // Se mide el texto completo para dibujar la caja del tamaño justo
    this.textoDialogo.setText(texto);
    const alto = Math.ceil(this.textoDialogo.height) + 36;
    const x = 40;
    const y = 16;
    const w = 720;

    this.caja.clear();
    this.caja.fillStyle(0x0b1620, 0.86);
    this.caja.fillRoundedRect(x, y, w, alto, 14);
    this.caja.lineStyle(2, this.colorTono, 0.9);
    this.caja.strokeRoundedRect(x, y, w, alto, 14);
    this.caja.setVisible(true);

    this.textoDialogo.setPosition(x + 22, y + 18).setVisible(true);
    this.indicador.setPosition(x + w - 14, y + alto - 8).setVisible(false);

    // Máquina de escribir
    this.textoDialogo.setText('');
    this.letras = 0;
    this.escribiendo = true;
    if (this.evento) this.evento.remove(false);
    this.evento = this.time.addEvent({
      delay: DIALOGO.msPorLetra,
      loop: true,
      callback: () => {
        this.letras++;
        this.textoDialogo.setText(texto.slice(0, this.letras));
        if (this.letras >= texto.length) this.terminarEscritura();
      },
    });
  }

  terminarEscritura() {
    if (this.evento) this.evento.remove(false);
    this.evento = null;
    this.escribiendo = false;
    this.textoDialogo.setText(this.textoActual);
    this.indicador.setVisible(true);
  }

  avanzar() {
    if (this.escribiendo) {
      this.terminarEscritura();
      return;
    }
    this.juego.sonido.avanzar();
    this.indice++;
    if (this.indice >= this.paginas.length) {
      this.cerrarDialogo();
    } else {
      this.mostrarPagina();
    }
  }

  cerrarDialogo() {
    this.dialogoActivo = false;
    this.caja.setVisible(false);
    this.textoDialogo.setVisible(false);
    this.indicador.setVisible(false);
    const cb = this.alTerminar;
    this.alTerminar = null;
    if (cb) cb();
  }

  // ---------- elección final ----------

  elegir(pregunta, opciones, alElegir) {
    const { ancho, alto } = PANTALLA;
    this.eleccionActiva = true;
    this.opciones = opciones;
    this.seleccion = 0;
    this.alElegir = alElegir;
    this.eleccionAbiertaEn = this.time.now;

    this.eleccionObjetos = [];
    const objetos = this.eleccionObjetos;

    objetos.push(
      this.add
        .text(ancho / 2, 120, pregunta, {
          fontFamily: DIALOGO.fuente,
          fontSize: '26px',
          color: '#f4f1e6',
        })
        .setOrigin(0.5)
        .setDepth(41),
    );

    this.cajasOpcion = this.add.graphics().setDepth(40);
    objetos.push(this.cajasOpcion);

    const w = 290;
    const h = 84;
    this.rectOpcion = [
      { x: ancho / 2 - 20 - w, y: alto / 2 - 10, w, h },
      { x: ancho / 2 + 20, y: alto / 2 - 10, w, h },
    ];
    opciones.forEach((op, i) => {
      const r = this.rectOpcion[i];
      objetos.push(
        this.add
          .text(r.x + w / 2, r.y + h / 2, op.etiqueta, {
            fontFamily: DIALOGO.fuente,
            fontSize: '22px',
            color: '#f4f1e6',
            align: 'center',
            wordWrap: { width: w - 24 },
          })
          .setOrigin(0.5)
          .setDepth(41),
      );
      const zona = this.add.zone(r.x, r.y, w, h).setOrigin(0).setInteractive().setDepth(42);
      zona.on('pointerdown', () => {
        this.seleccion = i;
        this.confirmarEleccion();
      });
      objetos.push(zona);
    });
    this.dibujarOpciones();
  }

  dibujarOpciones() {
    const g = this.cajasOpcion;
    g.clear();
    this.rectOpcion.forEach((r, i) => {
      const activa = i === this.seleccion;
      g.fillStyle(0x0b1620, activa ? 0.92 : 0.7);
      g.fillRoundedRect(r.x, r.y, r.w, r.h, 14);
      g.lineStyle(activa ? 3 : 1.5, activa ? 0xf3d17a : 0x8aa3ad, activa ? 1 : 0.7);
      g.strokeRoundedRect(r.x, r.y, r.w, r.h, 14);
    });
  }

  confirmarEleccion() {
    if (!this.eleccionActiva) return;
    this.eleccionActiva = false;
    this.eleccionObjetos.forEach((o) => o.destroy());
    this.eleccionObjetos = [];
    const cb = this.alElegir;
    this.alElegir = null;
    if (cb) cb(this.seleccion);
  }

  // ---------- pistas y fundido ----------

  mostrarPista(texto) {
    if (texto) this.textoPista.setText(texto);
    this.pistaMeta = texto ? 1 : 0;
  }

  fundido(alfa, duracion, alTerminar) {
    this.tweens.add({
      targets: this.velo,
      alpha: alfa,
      duration: duracion,
      onComplete: () => {
        if (alTerminar) alTerminar();
      },
    });
  }

  // ---------- cada cuadro ----------

  update() {
    const a = this.juego.actions;

    if (this.eleccionActiva) {
      if (this.time.now - this.eleccionAbiertaEn > 300) {
        if (a.alPresionar.izquierda) {
          this.seleccion = 0;
          this.dibujarOpciones();
        } else if (a.alPresionar.derecha) {
          this.seleccion = 1;
          this.dibujarOpciones();
        } else if (a.alPresionar.interactuar) {
          this.confirmarEleccion();
        }
      }
    } else if (this.dialogoActivo && this.time.now - this.abiertoEn > 180) {
      if (a.alPresionar.interactuar || this.toque) this.avanzar();
    }
    this.toque = false;

    const alfa = this.textoPista.alpha;
    this.textoPista.setAlpha(alfa + (this.pistaMeta - alfa) * 0.12);
  }
}
