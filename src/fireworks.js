// Modular, realistic pyrotechnics: each shell starts on the ground as a
// small comet, climbs to a random altitude and bursts with an effect
// (peony / ring / willow / strobe) that shifts color as it fades.
// Usage: const fw = createFireworks(THREE, scene);
//      fw.rocket(x, y, z);          // comet that bursts on its own
//      fw.burst(x, y, z, pal, fx); // immediate burst
//      fw.update(dt, t);
//      fw.onBoom = () => beep(...); // optional, sound on burst

const PALETTES = {
  oro:    [[1, 0.85, 0.4], [1, 0.45, 0.1]],
  rubi:   [[1, 0.35, 0.35], [1, 0.1, 0.3]],
  jade:   [[0.4, 1, 0.6], [0.1, 0.5, 1]],
  cielo:  [[0.5, 0.9, 1], [0.2, 0.3, 1]],
  violeta:[[0.8, 0.5, 1], [1, 0.3, 0.8]],
  perla:  [[1, 1, 1], [0.5, 0.7, 1]],
};
const PAL_KEYS = Object.keys(PALETTES);
const FX = ["peony", "ring", "willow", "strobe"];

export function createFireworks(THREE, scene) {
  const MAX = 900;
  const pos = new Float32Array(MAX * 3);
  const col = new Float32Array(MAX * 3);
  const vel = new Float32Array(MAX * 3);
  const colA = new Float32Array(MAX * 3);
  const colB = new Float32Array(MAX * 3);
  const life = new Float32Array(MAX);
  const maxlife = new Float32Array(MAX);
  const grav = new Float32Array(MAX);
  const drag = new Float32Array(MAX);
  const flick = new Float32Array(MAX);
  for (let i = 0; i < MAX; i++) pos[i * 3 + 1] = -999;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  // round sprite: sparks look like points of light, not squares
  const scv = document.createElement("canvas"); scv.width = scv.height = 64;
  const sg = scv.getContext("2d");
  const grad = sg.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  sg.fillStyle = grad; sg.fillRect(0, 0, 64, 64);
  const sparkTex = new THREE.CanvasTexture(scv);
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 1.4, map: sparkTex, vertexColors: true, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  pts.frustumCulled = false;
  scene.add(pts);

  // rockets (max 12 airborne)
  const rockets = [];
  for (let i = 0; i < 12; i++) rockets.push({ alive: false, x: 0, y: -999, z: 0, vy: 0, targetY: 0, pal: "oro", fx: "peony", trail: 0 });

  const pending = []; // delayed mini-bursts (strobe)

  function spawn(x, y, z, vx, vy, vz, A, B, lf, gr, dr, fl) {
    for (let i = 0; i < MAX; i++) {
      if (life[i] > 0) continue;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz;
      colA[i * 3] = A[0]; colA[i * 3 + 1] = A[1]; colA[i * 3 + 2] = A[2];
      colB[i * 3] = B[0]; colB[i * 3 + 1] = B[1]; colB[i * 3 + 2] = B[2];
      life[i] = maxlife[i] = lf;
      grav[i] = gr; drag[i] = dr; flick[i] = fl;
      col[i * 3] = A[0]; col[i * 3 + 1] = A[1]; col[i * 3 + 2] = A[2];
      return;
    }
  }

  function burst(x, y, z, palName, fx, spd = 1, n = 90) {
    const pal = PALETTES[palName] || PALETTES.oro;
    const A = pal[0], B = pal[1];
    // random orthonormal basis for the ring
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    const n1 = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
    let u = [0, 1, 0];
    if (Math.abs(n1[1]) > 0.9) u = [1, 0, 0];
    const v1 = norm(cross(n1, u)), v2 = norm(cross(n1, v1));
    for (let c = 0; c < n; c++) {
      let vx, vy, vz, lf, gr, dr, fl = 0;
      if (fx === "ring") {
        const a = (c / n) * Math.PI * 2;
        const sp = (14 + Math.random() * 3) * spd;
        vx = (v1[0] * Math.cos(a) + v2[0] * Math.sin(a)) * sp;
        vy = (v1[1] * Math.cos(a) + v2[1] * Math.sin(a)) * sp;
        vz = (v1[2] * Math.cos(a) + v2[2] * Math.sin(a)) * sp;
        lf = 1.2 + Math.random() * 0.6; gr = 5; dr = 0.985;
      } else if (fx === "willow") {
        const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
        const sp = (6 + Math.random() * 4) * spd;
        vx = Math.sin(b) * Math.cos(a) * sp; vy = Math.abs(Math.cos(b)) * sp * 0.9 + 2; vz = Math.sin(b) * Math.sin(a) * sp;
        lf = 2.4 + Math.random() * 1.2; gr = 2.5; dr = 0.99; fl = 1;
      } else { // peony
        const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
        const sp = (10 + Math.random() * 10) * spd;
        vx = Math.sin(b) * Math.cos(a) * sp; vy = Math.cos(b) * sp; vz = Math.sin(b) * Math.sin(a) * sp;
        lf = 1.2 + Math.random() * 0.8; gr = 7; dr = 0.98;
      }
      spawn(x, y, z, vx, vy, vz, A, B, lf, gr, dr, fl);
    }
    if (fx === "strobe") {
      pending.push({ t: 0.35, x, y, z, pal: palName });
      pending.push({ t: 0.7, x, y, z, pal: palName });
    }
  }
  function norm(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

  const api = {
    onBoom: null,
    aliveCount: { rockets: 0, sparks: 0 },
    rocket(x, y, z, low) {
      const r = rockets.find((r) => !r.alive);
      if (!r) return;
      r.alive = true; r.x = x; r.y = y; r.z = z;
      r.vy = 24 + Math.random() * 8;
      r.targetY = y + (low ? 10 + Math.random() * 9 : 20 + Math.random() * 16);
      r.pal = PAL_KEYS[Math.floor(Math.random() * PAL_KEYS.length)];
      r.fx = FX[Math.floor(Math.random() * FX.length)];
      r.trail = 0;
    },
    burst(x, y, z, pal = "oro", fx = "peony", spd = 1, n = 90) {
      burst(x, y, z, pal, fx, spd, n);
    },
    update(dt, t) {
      // rockets climb like comets with a trail, then burst at altitude
      let nAlive = 0, nSparks = 0;
      for (const r of rockets) if (r.alive) nAlive++;
      for (let i = 0; i < MAX; i++) if (life[i] > 0) nSparks++;
      api.aliveCount = { rockets: nAlive, sparks: nSparks };
      for (const r of rockets) {
        if (!r.alive) continue;
        r.y += r.vy * dt;
        r.x += Math.sin(t * 9 + r.z) * dt * 1.5;
        r.trail -= dt;
        if (r.trail <= 0) {
          r.trail = 0.03;
          const pal = PALETTES[r.pal];
          spawn(r.x, r.y, r.z, (Math.random() - 0.5) * 2, -2, (Math.random() - 0.5) * 2,
            [1, 0.9, 0.7], pal[0], 0.35, 0, 1, 0);
        }
        if (r.y >= r.targetY) {
          r.alive = false;
          burst(r.x, r.y, r.z, r.pal, r.fx, 1, r.fx === "willow" ? 70 : 95);
          if (api.onBoom) api.onBoom();
        }
      }
      // delayed strobes
      for (let i = pending.length - 1; i >= 0; i--) {
        pending[i].t -= dt;
        if (pending[i].t <= 0) {
          const p = pending.splice(i, 1)[0];
          burst(p.x, p.y, p.z, p.pal, "peony", 0.45, 40);
        }
      }
      // sparks
      let any = false, anyCol = false;
      for (let i = 0; i < MAX; i++) {
        if (life[i] <= 0) continue;
        any = true;
        life[i] -= dt;
        const d = Math.pow(drag[i], dt * 60);
        vel[i * 3] *= d; vel[i * 3 + 2] *= d;
        vel[i * 3 + 1] = vel[i * 3 + 1] * d - grav[i] * dt;
        pos[i * 3] += vel[i * 3] * dt;
        pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
        pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        if (life[i] <= 0) { pos[i * 3 + 1] = -999; continue; }
        const a = 1 - life[i] / maxlife[i];
        let br = 1;
        if (flick[i]) br = 0.55 + 0.45 * Math.abs(Math.sin(t * 30 + i * 1.7));
        col[i * 3] = (colA[i * 3] + (colB[i * 3] - colA[i * 3]) * a) * br;
        col[i * 3 + 1] = (colA[i * 3 + 1] + (colB[i * 3 + 1] - colA[i * 3 + 1]) * a) * br;
        col[i * 3 + 2] = (colA[i * 3 + 2] + (colB[i * 3 + 2] - colA[i * 3 + 2]) * a) * br;
        anyCol = true;
      }
      if (any) geo.attributes.position.needsUpdate = true;
      if (anyCol) geo.attributes.color.needsUpdate = true;
    },
  };
  return api;
}
