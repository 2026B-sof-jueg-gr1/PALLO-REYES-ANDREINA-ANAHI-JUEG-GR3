// =====================================================================
//  textures.js: todo el arte del juego se dibuja aquí, por código
//  (Canvas 2D), sin descargar imágenes. Así no hay licencias, pesa casi
//  nada y los colores salen de config.js (PALETA).
//
//  Más adelante se puede cambiar cualquier textura por una imagen real:
//  basta cargar la imagen en Boot con la misma clave.
// =====================================================================

import { PALETA, PANTALLA, SYLVA, RES } from '../config.js';

// ---------- utilidades ----------

// Dibuja a RES veces el tamaño lógico (más nitidez). El código de dibujo
// sigue usando las medidas normales: el lienzo ya viene escalado.
// res = 1 para texturas suaves (niebla, brillos) que no ganan nada con más píxeles.
function lienzo(w, h, res = RES) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * res);
  c.height = Math.round(h * res);
  const ctx = c.getContext('2d');
  ctx.scale(res, res);
  c.getContext = () => ctx;
  c._lw = w;
  c._lh = h;
  c._res = res;
  return c;
}

// Generador de números aleatorios con semilla (siempre dibuja lo mismo)
function aleatorio(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rgba(hex, a = 1) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function registrar(scene, clave, c) {
  if (scene.textures.exists(clave)) scene.textures.remove(clave);
  const tex = scene.textures.addCanvas(clave, c);
  // La textura mide c.width px pero en el juego "mide" su tamaño lógico:
  // así todo (posiciones, colisiones, escalas) sigue igual con cualquier calidad.
  if (c._res !== 1) {
    tex.source[0].resolution = c._res;
    for (const f of Object.values(tex.frames)) {
      f.data.sourceSize.w = c._lw;   // realWidth/realHeight salen de aquí
      f.data.sourceSize.h = c._lh;
    }
  }
}

function rectRedondeado(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function brillo(ctx, x, y, r, color, alfa) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, alfa));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- cielo ----------

function dibujarCielo(scene, clave, paleta, conRayos) {
  const { ancho, alto } = PANTALLA;
  const c = lienzo(ancho, alto);
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, alto);
  paleta.cielo.forEach(([p, col]) => g.addColorStop(p, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ancho, alto);

  const r = aleatorio(conRayos ? 11 : 12);
  ctx.globalCompositeOperation = 'lighter';
  if (conRayos) {
    // rayos de luz que bajan en diagonal entre las hojas
    for (let i = 0; i < 5; i++) {
      const x = 80 + i * 170 + r() * 40;
      const gr = ctx.createLinearGradient(x, 0, x - 200, alto);
      gr.addColorStop(0, 'rgba(255,243,190,0.34)');
      gr.addColorStop(1, 'rgba(255,243,190,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 70 + r() * 40, 0);
      ctx.lineTo(x - 170, alto);
      ctx.lineTo(x - 310, alto);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    // estrellitas apagadas
    for (let i = 0; i < 70; i++) {
      const x = r() * ancho;
      const y = r() * alto * 0.6;
      ctx.fillStyle = `rgba(200,200,255,${0.15 + r() * 0.35})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.5 + r() * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  registrar(scene, clave, c);
}

// ---------- capas de árboles (parallax) ----------

function dibujarCapa(scene, clave, ancho, alto, o) {
  const c = lienzo(ancho, alto);
  const ctx = c.getContext('2d');
  const r = aleatorio(o.semilla);
  const paso = ancho / o.cantidad;

  // Primero se decide cómo es cada árbol, para dibujarlo igual en las copias
  // de los lados (así la capa se repite sin cortes).
  const arboles = [];
  for (let i = 0; i < o.cantidad; i++) {
    const blobs = [];
    for (let j = 0; j < 7; j++) {
      blobs.push({ dx: (r() - 0.5) * 1.5, dy: (r() - 0.35) * 1.0, r: 0.5 + r() * 0.35 });
    }
    arboles.push({
      x: i * paso + paso * (0.15 + 0.7 * r()),
      alto: o.altoMin + (o.altoMax - o.altoMin) * r(),
      ancho: o.tronco * (0.7 + 0.6 * r()),
      copa: o.copa * (0.8 + 0.5 * r()),
      blobs,
    });
  }

  for (const a of arboles) {
    for (const dx of [-ancho, 0, ancho]) {
      const x = a.x + dx;
      const yCopa = o.base - a.alto;
      ctx.fillStyle = o.col.tronco;
      ctx.beginPath();
      ctx.moveTo(x - a.ancho * 0.7, o.base);
      ctx.lineTo(x - a.ancho * 0.35, yCopa + a.copa * 0.5);
      ctx.lineTo(x + a.ancho * 0.35, yCopa + a.copa * 0.5);
      ctx.lineTo(x + a.ancho * 0.7, o.base);
      ctx.closePath();
      ctx.fill();

      const g = ctx.createLinearGradient(0, yCopa - a.copa, 0, yCopa + a.copa);
      g.addColorStop(0, o.col.copaArriba);
      g.addColorStop(1, o.col.copaAbajo);
      ctx.fillStyle = g;
      for (const b of a.blobs) {
        ctx.beginPath();
        ctx.arc(x + b.dx * a.copa, yCopa + b.dy * a.copa, b.r * a.copa, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Luces suaves flotando entre los árboles
  if (o.luces) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < o.luces.cantidad; i++) {
      brillo(ctx, r() * ancho, r() * (o.base - 80), 3 + r() * 8, o.luces.color, 0.35);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // Niebla en la base y relleno hacia abajo
  const alturaNiebla = o.niebla || 160;
  const gf = ctx.createLinearGradient(0, o.base - alturaNiebla, 0, o.base + 4);
  gf.addColorStop(0, rgba(o.col.niebla, 0));
  gf.addColorStop(1, rgba(o.col.niebla, 0.75));
  ctx.fillStyle = gf;
  ctx.fillRect(0, o.base - alturaNiebla, ancho, alturaNiebla + 4);
  ctx.fillStyle = o.col.copaAbajo;
  ctx.fillRect(0, o.base, ancho, alto - o.base);

  registrar(scene, clave, c);
}

function dibujarCapas(scene, paleta, nombre, conLuces) {
  const W = 1024;
  const H = 560;
  const base = 470;
  const luzColor = nombre === 'claro' ? '#ffe9a0' : '#b8b0ff';
  const defs = [
    { k: 'far',  semilla: 21, cantidad: 10, altoMin: 190, altoMax: 290, tronco: 14, copa: 62, col: paleta.lejos, niebla: 200 },
    { k: 'mid',  semilla: 22, cantidad: 6,  altoMin: 250, altoMax: 330, tronco: 20, copa: 74, col: paleta.medio, niebla: 170, luces: conLuces && { cantidad: 16, color: luzColor } },
    // Cerca: troncos altos cuyas copas quedan casi fuera de la pantalla, para no tapar el cielo
    { k: 'near', semilla: 23, cantidad: 4,  altoMin: 470, altoMax: 560, tronco: 30, copa: 90, col: paleta.cerca, niebla: 120, luces: conLuces && { cantidad: 12, color: luzColor } },
  ];
  for (const d of defs) {
    dibujarCapa(scene, `capa_${nombre}_${d.k}`, W, H, { ...d, base });
  }
}

// ---------- niebla, viñeta, oscuridad, brillos ----------

function dibujarNiebla(scene) {
  const W = 1024;
  const H = 220;
  const c = lienzo(W, H, 1);
  const ctx = c.getContext('2d');
  const r = aleatorio(31);
  for (let i = 0; i < 16; i++) {
    const x = r() * W;
    const y = 60 + r() * 120;
    const rad = 70 + r() * 110;
    for (const dx of [-W, 0, W]) {
      const g = ctx.createRadialGradient(x + dx, y, 0, x + dx, y, rad);
      g.addColorStop(0, 'rgba(255,255,255,0.20)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x + dx - rad, y - rad, rad * 2, rad * 2);
    }
  }
  registrar(scene, 'niebla', c);
}

function dibujarVineta(scene) {
  const { ancho, alto } = PANTALLA;
  const c = lienzo(ancho, alto, 1);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(ancho / 2, alto / 2, alto * 0.35, ancho / 2, alto / 2, ancho * 0.62);
  g.addColorStop(0, 'rgba(2,12,18,0)');
  g.addColorStop(1, 'rgba(2,12,18,0.5)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ancho, alto);
  registrar(scene, 'vineta', c);
}

// Círculo de visión: transparente en el centro, oscuro hacia afuera.
// El radio exterior mide 256 px; Oscuridad.js lo escala al radio que haga falta.
function dibujarOscuridad(scene) {
  const c = lienzo(1024, 1024, 1);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(512, 512, 0, 512, 512, 256);
  g.addColorStop(0, 'rgba(5,4,15,0)');
  g.addColorStop(0.38, 'rgba(5,4,15,0)');
  g.addColorStop(1, 'rgba(5,4,15,1)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 1024);
  registrar(scene, 'oscuridad', c);
}

function dibujarBrillos(scene) {
  const defs = {
    glow_dorado: ['#ffe9a0', '#ffc860'],
    glow_violeta: ['#d8d0ff', '#7a68e8'],
    glow_blanco: ['#ffffff', '#bfeee6'],
  };
  for (const [clave, [centro, borde]] of Object.entries(defs)) {
    const c = lienzo(96, 96, 1);
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
    g.addColorStop(0, rgba(centro, 0.95));
    g.addColorStop(0.35, rgba(borde, 0.45));
    g.addColorStop(1, rgba(borde, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 96, 96);
    registrar(scene, clave, c);
  }
  for (const [clave, color] of [['mota_dorada', '#ffe9a0'], ['mota_violeta', '#b9b0ff']]) {
    const c = lienzo(16, 16, 1);
    brillo(c.getContext('2d'), 8, 8, 8, color, 1);
    registrar(scene, clave, c);
  }
}

// ---------- iconos de los recuerdos ----------

function dibujarIconos(scene) {
  const crema = '#fffbe9';
  const borde = 'rgba(20,20,40,0.55)';
  const hacer = (clave, fn) => {
    const c = lienzo(32, 32);
    const ctx = c.getContext('2d');
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = borde;
    fn(ctx);
    registrar(scene, clave, c);
  };

  hacer('ic_farol', (ctx) => {
    ctx.strokeStyle = crema;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(16, 7, 4, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = borde;
    ctx.lineWidth = 1.5;
    ctx.fillStyle = crema;
    ctx.fillRect(9, 10, 14, 15);
    ctx.strokeRect(9, 10, 14, 15);
    ctx.fillStyle = '#ffc860';
    ctx.fillRect(12, 13, 8, 9);
    ctx.fillStyle = crema;
    ctx.fillRect(8, 25, 16, 3);
  });

  hacer('ic_botas', (ctx) => {
    ctx.fillStyle = crema;
    ctx.beginPath();
    ctx.moveTo(11, 5);
    ctx.lineTo(19, 5);
    ctx.lineTo(19, 17);
    ctx.lineTo(26, 21);
    ctx.lineTo(26, 27);
    ctx.lineTo(9, 27);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7a6a58';
    ctx.fillRect(9, 24, 17, 3);
  });

  hacer('ic_cuaderno', (ctx) => {
    ctx.fillStyle = crema;
    rectRedondeado(ctx, 8, 5, 17, 22, 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#8f86d4';
    ctx.lineWidth = 1.3;
    for (const y of [11, 15, 19, 23]) {
      ctx.beginPath();
      ctx.moveTo(12, y);
      ctx.lineTo(21, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#8f86d4';
    ctx.fillRect(8, 5, 3, 22);
  });

  hacer('ic_pieza', (ctx) => {
    // pieza de rompecabezas: cuadrado con dos pestañas (arriba y derecha) y una muesca a la izquierda
    ctx.fillStyle = crema;
    ctx.beginPath();
    ctx.rect(8, 11, 15, 15);
    ctx.moveTo(18.5, 11);
    ctx.arc(15.5, 9, 3.5, 0, Math.PI * 2);
    ctx.moveTo(26.5, 18.5);
    ctx.arc(23, 18.5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(8, 18.5, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#8f86d4';
    ctx.beginPath();
    ctx.arc(16, 19, 1.6, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ---------- brotes de luz, puntos seguros, puntos del contador ----------

function dibujarDecorados(scene) {
  // Flor de luz
  {
    const c = lienzo(24, 36);
    const ctx = c.getContext('2d');
    ctx.strokeStyle = '#3f9e78';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 36);
    ctx.quadraticCurveTo(10, 26, 12, 16);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    brillo(ctx, 12, 13, 11, '#ffd36b', 0.6);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#fff3c4';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(12 + Math.cos(a) * 4, 13 + Math.sin(a) * 4, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffb347';
    ctx.beginPath();
    ctx.arc(12, 13, 2.2, 0, Math.PI * 2);
    ctx.fill();
    registrar(scene, 'flor_luz', c);
  }

  // Arbolito que brota
  {
    const c = lienzo(56, 72);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#5a4533';
    ctx.beginPath();
    ctx.moveTo(24, 72);
    ctx.lineTo(27, 34);
    ctx.lineTo(31, 34);
    ctx.lineTo(34, 72);
    ctx.closePath();
    ctx.fill();
    const g = ctx.createLinearGradient(0, 4, 0, 44);
    g.addColorStop(0, '#6fd6a4');
    g.addColorStop(1, '#2c8872');
    ctx.fillStyle = g;
    for (const [x, y, rr] of [[28, 22, 17], [17, 31, 13], [40, 31, 13], [28, 38, 12]]) {
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y] of [[22, 20], [34, 26], [18, 33], [38, 34], [28, 14]]) {
      brillo(ctx, x, y, 5, '#ffe9a0', 0.8);
    }
    registrar(scene, 'arbolito', c);
  }

  // Punto seguro: piedra con luz tenue
  {
    const c = lienzo(32, 44);
    const ctx = c.getContext('2d');
    ctx.globalCompositeOperation = 'lighter';
    brillo(ctx, 16, 14, 15, '#7fe8da', 0.55);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#3d5a66';
    rectRedondeado(ctx, 8, 18, 16, 26, 7);
    ctx.fill();
    ctx.fillStyle = '#8defe0';
    ctx.beginPath();
    ctx.arc(16, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    registrar(scene, 'punto_seguro', c);
  }

  // Puntos del contador
  for (const [clave, color, relleno] of [
    ['punto_dorado', '#ffd36b', true],
    ['punto_violeta', '#9a8cf0', true],
    ['punto_vacio', '#8a9aa6', false],
  ]) {
    const c = lienzo(16, 16);
    const ctx = c.getContext('2d');
    if (relleno) {
      brillo(ctx, 8, 8, 8, color, 0.5);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(8, 8, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(8, 8, 4.2, 0, Math.PI * 2);
      ctx.stroke();
    }
    registrar(scene, clave, c);
  }
}

// ---------- Sylva (pixel art de 16x24) ----------

const COLORES_SYLVA = {
  h: '#2f6b4f', // capucha oscura
  H: '#78c795', // capucha clara
  k: '#f2d3b3', // piel
  e: '#2a2a3a', // ojo
  p: '#f3e6b8', // pelo claro
  c: '#55b088', // capa
  C: '#2a6a4e', // capa oscura (contorno)
  t: '#bff6ee', // borde turquesa claro
  b: '#5a4636', // botas
  g: '#f5d36b', // destello dorado
};

const CABEZA_Y_CAPA = [
  '....hhhhhh......',
  '...hHHHHHHhh....',
  '..hHHHHHHHHHh...',
  '..hHHHppppHHh...',
  '..hHHppkkkkHh...',
  '..hHHpkkkekkh...',
  '..hHHpkkkkkkh...',
  '..hHHHkkkkkh....',
  '...hhHHttHhh....',
  '....hCCttCCh....',
  '...hCccccccCh...',
  '...CcccttcccC...',
  '..CccccttccccC..',
  '..CccccttccccC..',
  '..CcccccccccccC.',
  '..CcccccccccccC.',
  '..CcccgcccccccC.',
  '.CccccccccccccC.',
  '.CCcccccccccccCC',
  '.CCCCCCCCCCCCCC.',
];

const PIERNAS = {
  quieta: [
    '.....bb..bb.....',
    '.....bb..bb.....',
    '....bbb..bbb....',
    '....bbb..bbb....',
  ],
  paso1: [
    '....bb....bb....',
    '...bb......bb...',
    '..bbb.......bbb.',
    '..bbb.......bbb.',
  ],
  paso2: [
    '.....bbbb.......',
    '.....bbbb.......',
    '.....bbbb.......',
    '....bbbbb.......',
  ],
  salto: [
    '....bb....bb....',
    '....bbb..bb.....',
    '................',
    '................',
  ],
};

function dibujarSylva(scene) {
  const px = SYLVA.escalaPixel;
  for (const [nombre, piernas] of Object.entries(PIERNAS)) {
    const filas = CABEZA_Y_CAPA.concat(piernas);
    const c = lienzo(16 * px, 24 * px);
    const ctx = c.getContext('2d');
    filas.forEach((fila, y) => {
      for (let x = 0; x < fila.length; x++) {
        const ch = fila[x];
        if (ch === '.') continue;
        ctx.fillStyle = COLORES_SYLVA[ch];
        ctx.fillRect(x * px, y * px, px, px);
      }
    });
    registrar(scene, `sylva_${nombre}`, c);
    // Sin suavizado, para que el pixel art se vea nítido al hacer zoom
    scene.textures.get(`sylva_${nombre}`).setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}

// ---------- plataformas (se crean según el tamaño que pida el nivel) ----------

export function crearPlataforma(scene, w, h, tipo, paleta) {
  const clave = `plat_${tipo}_${paleta}_${w}x${h}`;
  if (scene.textures.exists(clave)) return clave;
  const p = PALETA[paleta];
  const c = lienzo(w, h);
  const ctx = c.getContext('2d');
  const r = aleatorio(w * 7 + h);

  if (tipo === 'suelo') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, p.suelo.cesped);
    g.addColorStop(Math.min(0.9, 14 / h), p.suelo.tierra);
    g.addColorStop(1, p.suelo.profundo);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // piedras y raíces oscuras
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let i = 0; i < w / 45; i++) {
      ctx.beginPath();
      ctx.ellipse(r() * w, 24 + r() * (h - 30), 6 + r() * 16, 3 + r() * 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // césped en la orilla de arriba
    for (let x = 0; x < w; x += 5) {
      const alto = 3 + r() * 6;
      ctx.fillStyle = r() > 0.5 ? p.suelo.cesped : p.suelo.brillo;
      ctx.beginPath();
      ctx.moveTo(x, 9);
      ctx.lineTo(x + 2.5, 9 - alto);
      ctx.lineTo(x + 5, 9);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = rgbaSeguro(p.suelo.brillo, 0.55);
    ctx.fillRect(0, 8, w, 2);
    // chispitas de luz
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < w / 40; i++) {
      brillo(ctx, r() * w, 10 + r() * Math.min(60, h - 12), 2 + r() * 3, p.suelo.chispa, 0.5);
    }
    ctx.globalCompositeOperation = 'source-over';
  } else {
    // rama: tronco redondeado con musgo encima
    ctx.fillStyle = p.rama.madera;
    rectRedondeado(ctx, 0, 4, w, h - 4, (h - 4) / 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(6, h - 7, w - 12, 3);
    ctx.fillStyle = p.rama.musgo;
    rectRedondeado(ctx, 2, 0, w - 4, 8, 4);
    ctx.fill();
    for (let x = 8; x < w - 8; x += 11 + r() * 8) {
      ctx.fillRect(x, 6, 3, 5 + r() * 6);
    }
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < w / 40; i++) {
      brillo(ctx, 8 + r() * (w - 16), 4, 3, p.suelo.chispa, 0.5);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  registrar(scene, clave, c);
  return clave;
}

function rgbaSeguro(hex, a) {
  return rgba(hex, a);
}

// ---------- punto de entrada ----------

export function generarTexturas(scene) {
  dibujarCielo(scene, 'cielo_claro', PALETA.claro, true);
  dibujarCielo(scene, 'cielo_oscuro', PALETA.oscuro, false);
  dibujarCapas(scene, PALETA.claro, 'claro', true);
  dibujarCapas(scene, PALETA.oscuro, 'oscuro', true);
  dibujarNiebla(scene);
  dibujarVineta(scene);
  dibujarOscuridad(scene);
  dibujarBrillos(scene);
  dibujarIconos(scene);
  dibujarDecorados(scene);
  dibujarSylva(scene);
}
