# Sylva (ISWD823)

Juego narrativo de exploración en Phaser 4. Sylva despierta en un bosque sin saber quién es y recoge
recuerdos que no son suyos. No hay villano ni vidas: el conflicto es el olvido.

## Cómo probarlo

1. Abre la carpeta con VS Code y usa la extensión **Live Server** (clic derecho en `index.html`,
   *Open with Live Server*). No lo abras con doble clic: los módulos de JavaScript necesitan un servidor.
2. Hace falta internet, porque Phaser 4.2.1 se descarga del CDN.

Controles: flechas o A / D para moverse, espacio para saltar, E para recoger y avanzar el texto
(también sirve tocar la pantalla para avanzar el texto).

## Calidad de imagen

El juego se dibuja con el doble de píxeles en computadora (nítido) y con el tamaño normal en celular o
equipos modestos (gasta menos batería y memoria). Se elige solo, pero se puede forzar añadiendo
`?calidad=alta` o `?calidad=normal` al final de la dirección. La física, el mapa y los controles son
idénticos en ambas. El valor automático se calcula en `RES`, dentro de `src/config.js`.

## Cómo se ve el proyecto

```
index.html          carga Phaser (CDN) y src/main.js
src/
  config.js         TODOS los valores ajustables (tamaño de pantalla, física, cámara, luz, audio, colores)
  main.js           crea el juego
  data/
    story.js        todos los textos de la historia
    level.js        el mapa: plataformas, recuerdos, puntos seguros, zonas
  scenes/           Boot, Menu, Game, UI, End
  systems/          Actions (controles), Sonido, Musica, Fondo, Oscuridad, Motas, Pantalla (calidad de imagen)
  art/textures.js   todo el arte, dibujado por código
assets/audio/       aquí van los mp3 de la música (ver abajo)
```

Para cambiar el tamaño de la pantalla, la velocidad, la altura del salto o la oscuridad, edita
`src/config.js`. Para cambiar la historia, `src/data/story.js`. Para mover un recuerdo o una plataforma,
`src/data/level.js`.

## Música (pendiente de subir)

El juego funciona sin música. Cuando la tengas, conviértela a **mp3** (pesa mucho menos que wav) y guárdala en
`assets/audio/` con estos nombres exactos (GitHub distingue mayúsculas):

| Archivo | Pista (OpenGameArt, CC0) | Dónde suena |
| --- | --- | --- |
| `another-august.mp3` | Another August (cynicmusic) | Bosque claro |
| `sirens-in-darkness.mp3` | Sirens in Darkness (cynicmusic) | Bosque oscuro y sereno |
| `first-light-particles.mp3` | First Light Particles (Yoiyami) | Final |
| `forest-ambience.mp3` | Forest Ambience (TinyWorlds) | Ambiente de fondo |

Los efectos (campanitas y la caja musical) se generan por código y no necesitan archivos.
Los créditos de la música aparecen en la pantalla final (editables en `AUDIO.creditos` de `config.js`).

## GitHub Pages

Sube todo a la carpeta `mi-primer-juego/` del repo (`git add .`, `git commit`, `git push`) y activa
Settings, Pages, rama `main`, carpeta `/ (root)`. La dirección termina en `/mi-primer-juego/`.
El archivo `game.js` de la prueba inicial ya no se usa y se puede borrar.

## Pendiente para próximas entregas

- Botones táctiles para celular (los controles ya están separados en acciones: `src/systems/Actions.js`).
- Reemplazar el pixel art de Sylva por una hoja de sprites con más animaciones, si se quiere.
