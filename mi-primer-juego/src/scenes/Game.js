// =====================================================================
//  Game.js: la escena principal. Aquí vive Sylva, el bosque, los
//  recuerdos, la oscuridad y el hilo de la historia.
// =====================================================================

import { PANTALLA, MUNDO, FISICA, CAMARA, LUZ, RECUERDOS, RES, DEBUG } from '../config.js';
import { NIVEL } from '../data/level.js';
import { HISTORIA } from '../data/story.js';
import { Actions } from '../systems/Actions.js';
import { Sonido } from '../systems/Sonido.js';
import { Musica } from '../systems/Musica.js';
import { Fondo } from '../systems/Fondo.js';
import { Oscuridad } from '../systems/Oscuridad.js';
import { Motas } from '../systems/Motas.js';
import { grupoFijo, contrarrestarZoom } from '../systems/Pantalla.js';
import { crearPlataforma } from '../art/textures.js';

const PROFUNDIDAD = {
  decorado: 10,
  suelo: 11,
  puntoSeguro: 12,
  recuerdo: 14,
  indicador: 40,
  sylva: 20,
  sereno: 29,
  vineta: 36,
};

function suavizar(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function acercar(valor, meta, paso) {
  if (valor < meta) return Math.min(valor + paso, meta);
  return Math.max(valor - paso, meta);
}

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const { ancho, alto } = PANTALLA;

    // ----- estado del juego -----
    this.estado = {
      farol: false,
      botas: false,
      silbato: false,
      cuaderno: false,
      caja: false,
      mascota: false,
      mascotaConservada: false,
      piezas: 0,
      partes: [false, false, false],
    };
    this.regiones = NIVEL.regiones.map((r) => ({ ...r, estado: 'oscuro' }));
    this.puntoSeguro = NIVEL.puntosSeguros[0];
    this.congelada = true;          // Sylva no se mueve hasta que termina la introducción
    this.recogiendo = false;
    this.listoParaFinal = false;
    this.ultimoSuelo = -9999;
    this.ultimoSalto = -9999;
    this.cuadroCaminar = 0;
    this.miraDerecha = true;
    this.adelanto = 0;
    this.umbralAbierto = false;
    this.zoomMeta = PANTALLA.zoomCamara;
    this.tiempoMundo = 0;

    // ----- física y mundo -----
    this.physics.world.setBounds(0, 0, MUNDO.ancho, MUNDO.alto + 600);

    this.fondo = new Fondo(this);

    this.crearPlataformas();
    this.crearDecorados();
    this.crearPuntosSeguros();
    this.crearUmbral();
    this.crearRecuerdos();
    this.crearSylva();

    // ----- cámara -----
    // La cámara se mueve a mano (así las coordenadas siguen siendo las del diseño,
    // sin importar la calidad de imagen). Origen arriba a la izquierda.
    const cam = this.cameras.main;
    cam.setOrigin(0, 0);
    this.zoomActual = PANTALLA.zoomCamara;
    cam.setZoom(RES * this.zoomActual);
    this.camX = 0;
    this.camY = 0;
    this.actualizarCamara(0, true);

    // ----- ambiente -----
    this.oscuridad = new Oscuridad(this);
    this.motas = new Motas(this);
    this.tinteSereno = this.add
      .rectangle(ancho / 2, alto / 2, ancho * 3, alto * 3, LUZ.colorSereno)
      .setAlpha(0)
      .setBlendMode('ADD');
    grupoFijo(this, PROFUNDIDAD.sereno, [this.tinteSereno]);
    this.vineta = this.add.image(ancho / 2, alto / 2, 'vineta').setScale(1.2);
    grupoFijo(this, PROFUNDIDAD.vineta, [this.vineta]);

    // ----- sistemas -----
    this.actions = new Actions(this);
    this.sonido = new Sonido(this);
    this.musica = new Musica(this);
    this.musica.iniciar();

    this.promptE = this.add
      .text(0, 0, 'E', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: 'rgba(8,16,24,0.55)',
        padding: { x: 9, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(PROFUNDIDAD.indicador)
      .setVisible(false);

    if (DEBUG) this.physics.world.createDebugGraphic();

    // ----- interfaz y arranque -----
    this.events.once('ui-listo', () => this.empezar());
    this.scene.launch('UI', { juego: this });

    this.events.once('shutdown', () => {
      if (this.musica) this.musica.detener();
    });
  }

  empezar() {
    this.ui = this.scene.get('UI');
    this.ui.actualizarContador(this.estado);
    this.time.delayedCall(1300, () => {
      this.ui.mostrarDialogo(HISTORIA.introduccion.paginas, HISTORIA.introduccion.tono, () => {
        this.congelada = false;
      });
    });
  }

  // ====================================================================
  //  Construcción del mundo
  // ====================================================================

  crearPlataformas() {
    this.suelos = this.physics.add.staticGroup();
    for (const p of NIVEL.plataformas) {
      const clave = crearPlataforma(this, p.w, p.h, p.tipo, p.paleta);
      const img = this.suelos.create(p.x + p.w / 2, p.y + p.h / 2, clave).setDepth(PROFUNDIDAD.suelo);
      if (p.tipo === 'rama') {
        // Se puede atravesar desde abajo; solo sostiene desde arriba
        img.body.checkCollision.down = false;
        img.body.checkCollision.left = false;
        img.body.checkCollision.right = false;
      }
    }
  }

  crearDecorados() {
    // Flores de luz a lo largo del bosque claro
    let x = 200;
    let semilla = 7;
    const azar = () => {
      semilla = (semilla * 16807) % 2147483647;
      return semilla / 2147483647;
    };
    while (x < MUNDO.zonaOscuraDesde - 120) {
      const y = NIVEL.sueloEn(x) + 3;
      const flor = this.add.image(x, y, 'flor_luz').setOrigin(0.5, 1).setDepth(PROFUNDIDAD.decorado);
      this.tweens.add({
        targets: flor,
        alpha: 0.55,
        duration: 1400 + azar() * 1600,
        yoyo: true,
        repeat: -1,
        delay: azar() * 1500,
        ease: 'Sine.easeInOut',
      });
      x += 70 + azar() * 90;
    }
  }

  crearPuntosSeguros() {
    for (const p of NIVEL.puntosSeguros) {
      this.add.image(p.x, NIVEL.sueloEn(p.x) + 2, 'punto_seguro').setOrigin(0.5, 1).setDepth(PROFUNDIDAD.puntoSeguro).setAlpha(0.8);
    }
  }

  crearUmbral() {
    const u = NIVEL.umbral;
    this.barreras = this.physics.add.staticGroup();
    this.muroUmbral = this.add.zone(u.x, MUNDO.alto / 2, u.ancho, MUNDO.alto);
    this.physics.add.existing(this.muroUmbral, true);
    this.barreras.add(this.muroUmbral);

    // Niebla densa que se ve hasta que Sylva tenga luz
    this.nieblaUmbral = [];
    for (let i = 0; i < 4; i++) {
      const n = this.add
        .image(u.x - 10 + i * 6, 420 - i * 55, 'niebla')
        .setDisplaySize(190, 120)
        .setDepth(PROFUNDIDAD.recuerdo)
        .setAlpha(0.85);
      this.tweens.add({ targets: n, x: n.x + 18, alpha: 0.6, duration: 2200 + i * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.nieblaUmbral.push(n);
    }
  }

  crearRecuerdos() {
    this.recuerdos = [];
    for (const def of NIVEL.recuerdos) {
      const tipoBrillo = def.tipo === 'feliz' ? 'glow_dorado' : def.tipo === 'triste' ? 'glow_violeta' : 'glow_blanco';
      const oculto = def.disponibleDesde === 'caja';
      const glow = this.add.image(def.x, def.y, tipoBrillo).setDepth(PROFUNDIDAD.recuerdo).setBlendMode('ADD').setVisible(!oculto);
      const icono = this.add.image(def.x, def.y, `ic_${def.icono}`).setDepth(PROFUNDIDAD.recuerdo + 1).setVisible(!oculto);

      this.tweens.add({ targets: [glow, icono], y: def.y - 7, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: glow, scale: 1.25, alpha: 0.65, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

      this.recuerdos.push({ def, glow, icono, recogido: false });
    }
  }

  crearSylva() {
    this.jugadora = this.physics.add.sprite(NIVEL.inicio.x, NIVEL.inicio.y, 'sylva_quieta');
    this.jugadora.setDepth(PROFUNDIDAD.sylva);
    this.jugadora.setCollideWorldBounds(true);
    const cuerpo = this.jugadora.body;
    cuerpo.setGravityY(FISICA.gravedad);
    cuerpo.setSize(18, 40);
    cuerpo.setOffset(7, 8);
    cuerpo.setMaxVelocity(FISICA.velocidad * 2, FISICA.caidaMaxima);

    this.physics.add.collider(this.jugadora, this.suelos);
    this.physics.add.collider(this.jugadora, this.barreras);
  }

  // ====================================================================
  //  Ambiente: cuánta oscuridad / serenidad hay donde está Sylva
  // ====================================================================

  ambienteEn(x) {
    let oscuro = 0;
    let sereno = 0;
    const m = LUZ.mezclaBorde;
    for (const r of this.regiones) {
      const entra = suavizar((x - (r.x0 - m / 2)) / m);
      const sale = r.x1 >= MUNDO.ancho ? 0 : suavizar((x - (r.x1 - m / 2)) / m);
      const peso = entra * (1 - sale);
      if (r.estado === 'oscuro') oscuro = Math.max(oscuro, peso);
      else sereno = Math.max(sereno, peso);
    }
    return { oscuro, sereno };
  }

  // ====================================================================
  //  Cada cuadro
  // ====================================================================

  update(tiempo, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.tiempoMundo += dt;
    this.actions.update();

    const bloqueada = this.congelada || this.recogiendo || (this.ui && (this.ui.dialogoActivo || this.ui.eleccionActiva));

    this.moverSylva(tiempo, dt, bloqueada);
    this.vigilarCaida();
    this.actualizarPuntosSeguros();
    this.actualizarRecuerdos(bloqueada);
    this.actualizarPistas();
    this.vigilarUmbral();
    this.actualizarCamara(dt);
    this.actualizarAmbiente(tiempo, dt);
  }

  moverSylva(tiempo, dt, bloqueada) {
    const j = this.jugadora;
    const cuerpo = j.body;
    const a = this.actions;

    const enSuelo = cuerpo.blocked.down || cuerpo.touching.down;
    if (enSuelo) this.ultimoSuelo = tiempo;
    if (a.alPresionar.saltar) this.ultimoSalto = tiempo;

    // Movimiento horizontal con un poco de inercia
    let direccion = 0;
    if (!bloqueada) {
      if (a.presionada.izquierda) direccion -= 1;
      if (a.presionada.derecha) direccion += 1;
    }
    const meta = direccion * FISICA.velocidad;
    const paso = (direccion === 0 ? FISICA.friccion : FISICA.aceleracion) * dt;
    cuerpo.setVelocityX(acercar(cuerpo.velocity.x, meta, paso));

    if (direccion !== 0) this.miraDerecha = direccion > 0;
    j.setFlipX(!this.miraDerecha);

    // Salto (con "tiempo coyote" y salto recordado, para que se sienta justo)
    if (
      !bloqueada &&
      tiempo - this.ultimoSalto <= FISICA.tiempoBufferSalto &&
      tiempo - this.ultimoSuelo <= FISICA.tiempoCoyote
    ) {
      cuerpo.setVelocityY(this.estado.botas ? FISICA.saltoBotas : FISICA.saltoBase);
      this.ultimoSalto = -9999;
      this.ultimoSuelo = -9999;
    }
    // Soltar el botón en el aire acorta el salto
    if (a.alSoltar.saltar && cuerpo.velocity.y < 0) {
      cuerpo.setVelocityY(cuerpo.velocity.y * FISICA.cortarSalto);
    }

    // Dibujo: quieta, caminando o en el aire
    let textura;
    if (!enSuelo) {
      textura = 'sylva_salto';
    } else if (Math.abs(cuerpo.velocity.x) > 20) {
      this.cuadroCaminar += dt * 8;
      textura = ['sylva_paso1', 'sylva_quieta', 'sylva_paso2', 'sylva_quieta'][Math.floor(this.cuadroCaminar) % 4];
    } else {
      this.cuadroCaminar = 0;
      textura = 'sylva_quieta';
    }
    if (j.texture.key !== textura) j.setTexture(textura);
  }

  vigilarCaida() {
    const j = this.jugadora;
    if (j.y > MUNDO.alto + 100) {
      // Sin vidas: vuelve al último punto seguro
      j.setPosition(this.puntoSeguro.x, this.puntoSeguro.y);
      j.body.setVelocity(0, 0);
      this.sonido.regresar();
      this.tweens.add({ targets: j, alpha: 0.2, duration: 120, yoyo: true, repeat: 3, onComplete: () => j.setAlpha(1) });
    }
  }

  actualizarPuntosSeguros() {
    for (const p of NIVEL.puntosSeguros) {
      if (this.jugadora.x > p.x && p.x > this.puntoSeguro.x) this.puntoSeguro = p;
    }
  }

  // ====================================================================
  //  Recuerdos
  // ====================================================================

  actualizarRecuerdos(bloqueada) {
    let cercano = null;
    let mejor = RECUERDOS.radioInteraccion;
    for (const r of this.recuerdos) {
      if (r.recogido) continue;
      if (r.def.disponibleDesde === 'caja' && !this.estado.caja) continue;
      const d = Phaser.Math.Distance.Between(this.jugadora.x, this.jugadora.y, r.def.x, r.def.y);
      if (d < mejor) {
        mejor = d;
        cercano = r;
      }
    }

    if (cercano && !bloqueada) {
      this.promptE.setVisible(true).setPosition(cercano.def.x, cercano.def.y - 52);
      cercano.glow.setScale(1.45);
      if (this.actions.alPresionar.interactuar) this.recoger(cercano);
    } else {
      this.promptE.setVisible(false);
    }
  }

  recoger(r) {
    r.recogido = true;
    this.recogiendo = true;
    this.promptE.setVisible(false);
    this.jugadora.body.setVelocityX(0);
    this.zoomMeta = CAMARA.zoomRecuerdo;

    const def = r.def;
    if (def.tipo === 'feliz') this.sonido.recuerdoFeliz();
    else if (def.tipo === 'triste') this.sonido.recuerdoTriste();
    else this.sonido.fragmentoCaja(def.parte);

    // El objeto se disuelve en luz
    this.tweens.killTweensOf([r.glow, r.icono]);
    this.tweens.add({ targets: r.glow, scale: 2.6, alpha: 0, duration: 900, onComplete: () => r.glow.destroy() });
    this.tweens.add({ targets: r.icono, y: r.icono.y - 28, alpha: 0, duration: 900, onComplete: () => r.icono.destroy() });

    const texto = HISTORIA.recuerdos[def.id];
    this.ui.mostrarDialogo(texto.paginas, texto.tono, () => this.aplicarEfecto(def));
  }

  aplicarEfecto(def) {
    this.zoomMeta = PANTALLA.zoomCamara;
    this.recogiendo = false;
    const e = this.estado;

    switch (def.id) {
      case 'farol':
        e.farol = true;   // la niebla del umbral se abre cuando Sylva llegue con el farol
        this.brotar(def.x, NIVEL.sueloEn(def.x), 'flores');
        break;
      case 'botas':
        e.botas = true;
        this.brotar(def.x, NIVEL.sueloEn(def.x), 'arbol');
        break;
      case 'silbato':
        e.silbato = true;
        this.aparecerAves(def.x, def.y);
        break;
      case 'cuaderno':
        e.cuaderno = true;
        this.volverSerena(def.region);
        break;
      case 'mascota':
        e.mascota = true;
        this.ui.actualizarContador(e);
        this.ui.elegir(HISTORIA.recuerdos.mascota.eleccion.pregunta, HISTORIA.recuerdos.mascota.eleccion.opciones, (indice) => {
          e.mascotaConservada = indice === 0;
          if (e.mascotaConservada) {
            this.volverSerena('B');
            this.conservarRecuerdoMascota(def);
          }
          this.continuarDespuesDeMascota();
        });
        return;
      default:
        // piezas de la caja musical
        e.piezas++;
        e.partes[def.parte] = true;
        if (e.piezas === 3) this.armarCaja();
        break;
    }
    this.ui.actualizarContador(e);
  }

  aparecerAves(x, y) {
    this.avesRecuerdo = [];
    const rutas = [
      { inicioX: -260, inicioY: -40, finalX: -120, finalY: -125 },
      { inicioX: -170, inicioY: -125, finalX: 20, finalY: -55 },
      { inicioX: -70, inicioY: -65, finalX: 170, finalY: -145 },
      { inicioX: 45, inicioY: -145, finalX: 290, finalY: -75 },
      { inicioX: 150, inicioY: -55, finalX: 390, finalY: -175 },
      { inicioX: 250, inicioY: -175, finalX: 500, finalY: -105 },
    ];

    for (let i = 0; i < 6; i++) {
      const ruta = rutas[i];
      const ave = this.add.image(x + ruta.inicioX, y + ruta.inicioY, 'ave_recuerdo')
        .setDepth(PROFUNDIDAD.decorado)
        .setAlpha(0.9);
      this.avesRecuerdo.push(ave);

      this.tweens.add({
        targets: ave,
        x: x + ruta.finalX,
        y: y + ruta.finalY,
        duration: 3200 + i * 260,
        delay: i * 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  conservarRecuerdoMascota(def) {
    const luz = this.add.image(def.x, def.y, 'glow_violeta')
      .setDepth(PROFUNDIDAD.decorado)
      .setAlpha(0.28)
      .setScale(0.8);
    this.tweens.add({ targets: luz, alpha: 0.42, scale: 1.05, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  continuarDespuesDeMascota() {
    this.recogiendo = false;
    this.musica.pasarAFinal();
    this.time.delayedCall(700, () => {
      this.ui.mostrarDialogo(HISTORIA.descubrimiento.paginas, HISTORIA.descubrimiento.tono, () => {
        this.ui.elegir(HISTORIA.eleccion.pregunta, HISTORIA.eleccion.opciones, (indice) => this.terminar(indice));
      });
    });
  }

  // Con el farol, al acercarse al umbral la niebla se aparta por sí sola
  vigilarUmbral() {
    if (this.umbralAbierto || !this.estado.farol) return;
    if (this.jugadora.x < NIVEL.umbral.x - 110) return;
    this.abrirUmbral();
  }

  abrirUmbral() {
    this.umbralAbierto = true;
    this.nieblaUmbral.forEach((n, i) => {
      this.tweens.killTweensOf(n);
      const lado = i % 2 === 0 ? -1 : 1;     // unas nieblas van hacia atrás y otras hacia adelante
      this.tweens.add({
        targets: n,
        x: n.x + lado * (70 + i * 25),
        alpha: 0,
        scaleX: n.scaleX * 1.4,
        duration: 2000,
        delay: i * 120,
        ease: 'Sine.easeInOut',
        onComplete: () => n.destroy(),
      });
    });
    this.time.delayedCall(700, () => { this.muroUmbral.body.enable = false; });
  }

  volverSerena(idRegion) {
    const r = this.regiones.find((x) => x.id === idRegion);
    if (r) r.estado = 'sereno';
  }

  // Flores de luz o un arbolito que brotan donde estaba el recuerdo
  brotar(x, yPiso, tipo) {
    if (tipo === 'arbol') {
      const arbol = this.add.image(x + 50, yPiso + 3, 'arbolito').setOrigin(0.5, 1).setDepth(PROFUNDIDAD.decorado).setScale(0);
      this.tweens.add({ targets: arbol, scale: 1.2, duration: 1400, ease: 'Back.easeOut' });
      return;
    }
    for (let i = 0; i < 7; i++) {
      const flor = this.add.image(x + (i - 3) * 24, yPiso + 3, 'flor_luz').setOrigin(0.5, 1).setDepth(PROFUNDIDAD.decorado).setScale(0);
      this.tweens.add({ targets: flor, scale: 1.1, duration: 700, delay: i * 90, ease: 'Back.easeOut' });
    }
  }

  // ====================================================================
  //  Final: la caja musical, el descubrimiento y la elección
  // ====================================================================

  armarCaja() {
    this.recogiendo = true;
    this.estado.caja = true;
    this.zoomMeta = CAMARA.zoomRecuerdo;

    this.time.delayedCall(900, () => {
      const segundos = this.sonido.cajaCompleta();
      this.ui.actualizarContador(this.estado);

      this.time.delayedCall(segundos * 700, () => {
        this.ui.mostrarDialogo(HISTORIA.cajaArmada.paginas, HISTORIA.cajaArmada.tono, () => {
          this.zoomMeta = PANTALLA.zoomCamara;
          this.recogiendo = false;
          const mascota = this.recuerdos.find((r) => r.def.id === 'mascota');
          if (mascota) {
            mascota.glow.setVisible(true);
            mascota.icono.setVisible(true);
          }
        });
      });
    });
  }

  terminar(indice) {
    this.congelada = true;
    this.ui.fundido(1, 1600, () => {
      this.scene.stop('UI');
      this.scene.start('End', { final: indice, mascotaConservada: this.estado.mascotaConservada });
    });
  }

  // ====================================================================
  //  Pistas, cámara y ambiente
  // ====================================================================

  actualizarPistas() {
    const x = this.jugadora.x;
    let texto = null;
    for (const p of NIVEL.pistas) {
      if (x > p.x0 && x < p.x1 && p.mostrarSi(this.estado)) texto = HISTORIA.pistas[p.clave];
    }
    if (this.ui) this.ui.mostrarPista(this.ui.dialogoActivo ? null : texto);
  }

  actualizarCamara(dt, inmediata = false) {
    const cam = this.cameras.main;
    const { ancho, alto } = PANTALLA;

    // Mira un poco hacia donde camina
    const meta = this.miraDerecha ? CAMARA.adelanto : -CAMARA.adelanto;
    const velocidad = Math.abs(this.jugadora.body.velocity.x) > 20 ? 1 : 0.3;
    this.adelanto += (meta * velocidad - this.adelanto) * CAMARA.suavizadoAdelanto;

    // Zoom suave (se acerca al recoger un recuerdo)
    this.zoomActual += (this.zoomMeta - this.zoomActual) * CAMARA.velocidadZoom;
    const z = this.zoomActual;
    cam.setZoom(RES * z);
    contrarrestarZoom(this, z);

    // Seguir a Sylva sin salirse del mundo
    const visibleAncho = ancho / z;
    const visibleAlto = alto / z;
    const objetivoX = Math.max(0, Math.min(MUNDO.ancho - visibleAncho, this.jugadora.x + this.adelanto - visibleAncho / 2));
    const objetivoY = Math.max(0, Math.min(MUNDO.alto - visibleAlto, this.jugadora.y - visibleAlto / 2));
    const k = inmediata ? 1 : CAMARA.suavizado;
    this.camX += (objetivoX - this.camX) * k;
    this.camY += (objetivoY - this.camY) * k;

    // Se redondea al píxel real de la pantalla para que nada tiemble
    const pasos = RES * z;
    cam.scrollX = Math.round(this.camX * pasos) / pasos;
    cam.scrollY = Math.round(this.camY * pasos) / pasos;
  }

  actualizarAmbiente(tiempo, dt) {
    const cam = this.cameras.main;
    const { oscuro, sereno } = this.ambienteEn(this.jugadora.x);

    this.fondo.update(cam, Math.max(oscuro, sereno), dt);
    this.motas.update(tiempo, dt, oscuro, sereno);

    const radioMeta = this.estado.farol ? LUZ.radioConFarol : LUZ.radioSinFarol;
    this.oscuridad.update(this.jugadora.x, this.jugadora.y - 8, oscuro, radioMeta);

    this.tinteSereno.setAlpha(sereno * LUZ.opacidadSereno);

    // Música: claro afuera, oscuro y sereno adentro
    const claro = 1 - Math.max(oscuro, sereno * 0.7);
    this.musica.mezclar(claro, Math.max(oscuro, sereno * 0.6), dt);
  }
}
