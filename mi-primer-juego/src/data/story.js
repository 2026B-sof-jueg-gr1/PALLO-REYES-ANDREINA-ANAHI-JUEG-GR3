// =====================================================================
//  story.js: todos los textos del juego. Para cambiar la historia,
//  edita solo este archivo. Cada elemento de "paginas" es una caja de
//  diálogo; usa \n para saltos de línea.
//  tono: 'feliz' (dorado), 'triste' (violeta) o 'neutro' (verde agua)
// =====================================================================

export const HISTORIA = {
  titulo: 'Sylva',
  subtitulo: 'un bosque que recuerda',

  introduccion: {
    tono: 'neutro',
    paginas: [
      'Despierto entre árboles. La luz llega despacio, como si no quisiera molestar.\n' +
      'No sé quién soy. Pero este lugar me resulta conocido.\n' +
      'Algo me dice que debo caminar.',
    ],
  },

  recuerdos: {
    farol: {
      tono: 'feliz',
      paginas: [
        'Alguien me ponía esto en las manos cuando se hacía tarde.\n' +
        '"Para que siempre encuentres el camino a casa", decía.\n' +
        'Su voz era suave y olía a pan. Nunca la vi bien. Siempre estaba detrás de la luz.',
      ],
    },
    botas: {
      tono: 'feliz',
      paginas: [
        'Corría por este sendero todos los días, aunque nadie me lo pedía.\n' +
        'Sentía que si iba lo bastante rápido, el bosque entero se movía conmigo.\n' +
        'Un día dejé de venir. No recuerdo por qué.',
      ],
    },
    silbato: {
      tono: 'feliz',
      paginas: [
        'Un silbato de madera, pequeño y gastado.\n' +
        'Un niño lo usaba para convertir el bosque en un reino.',
        'Miraba las aves entre las ramas y les inventaba nombres.\n' +
        'Cuando los pájaros silbaban, él respondía con una sonrisa.',
        'Después reía, tranquilo, porque por un momento todo el bosque\n' +
        'parecía jugar con él.',
      ],
    },
    cuaderno: {
      tono: 'triste',
      paginas: [
        'Hojas llenas de árboles dibujados, uno por uno, todos distintos.\n' +
        'Alguien quiso guardar este lugar antes de irse.\n' +
        'La última página está en blanco.',
      ],
    },
    pieza1: {
      tono: 'triste',
      paginas: ['Una nota. Después otra. Conozco esta melodía, pero me duele escucharla.'],
    },
    pieza2: {
      tono: 'triste',
      paginas: ['Alguien la tarareaba en voz baja cuando creía que nadie lo oía.'],
    },
    pieza3: {
      tono: 'triste',
      paginas: ['La última vez que sonó, alguien se estaba despidiendo.'],
    },
    mascota: {
      tono: 'triste',
      paginas: [
        'Una pelota de juguete, cubierta de tierra y hojas.\n' +
        'Todavía conserva las marcas de unos dientes pequeños.',
        'Alguien corría detrás de ella entre los árboles.\n' +
        'Era feliz. Yo también lo era cuando lo veía volver.',
        'No recuerdo su nombre, pero recuerdo sus patas sobre la tierra\n' +
        'y la alegría con la que esperaba que lanzara la pelota.',
      ],
      eleccion: {
        pregunta: '¿Quieres conservar este recuerdo?',
        opciones: [
          {
            etiqueta: 'Conservarlo',
            texto: 'No quiero olvidarlo.\nConservaré este recuerdo y la alegría que dejó aquí.',
            resultado: 'La pelota queda bajo una luz tenue, como una pequeña señal de que todavía es recordado.',
          },
          {
            etiqueta: 'Dejarlo ir',
            texto: 'Puede descansar entre los árboles.\nLo dejo ir con cariño.',
            resultado: 'La pelota desaparece entre las hojas y el bosque vuelve a quedar en silencio.',
          },
        ],
      },
    },
  },

  // Partes del nombre que revela cada pieza de la caja musical
  nombrePartes: ['SY', 'L', 'VA'],

  cajaArmada: {
    tono: 'triste',
    paginas: [
      'SY-L-VA.',
      'Sylva. Así me llamaba el bosque cuando ya no quedaba nadie para decirlo.',
    ],
  },

  descubrimiento: {
    tono: 'neutro',
    paginas: [
      'Los recuerdos no son míos.\n' +
      'Son de todos los que me caminaron, y yo los guardé.\n' +
      'El bosque respira cuando yo respiro.',
    ],
  },

  // La elección final
  eleccion: {
    pregunta: '¿Qué hago con lo que guardo?',
    opciones: [
      {
        etiqueta: 'Cuidar todo',
        texto:
          'Voy a guardar todo, lo luminoso y lo que duele.\n' +
          'Un bosque que recuerda solo lo bonito no es un bosque, es un decorado.',
        resultado: 'El bosque queda con luz y penumbra, juntas.',
      },
      {
        etiqueta: 'Dejar ir lo que pesa',
        texto:
          'Hay recuerdos que ya cumplieron su trabajo.\n' +
          'Los dejo ir con cariño, para que el bosque pueda seguir creciendo.',
        resultado: 'El bosque queda más claro, pero con huecos.',
      },
    ],
  },

  pistas: {
    cima: 'Es demasiado alto para saltarlo así. Quizá algo en este sendero me ayude.',
    umbral: 'Está demasiado oscuro para avanzar sin luz.',
  },

  controles: 'Moverse: flechas o A / D  ·  Saltar: espacio  ·  Interactuar: E',
  iniciar: 'Presiona una tecla o toca la pantalla',
  fin: 'Gracias por jugar',
  reiniciar: 'Presiona una tecla o toca la pantalla para volver al inicio',
};
