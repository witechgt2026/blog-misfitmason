# Awiwins Marble Race 3D 🏁

Carrera 3D de marbles en circuito cerrado, manejada por tu **chat de Kick**.
Los viewers escriben la **palabra clave** (click en el banner central para cambiarla,
por defecto `!race`) para entrar y `!boost` para un acelerón único.
Patrocinado por Yukineta 🟢 y el casino CoinsGame 🪙 (`coins.game` — click en
cualquier valla de CoinsGame la abre).

## Guía rápida para el streamer

1. En el panel izquierdo, escribe tu **canal de Kick** (el slug de `kick.com/<slug>`,
   p. ej. `xqc`) y pulsa **Conectar** (botón junto al campo). Sin login ni bots:
   lee el chat público cada ~4s.
2. Los viewers escriben la **palabra clave** en el chat → reciben un marble.
   Durante la carrera pueden escribir **!boost** (1 solo uso) para acelerar.
3. Elige **pista** (Clásico / Volcán 8), **vehículo** (⚪ Marbles / 🏎️ Karts
   con cara de avatar) y **vueltas** (1/2/3), y pulsa **🏁 Empezar carrera**.
4. Gana quien complete las vueltas primero. **Volver al lobby** para la siguiente.
5. Para OBS: añade el generador como fuente de **Navegador**.

Extras: botón **Chat demo** (simula viewers y boosts), **bots** de relleno,
4 cámaras (general / perseguir líder / libre / **cenital** para capturas,
con retorno automático a general),
banner central clicable para cambiar la palabra clave,
y tarjeta pre-carrera que anuncia el comando `!boost` + animación 🏁 ¡YA! 🏁.

## Las pistas

- **Clásico**: pradera, 6 de parrilla, curva estrecha, salto y géiseres.
- **Volcán 8**: suelo volcánico, vuelta de 1050u (unos 2 minutos a 2 vueltas),
  8 de parrilla, **figura en 8 con un solo cruce a distinto nivel** (paso elevado +
  paso inferior), **subidas y bajadas de montaña empinadas** (las cuestas frenan
  y aceleran de verdad), **curvas cerradas**, **carriles que se bifurcan
  y se re-juntan**, **olla de lava**: tramo circular estrecho sobre un lago de
  lava donde es fácil caer (respawn largo), **cinta movediza** corta con empuje
  suave (se puede pasar), **portal secreto** que teletransporta a los 3 últimos
  junto a los líderes a mitad de subida, y muelles de potencia aleatoria.
  Corre por defecto a **2 vueltas**: una carrera loca y divertida.
- Para crear un circuito nuevo, añade un objeto en `src/tracks.js` y aparece solo
  en el selector (forma, zonas con `s` = distancia 0..loop, obstáculos y tema).
  Formas soportadas: bucles `"polar"` y figuras en 8 `"eight"`
  (paso elevado en s=loop/4, paso inferior en 3*loop/4).

Ambas pistas comparten:

- **Monumentos**: palabra gigante **YUKINETA en 3D** (letras blancas y verdes
  que rotan despacio) y **logo CoinsGame gigante en 3D** (pila de monedas
  hexagonales doradas + cartel luminoso), en medio del campo — el Clásico tiene
  la palabra y el logo en el interior, el Volcán uno en cada lóbulo del 8.
  Los árboles los respetan.
- **Meta** presidida por la pancarta Yukineta; su banderín en el cañón.
- Vallas con el logo grande (se leen aunque falle la imagen); las de CoinsGame
  abren `coins.game` al hacer click.
- Obstáculos que **sí golpean**: barras giratorias, **fichas orbitales de
  CoinsGame**, **géiseres de fuego** por temporizador (zona con luz roja), rampa
  de **salto**, pads de turbo con flechas cian inconfundibles, y **cañón** que cada
  5-9 s impulsa 🚀 a un marble al azar hacia adelante.
- **Bordes abiertos**: fuera de la bifurcación te puedes **caer de la pista**
  (respawn unos metros atrás; en lava, más atrás + mensaje 🔥).
- Los chocados, quemados, caídos y blasteados salen en el chat en vivo.
- Asfalto estilo autódromo (pianos rojo/blanco, líneas).
- **Clima aleatorio** (`src/weather.js`: día / soleado / atardecer / noche /
  neblina / lluvia / nieve, cambia solo cada ~50-80 s; la lluvia/niebla **reduce
  el agarre** lateral).
- Al terminar: **cohetes realistas** (`src/fireworks.js`: un cometa que sube desde
  el suelo y estalla en peonía / anillo / sauce / estroboscopio cambiando de
  color; 1 de cada 3 sale cerca del ganador para que salga en plano),
  **holograma gigante Yukineta × CoinsGame** sobre la meta y cámara que
  **orbita al ganador**.

## Notas técnicas

- App en `index.html` (Three.js por CDN esm.sh) + módulos `src/tracks.js`
  (circuitos), `src/weather.js` (clima), `src/fireworks.js` (pirotecnia).
  Texturas en `src/img/` (incluye `yukineta-logo.png`, `coinsgame-logo.png`,
  `coinsgame-coin.png`).
- Física arcade propia: avance + resorte lateral (multiplicado por
  `weather.grip`), efecto de cuestas, rebotes en muros y entre marbles, saltos
  y choques con cooldown por marble; estelas de boost y destellos de impacto.
- Karts: chasis + 4 ruedas + cara (avatar DiceBear `adventurer` por nombre,
  inicial como respaldo).
- En carrera la UI se limpia sola (paneles ocultos, solo tabla + ticker de chat
  con leyenda arriba); botón ⚙️ para forzar la UI.
- Debug: `window.marbleRace` (`state`, `marbles`, `addMarble`, `startRace`,
  `resetToLobby`, `useBoost`, `debug()` con `fwAlive`, `showHolo(v)`,
  `topView()` para la vista cenital).
- Kick: `GET /api/v2/channels/<slug>` resuelve el id, luego polling a
  `GET /api/v2/channels/<id>/messages` cada 4 s, con `super-fetch-plugin`
  como respaldo si hay CORS. Se ignoran emotes `[emote:...]` al buscar comandos.
