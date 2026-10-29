// =====================================================================
//  level.js: el mapa del primer avance (plataformas, recuerdos, puntos
//  seguros y zonas). Todas las posiciones están en píxeles del mundo.
//
//  Medidas útiles (con la física de config.js):
//   - Salto base:  ~84 px de alto y ~180 px de largo.
//   - Con botas:   ~175 px de alto.
//   - La cima de la zona 1 mide 140 px: solo se sube con las botas.
// =====================================================================

export const NIVEL = {
  inicio: { x: 150, y: 540 },

  // tipo 'suelo' (sólido) o 'rama' (se puede atravesar desde abajo)
  plataformas: [
    // Zona 1: bosque claro
    { x: 0,    y: 620, w: 1500, h: 100, tipo: 'suelo', paleta: 'claro' },
    { x: 1500, y: 480, w: 900,  h: 240, tipo: 'suelo', paleta: 'claro' },   // la cima
    { x: 780,  y: 550, w: 150,  h: 18,  tipo: 'rama',  paleta: 'claro' },
    { x: 1780, y: 405, w: 140,  h: 18,  tipo: 'rama',  paleta: 'claro' },

    // Zona 2: bosque oscuro
    { x: 2400, y: 480, w: 1100, h: 240, tipo: 'suelo', paleta: 'oscuro' },
    // (hueco de 150 px entre 3500 y 3650: si cae, vuelve al último punto seguro)
    { x: 3650, y: 480, w: 1150, h: 240, tipo: 'suelo', paleta: 'oscuro' },
    { x: 2700, y: 415, w: 150,  h: 18,  tipo: 'rama',  paleta: 'oscuro' },
    { x: 3150, y: 405, w: 130,  h: 18,  tipo: 'rama',  paleta: 'oscuro' },
    { x: 4090, y: 330, w: 150,  h: 18,  tipo: 'rama',  paleta: 'oscuro' },   // alta: pieza 2 (necesita botas)
    { x: 4480, y: 420, w: 150,  h: 18,  tipo: 'rama',  paleta: 'oscuro' },   // pieza 3
  ],

  // Altura del suelo según la posición (para decorar y hacer brotar plantas)
  sueloEn(x) {
    return x < 1500 ? 620 : 480;
  },

  puntosSeguros: [
    { x: 120,  y: 540 },
    { x: 1380, y: 540 },
    { x: 1700, y: 400 },
    { x: 2480, y: 400 },
    { x: 3380, y: 400 },
    { x: 3720, y: 400 },
  ],

  // Zonas oscuras. Cada una se vuelve "serena" al aceptar su recuerdo triste.
  regiones: [
    { id: 'A', x0: 2400, x1: 3500, memoria: 'cuaderno' },
    { id: 'B', x0: 3500, x1: 4800, memoria: 'caja' },
  ],

  // tipo: 'feliz' | 'triste' | 'pieza'
  recuerdos: [
    { id: 'farol',    x: 560,  y: 560, tipo: 'feliz',  icono: 'farol',    habilidad: 'luz' },
    { id: 'botas',    x: 1260, y: 560, tipo: 'feliz',  icono: 'botas',    habilidad: 'salto' },
    { id: 'silbato',  x: 940,  y: 500, tipo: 'feliz',  icono: 'silbato' },
    { id: 'cuaderno', x: 3020, y: 420, tipo: 'triste', icono: 'cuaderno', region: 'A' },
    { id: 'pieza1',   x: 3820, y: 420, tipo: 'pieza',  icono: 'pieza',    parte: 0 },
    { id: 'pieza2',   x: 4165, y: 270, tipo: 'pieza',  icono: 'pieza',    parte: 1 },
    { id: 'pieza3',   x: 4555, y: 360, tipo: 'pieza',  icono: 'pieza',    parte: 2 },
    { id: 'mascota',  x: 4700, y: 420, tipo: 'triste', icono: 'pelota', disponibleDesde: 'caja' },
  ],

  // Muro invisible de niebla: se abre cuando Sylva tiene el farol
  umbral: { x: 2380, ancho: 24 },

  // Mensajes cortos cuando Sylva se detiene frente a un obstáculo
  pistas: [
    { x0: 1330, x1: 1495, clave: 'cima',   mostrarSi: (e) => !e.botas },
    { x0: 2200, x1: 2375, clave: 'umbral', mostrarSi: (e) => !e.farol },
  ],
};
