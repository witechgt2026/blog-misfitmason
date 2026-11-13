// Modular circuits: each one defines shape, zones and obstacles.
// To create a new circuit, just add an object here and it appears in the selector.
// s = distance along the lap (0..loop). Zones use wrapS(s).
// mode "polar": classic closed loop. mode "eight": figure-8 (Gerono lemniscate)
// with a single grade-separated crossing: overpass at s=loop/4, underpass at 3*loop/4.

export const LOOP = 620; // default length when a track omits `loop`

export const TRACKS = [
  {
    id: "clasico",
    name: "Classic",
    mode: "polar",
    loop: 620,
    // loop shape
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
    theme: { ground: 0x1e4030, name: "meadow" },
    props: { hat: [-19, 6], coin: [21, -6] },
  },
  {
    id: "volcan",
    name: "Volcano Figure-8",
    mode: "eight",
    loop: 1050,
    // eight: x = A*cos(t) + wobble, z = (B/2)*sin(2t) + wobble (one crossing,
    // overpass at s=loop/4, underpass at s=3*loop/4, big climb between them)
    A: 112, B: 150, a1: 9, p1: 0.7, a2: 7, p2: 2.1,
    baseY: 16, H: 10, h1: 6, hp1: 1.3, h2: 2, hp2: 0.4,
    gridCols: 8,
    laps: 2,
    cannonS: 120,
    waterfallS: 45,
    narrow: [{ a: 455, b: 585, w: 2.4 }], // lava bowl (left lobe, easy to fall)
    split: { a: 70, b: 150, off: 3.2, half: 2.6 },
    lava: [{ a: 455, b: 585 }],
    conveyor: [{ a: 305, b: 327, pow: 7 }], // short & passable: pushback is gentle
    portal: { s: 880 }, // mid-climb rescue for laggards
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
    theme: { ground: 0x2e2019, name: "volcanic" },
    props: { hat: [55, 0], coin: [-55, 0] },
  },
];
