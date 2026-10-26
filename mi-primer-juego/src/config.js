// =====================================================================
//  config.js: TODOS los valores que podrías querer cambiar están aquí.
//  Cambia un número y recarga la página; no hace falta tocar nada más.
// =====================================================================

// ---- Pantalla -------------------------------------------------------
export const PANTALLA = {
  ancho: 800,          // tamaño base del juego (16:9). Cámbialo aquí si hace falta.
  alto: 450,
  zoomCamara: 1.1,     // 1 = normal; más alto = bosque más íntimo (no bajar de 1)
};

// ---- Calidad de imagen ----------------------------------------------
// El juego siempre piensa en 800x450 (posiciones, física, todo). La calidad solo
// decide con cuántos píxeles reales se dibuja: 2 = nítido (computadora),
// 1 = normal (celular o equipo modesto, gasta menos batería y memoria).
// Para probar: añade ?calidad=alta o ?calidad=normal al final de la dirección.
function elegirResolucion() {
  const nivel = { alta: 2, normal: 1 };
  try {
    const pedido = new URLSearchParams(window.location.search).get('calidad');
    if (pedido && nivel[pedido]) return nivel[pedido];
    const tactil = navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches;
    const modesto = (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    if (tactil || modesto) return 1;
  } catch (e) { /* sin navegador: calidad normal */ }
  return 2;
}
export const RES = elegirResolucion();

// ---- Mundo ----------------------------------------------------------
export const MUNDO = {
  ancho: 4800,         // 6 pantallas de ancho: 3 de bosque claro y 3 de bosque oscuro
  alto: 720,
  zonaOscuraDesde: 2400,   // dónde empieza el bosque oscuro
};

// ---- Movimiento de Sylva -------------------------------------------
export const FISICA = {
  gravedad: 1100,
  velocidad: 230,          // velocidad al caminar (px/s)
  aceleracion: 1800,
  friccion: 2200,
  saltoBase: -430,         // alcanza ~84 px de altura
  saltoBotas: -620,        // con las botas alcanza ~175 px
  cortarSalto: 1,          // 1 = el salto siempre es completo; 0.5 = si sueltas el botón en el aire, el salto se acorta
  tiempoCoyote: 110,       // ms para poder saltar justo después de salir de un borde
  tiempoBufferSalto: 110,  // ms que se recuerda un salto presionado un poco antes
  caidaMaxima: 900,
};

// ---- Cámara ---------------------------------------------------------
export const CAMARA = {
  suavizado: 0.08,         // 0 a 1: más bajo = cámara más lenta y tranquila
  adelanto: 70,            // cuánto mira hacia donde camina (px)
  suavizadoAdelanto: 0.04,
  zoomRecuerdo: 1.28,      // zoom al recoger un recuerdo
  velocidadZoom: 0.05,
};

// ---- Luz y oscuridad ------------------------------------------------
export const LUZ = {
  radioSinFarol: 110,      // visibilidad en la oscuridad sin el farol (px)
  radioConFarol: 240,      // visibilidad con el farol
  opacidadMaxima: 0.94,    // qué tan oscura es la oscuridad (1 = negro total)
  suavizado: 0.06,
  mezclaBorde: 160,        // ancho de la transición entre zonas (px)
  colorOscuridad: 0x05040f,
  colorSereno: 0x6a5fc0,   // tinte azul violeta de las zonas serenas
  opacidadSereno: 0.2,
};

// ---- Recuerdos ------------------------------------------------------
export const RECUERDOS = {
  radioInteraccion: 72,    // qué tan cerca hay que estar para recoger
};

// ---- Diálogos -------------------------------------------------------
export const DIALOGO = {
  msPorLetra: 24,
  fuente: 'Georgia, "Times New Roman", serif',
  tamano: 21,
};

// ---- Audio ----------------------------------------------------------
// Pon los archivos mp3 en assets/audio/ con estos nombres exactos
// (en GitHub Pages las mayúsculas importan). Si un archivo no existe,
// el juego simplemente funciona sin esa pista.
export const AUDIO = {
  carpeta: 'assets/audio/',
  archivos: {
    mus_claro: 'another-august.mp3',
    mus_oscuro: 'sirens-in-darkness.mp3',
    mus_final: 'first-light-particles.mp3',
    amb_bosque: 'forest-ambience.mp3',
  },
  volumen: { mus_claro: 0.55, mus_oscuro: 0.55, mus_final: 0.6, amb_bosque: 0.25 },
  efectos: 0.9,            // volumen general de los sonidos generados por código
  creditos: [
    'Another August y Sirens in Darkness: cynicmusic (CC0)',
    'First Light Particles: Yoiyami (CC0)',
    'Forest Ambience: TinyWorlds (CC0)',
  ],
};

// ---- Melodía de la caja musical (La menor, lenta) ------------------
// Cada pieza toca un fragmento; al juntar las tres suena completa.
export const CAJA_MUSICAL = {
  //        Mi5     Do5     Si4     La4     Sol#4   La4     Si4     Do5     Mi5
  notas: [659.25, 523.25, 493.88, 440.0, 415.3, 440.0, 493.88, 523.25, 659.25],
  fragmentos: [[0, 3], [3, 6], [6, 9]],
  separacion: 0.62,        // segundos entre notas
  separacionFinal: 0.8,
};

// ---- Colores --------------------------------------------------------
export const PALETA = {
  claro: {
    cielo: [[0, '#12384a'], [0.5, '#2c7a82'], [0.85, '#9fcf9c'], [1, '#e9d98e']],
    lejos: { copaArriba: '#4aa6a0', copaAbajo: '#3a8f8c', tronco: '#357f80', niebla: '#bfe8d0' },
    medio: { copaArriba: '#2c8872', copaAbajo: '#1f6b5f', tronco: '#1c5a58', niebla: '#8fd6b8' },
    cerca: { copaArriba: '#15564a', copaAbajo: '#0d3e3e', tronco: '#0b2f33', niebla: '#5fb89c' },
    suelo: { brillo: '#a6efc0', cesped: '#4fb88a', tierra: '#235347', profundo: '#0e2c30', chispa: '#ffe9a0' },
    rama: { madera: '#5a4533', musgo: '#62cfa0' },
  },
  oscuro: {
    cielo: [[0, '#070a1f'], [0.55, '#171447'], [1, '#3a2b6e']],
    lejos: { copaArriba: '#33337a', copaAbajo: '#2a2a68', tronco: '#26265c', niebla: '#6a62b8' },
    medio: { copaArriba: '#242258', copaAbajo: '#1a1948', tronco: '#171642', niebla: '#4a42a0' },
    cerca: { copaArriba: '#12113a', copaAbajo: '#0b0b2a', tronco: '#09091f', niebla: '#2e2a78' },
    suelo: { brillo: '#8d86e0', cesped: '#5b53b0', tierra: '#272357', profundo: '#0a0a26', chispa: '#b8b0ff' },
    rama: { madera: '#2e2748', musgo: '#7c74d0' },
  },
};

// ---- Sylva (pixel art dibujado por código) -------------------------
export const SYLVA = {
  escalaPixel: 2,          // cada "pixel" del dibujo mide 2x2 pantallas px
  cuerpo: { ancho: 18, alto: 40, desplazamientoX: 7, desplazamientoY: 8 },
};

// ---- Depuración -----------------------------------------------------
export const DEBUG = false;  // true muestra las cajas de colisión
