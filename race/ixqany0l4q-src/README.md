# Kick Marble Race 3D 🏁

Carrera 3D de marbles en circuito cerrado, manejada por tu **chat de Kick**.
Los viewers escriben `!race` para entrar y `!boost` para un acelerón único.
Patrocinado por MisfitMason 🐰 y Roobet 🪙.

## Guía rápida para el streamer

1. En el panel izquierdo, escribe tu **canal de Kick** (el slug de `kick.com/<slug>`,
   p. ej. `xqc`) y pulsa **Conectar**. Sin login ni bots: lee el chat público cada ~4s.
2. Los viewers escriben **!race** en el chat → reciben un marble.
   Durante la carrera pueden escribir **!boost** (1 solo uso) para acelerar.
3. Elige las **vueltas** (1/2/3) y pulsa **🏁 Empezar carrera**.
4. Gana quien complete las vueltas primero. **Volver al lobby** para la siguiente.
5. Para OBS: añade el generador como fuente de **Navegador**.

Extras: botón **Chat demo** (simula viewers y boosts), **bots** de relleno,
casilla de entradas abiertas, 3 cámaras (general / perseguir / libre).

## El circuito

- **Circuito en bucle** con vallas de MisfitMason y Roobet por todo el trazado.
- **Meta** presidida por el conejo MisfitMason; banderín suyo en el cañón.
- Obstáculos que **sí golpean**: barras giratorias, **fichas orbitales de Roobet**,
  **géiseres de fuego** por temporizador (zona con luz roja), rampa de **salto**,
  pads de turbo y una curva estrecha (embudo).
- **Cascada** decorativa junto a la salida y **cañón** que cada 5-9 s
  impulsa 🚀 a un marble al azar.
- Los chocados, quemados y blasteados salen en el chat en vivo.
- Asfalto estilo autodromo (pianos rojo/blanco, líneas) y vallas con texto grande.
- Al terminar: **pirotecnia** y **holograma gigante MisfitMason × Roobet** en el cielo.

## Notas técnicas

- Todo en `index.html` (Three.js por CDN). Texturas en `src/img/`.
- Física arcade propia: avance + resorte lateral + rebotes en muros y entre
  marbles, saltos y choques con cooldown por marble.
- Kick: `GET /api/v2/channels/<slug>` resuelve el id, luego polling a
  `GET /api/v2/channels/<id>/messages` cada 4 s, con `super-fetch-plugin`
  como respaldo si hay CORS. Se ignoran emotes `[emote:...]` al buscar comandos.
