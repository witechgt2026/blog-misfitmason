// Modular weather: presets + smooth transitions + rain/snow.
// Usage: const weather = createWeather(THREE, scene, sun, hemi);
//      weather.apply("rain"); weather.randomize(); weather.update(dt,t);
//      weather.grip -> multiplicador de agarre lateral (1 = normal).

export const WEATHERS = {
  day:       { label: "Day",       sky: 0x87b5e0, fogNear: 200, fogFar: 620, hemi: 1.25, sun: 2.3,  sunCol: 0xffffff, rain: 0, snow: 0, grip: 1 },
  sunny:     { label: "Sunny",     sky: 0x9fd0ff, fogNear: 220, fogFar: 700, hemi: 1.45, sun: 2.6,  sunCol: 0xfff3d6, rain: 0, snow: 0, grip: 1 },
  sunset:    { label: "Sunset",    sky: 0xc96a45, fogNear: 150, fogFar: 520, hemi: 0.9,  sun: 1.6,  sunCol: 0xffb066, rain: 0, snow: 0, grip: 1 },
  night:     { label: "Night",     sky: 0x05070f, fogNear: 130, fogFar: 480, hemi: 0.35, sun: 0.55, sunCol: 0x9db8ff, rain: 0, snow: 0, grip: 0.95 },
  fog:       { label: "Fog",       sky: 0x9aa5b1, fogNear: 40,  fogFar: 250, hemi: 1.0,  sun: 1.2,  sunCol: 0xffffff, rain: 0, snow: 0, grip: 0.9 },
  rain:      { label: "Rain",      sky: 0x3d4a5c, fogNear: 110, fogFar: 470, hemi: 0.8,  sun: 1.1,  sunCol: 0xcfd8e6, rain: 1, snow: 0, grip: 0.75 },
  snow:      { label: "Snow",      sky: 0xbcc8d8, fogNear: 110, fogFar: 470, hemi: 1.0,  sun: 1.3,  sunCol: 0xffffff, rain: 0, snow: 1, grip: 0.7 },
};

export function createWeather(THREE, scene, sun, hemi) {
  const mk = (n, color, size, area, h) => {
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * area;
      pos[i * 3 + 1] = Math.random() * h;
      pos[i * 3 + 2] = (Math.random() - 0.5) * area;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({
      color, size, transparent: true, opacity: 0, depthWrite: false,
    }));
    p.frustumCulled = false;
    p.visible = false;
    scene.add(p);
    return p;
  };
  const rain = mk(900, 0x9fc4e8, 0.9, 340, 70);
  const snow = mk(700, 0xffffff, 1.1, 340, 70);

  const cur = {
    sky: new THREE.Color(WEATHERS.day.sky),
    fogNear: WEATHERS.day.fogNear, fogFar: WEATHERS.day.fogFar,
    hemi: WEATHERS.day.hemi, sun: WEATHERS.day.sun,
    sunCol: new THREE.Color(WEATHERS.day.sunCol),
    rain: 0, snow: 0, grip: 1,
  };
  const tgt = JSON.parse(JSON.stringify({ ...WEATHERS.day, sky: 0, sunCol: 0 }));
  let tgtSky = new THREE.Color(WEATHERS.day.sky);
  let tgtSunCol = new THREE.Color(WEATHERS.day.sunCol);
  Object.assign(tgt, WEATHERS.day);

  scene.background = cur.sky;
  if (!scene.fog) scene.fog = new THREE.Fog(cur.sky.getHex(), cur.fogNear, cur.fogFar);

  const api = {
    current: "day",
    grip: 1,
    apply(name) {
      if (!WEATHERS[name]) return;
      api.current = name;
      Object.assign(tgt, WEATHERS[name]);
      tgtSky.set(WEATHERS[name].sky);
      tgtSunCol.set(WEATHERS[name].sunCol);
    },
    randomize() {
      const keys = Object.keys(WEATHERS).filter((k) => k !== api.current);
      const pick = keys[Math.floor(Math.random() * keys.length)];
      api.apply(pick);
      return WEATHERS[pick].label;
    },
    update(dt, t) {
      const k = Math.min(1, dt * 0.9);
      cur.sky.lerp(tgtSky, k);
      cur.sunCol.lerp(tgtSunCol, k);
      cur.fogNear += (tgt.fogNear - cur.fogNear) * k;
      cur.fogFar += (tgt.fogFar - cur.fogFar) * k;
      cur.hemi += (tgt.hemi - cur.hemi) * k;
      cur.sun += (tgt.sun - cur.sun) * k;
      cur.rain += (tgt.rain - cur.rain) * k;
      cur.snow += (tgt.snow - cur.snow) * k;
      cur.grip += (tgt.grip - cur.grip) * k;
      api.grip = cur.grip;
      scene.fog.color.copy(cur.sky);
      scene.fog.near = cur.fogNear;
      scene.fog.far = cur.fogFar;
      sun.intensity = cur.sun;
      sun.color.copy(cur.sunCol);
      hemi.intensity = cur.hemi;
      // lluvia
      rain.visible = cur.rain > 0.02;
      if (rain.visible) {
        rain.material.opacity = Math.min(0.7, cur.rain * 0.7);
        const p = rain.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          let y = p.getY(i) - 60 * dt;
          if (y < -2) y = 70;
          p.setY(i, y);
        }
        p.needsUpdate = true;
      }
      // nieve
      snow.visible = cur.snow > 0.02;
      if (snow.visible) {
        snow.material.opacity = Math.min(0.9, cur.snow * 0.9);
        const p = snow.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          let y = p.getY(i) - (5 + (i % 5)) * dt;
          if (y < -2) y = 70;
          p.setY(i, y);
          p.setX(i, p.getX(i) + Math.sin(t * 1.5 + i) * dt * 2);
        }
        p.needsUpdate = true;
      }
    },
  };
  return api;
}
