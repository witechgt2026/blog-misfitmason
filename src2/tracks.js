// Circuitos modulares: cada uno define forma, zonas y obstáculos.
// Para crear un circuito nuevo, añade un objeto aquí y aparece en el selector.
// s = distancia a lo largo de la vuelta (0..loop). Las zonas usan wrapS(s).
// mode "polar": bucle clásico. mode "eight": figura en 8 (lemniscata de Gerono)
// con un solo cruce a distinto nivel: paso elevado en s=loop/4, paso inferior en 3*loop/4.

export const LOOP = 620; // largo por defecto cuando la pista omite `loop`

export const TRACKS = [
  {
    id: "clasico",
    name: "Clásico",
    mode: "polar",
    loop: 620,
    // forma del bucle
    R0: 95, a1: 18, p1: 1.0, a2: 9, p2: 0.5,
    baseY: 6, h1: 3.2, hp1: 0.6, h2: 1.5, hp2: 0.2,
    gridCols: 6,
    narrow: [{ a: 360, b: 400, w: 3.4 }],
    split: null,
    lava: [],
    conveyor: [],
    portal: null,
    springPow: { base: 7.5, rand: 0 },
    obstacles: {
      boost: [80, 290, 410],
      jump: 250,
      spinners: [
        { s: 140, speed: 1.9, len: 9 },
        { s: 340, speed: -2.3, len: 9 },
        { s: 560, speed: 2.7, len: 7 },
      ],
      coins: [{ s: 210 }, { s: 460 }],
      geysers: [{ s: 480 }, { s: 505 }, { s: 530 }],
    },
    theme: { ground: 0x1e4030, name: "pradera" },
    props: { hat: [-19, 6], coin: [21, -6] },
  },
  {
    id: "volcan",
    name: "Volcán 8",
    mode: "eight",
    loop: 1050,
    // eight: x = A*cos(t) + wobble, z = (B/2)*sin(2t) + wobble (un cruce,
    // paso elevado en s=loop/4, paso inferior en s=3*loop/4, gran subida entre ellos)
    A: 112, B: 150, a1: 9, p1: 0.7, a2: 7, p2: 2.1,
    baseY: 16, H: 10, h1: 6, hp1: 1.3, h2: 2, hp2: 0.4,
    gridCols: 8,
    laps: 2,
    cannonS: 120,
    waterfallS: 45,
    narrow: [{ a: 455, b: 585, w: 2.4 }], // olla de lava (lóbulo izquierdo, fácil caer)
    split: { a: 70, b: 150, off: 3.2, half: 2.6 },
    lava: [{ a: 455, b: 585 }],
    conveyor: [{ a: 305, b: 327, pow: 7 }], // corta y pasable: empuje suave
    portal: { s: 880 }, // rescate a mitad de subida para rezagados
    springPow: { base: 6, rand: 7 },
    obstacles: {
      boost: [90, 360, 740],
      jump: 350,
      spinners: [
        { s: 210, speed: 2.1, len: 9 },
        { s: 640, speed: -2.5, len: 7 },
        { s: 950, speed: 2.9, len: 7 },
      ],
      coins: [{ s: 160 }, { s: 620 }],
      geysers: [{ s: 480 }, { s: 505 }, { s: 530 }, { s: 930 }],
    },
    theme: { ground: 0x2e2019, name: "volcánico" },
    props: { hat: [55, 0], coin: [-55, 0] },
  },
];
