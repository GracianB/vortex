import {
  type FieldMode,
  type PaletteId,
  type SettingsSnapshot,
  resolveBg,
  useLive,
} from "@/lib/settings";

const CAPACITY = 20000;
const MAX_DT = 0.05;
const STRIDE = 4;

export type EngineApi = {
  start: () => void;
  destroy: () => void;
  clearTrails: () => void;
  resetParticles: () => void;
  capturePng: () => void;
  pulse: () => void;
  pointer: (e: PointerEvent, kind: "move" | "down" | "up" | "cancel") => void;
  blur: () => void;
};

const PALETTE_INDEX: Record<PaletteId, number> = {
  spectrum: 0,
  aurora: 1,
  ember: 2,
  ice: 3,
  silver: 4,
};

const POINT_VS = `
attribute vec2 a_pos;
attribute float a_speed;
attribute float a_hue;
uniform vec2 u_res;
uniform float u_dpr;
uniform float u_scale;
varying float v_speed;
varying float v_hue;
void main() {
  vec2 clip = vec2((a_pos.x / u_res.x) * 2.0 - 1.0, 1.0 - (a_pos.y / u_res.y) * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  float glow = clamp(a_speed * 0.0018, 0.0, 1.0);
  gl_PointSize = mix(3.4, 11.0, glow) * u_dpr * u_scale;
  v_speed = a_speed;
  v_hue = a_hue;
}
`;

const POINT_FS = `
precision mediump float;
varying float v_speed;
varying float v_hue;
uniform float u_palette;
uniform float u_light;

vec3 hsl2rgb(float h, float s, float l) {
  float hd = mod(h, 360.0);
  vec3 k = mod(vec3(0.0, 8.0, 4.0) + hd / 30.0, 12.0);
  float a = s * min(l, 1.0 - l);
  return l - a * clamp(min(k - 3.0, 9.0 - k), -1.0, 1.0);
}

vec3 tone() {
  float spd = clamp(v_speed * 0.0032, 0.0, 1.0);
  float h = v_hue;
  float s = 0.78;
  float l = 0.58 + spd * 0.22;
  if (u_palette > 0.5 && u_palette < 1.5) {
    h = 162.0 + sin(v_hue * 0.01745) * 48.0;
    s = u_light > 0.5 ? 0.52 : 0.72;
    l = u_light > 0.5 ? 0.30 + spd * 0.12 : 0.56 + spd * 0.22;
  } else if (u_palette > 1.5 && u_palette < 2.5) {
    h = 12.0 + spd * 36.0;
    s = u_light > 0.5 ? 0.74 : 0.92;
    l = u_light > 0.5 ? 0.36 + spd * 0.10 : 0.52 + spd * 0.26;
  } else if (u_palette > 2.5 && u_palette < 3.5) {
    h = 184.0 + spd * 14.0;
    s = u_light > 0.5 ? 0.55 : 0.78;
    l = u_light > 0.5 ? 0.36 + spd * 0.14 : 0.68 + spd * 0.18;
  } else if (u_palette > 3.5) {
    h = 210.0;
    s = u_light > 0.5 ? 0.08 : 0.14;
    l = u_light > 0.5 ? 0.28 + spd * 0.10 : 0.74 + spd * 0.14;
  } else {
    s = u_light > 0.5 ? 0.62 : 0.82;
    l = u_light > 0.5 ? 0.34 + spd * 0.12 : 0.58 + spd * 0.24;
  }
  return hsl2rgb(h, s, l);
}

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;
  float core = exp(-d * 6.2);
  float halo = exp(-d * 2.1);
  float a = clamp(core + halo * 0.55, 0.0, 1.0);
  vec3 c = tone();
  gl_FragColor = vec4(c, a);
}
`;

const QUAD_VS = `
attribute vec2 a_pos;
attribute vec2 a_uv;
varying vec2 v_uv;
void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FADE_FS = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec3 u_bg;
uniform float u_fade;
void main() {
  vec3 prev = texture2D(u_tex, v_uv).rgb;
  gl_FragColor = vec4(mix(prev, u_bg, u_fade), 1.0);
}
`;

const COPY_FS = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;
void main() {
  gl_FragColor = texture2D(u_tex, v_uv);
}
`;

function parseHex(hex: string): [number, number, number] {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return [5, 5, 6];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("No se pudo crear el sombreador");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "error de compilación";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function link(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string) {
  const program = gl.createProgram();
  if (!program) throw new Error("No se pudo crear el programa WebGL");
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "error de enlace";
    gl.deleteProgram(program);
    throw new Error(log);
  }
  return program;
}

function fromChrome(e: Event) {
  const t = e.target;
  return t instanceof Element && Boolean(t.closest("[data-ui]"));
}

type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };

function makeTarget(gl: WebGLRenderingContext, w: number, h: number): Target {
  const tex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  if (!tex || !fbo) throw new Error("No se pudo crear el búfer de estela");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  if (!ok) throw new Error("El búfer de estela no es válido");
  return { tex, fbo, w, h };
}

function destroyTarget(gl: WebGLRenderingContext, t: Target | null) {
  if (!t) return;
  gl.deleteFramebuffer(t.fbo);
  gl.deleteTexture(t.tex);
}

export function createEngine(
  canvas: HTMLCanvasElement,
  getSettings: () => SettingsSnapshot,
): EngineApi {
  const rawGl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  if (!rawGl) {
    throw new Error("Este navegador no admite WebGL");
  }
  const gl: WebGLRenderingContext = rawGl as WebGLRenderingContext;

  const x = new Float32Array(CAPACITY);
  const y = new Float32Array(CAPACITY);
  const vx = new Float32Array(CAPACITY);
  const vy = new Float32Array(CAPACITY);
  const seed = new Float32Array(CAPACITY);
  const pack = new Float32Array(CAPACITY * STRIDE);

  for (let i = 0; i < CAPACITY; i++) seed[i] = Math.random();

  let cssW = 1;
  let cssH = 1;
  let dpr = 1;
  let raf = 0;
  let running = false;
  let lastT = 0;
  let hueShift = 0;
  let laidOut = false;
  let frameN = 0;
  let fpsEma = 60;

  const pointer = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    down: false,
    active: false,
    seen: false,
    lastT: 0,
  };
  const attract = { x: 0, y: 0 };
  let holdAcc = 0;
  const RING_R = 86;

  const pointProg = link(gl, POINT_VS, POINT_FS);
  const fadeProg = link(gl, QUAD_VS, FADE_FS);
  const copyProg = link(gl, QUAD_VS, COPY_FS);

  const pointBuf = gl.createBuffer();
  const quadBuf = gl.createBuffer();
  if (!pointBuf || !quadBuf) throw new Error("No se pudo crear el búfer");

  gl.bindBuffer(gl.ARRAY_BUFFER, pointBuf);
  gl.bufferData(gl.ARRAY_BUFFER, pack.byteLength, gl.DYNAMIC_DRAW);

  const quad = new Float32Array([
    -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1,
  ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  const loc = {
    aPos: gl.getAttribLocation(pointProg, "a_pos"),
    aSpeed: gl.getAttribLocation(pointProg, "a_speed"),
    aHue: gl.getAttribLocation(pointProg, "a_hue"),
    uRes: gl.getUniformLocation(pointProg, "u_res"),
    uDpr: gl.getUniformLocation(pointProg, "u_dpr"),
    uScale: gl.getUniformLocation(pointProg, "u_scale"),
    uPalette: gl.getUniformLocation(pointProg, "u_palette"),
    uLight: gl.getUniformLocation(pointProg, "u_light"),
    fadePos: gl.getAttribLocation(fadeProg, "a_pos"),
    fadeUv: gl.getAttribLocation(fadeProg, "a_uv"),
    fadeTex: gl.getUniformLocation(fadeProg, "u_tex"),
    fadeBg: gl.getUniformLocation(fadeProg, "u_bg"),
    fadeAmt: gl.getUniformLocation(fadeProg, "u_fade"),
    copyPos: gl.getAttribLocation(copyProg, "a_pos"),
    copyUv: gl.getAttribLocation(copyProg, "a_uv"),
    copyTex: gl.getUniformLocation(copyProg, "u_tex"),
  };

  let ping: Target | null = null;
  let pong: Target | null = null;

  function scatter(i: number) {
    const cx = cssW * 0.5;
    const cy = cssH * 0.5;
    const span = Math.max(Math.min(cssW, cssH), 2);
    const radius = span * (0.05 + seed[i] * 0.48);
    const theta = seed[i] * Math.PI * 2 + i * 0.618;
    x[i] = cx + Math.cos(theta) * radius;
    y[i] = cy + Math.sin(theta) * radius;
    const sp = 80 + seed[i] * 120;
    vx[i] = -Math.sin(theta) * sp;
    vy[i] = Math.cos(theta) * sp;
  }

  function scatterAll() {
    for (let i = 0; i < CAPACITY; i++) scatter(i);
  }

  function bindQuad(prog: WebGLProgram, aPos: number, aUv: number) {
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
  }

  function clearTargets(hex: string) {
    const [r, g, b] = parseHex(hex);
    gl.clearColor(r / 255, g / 255, b / 255, 1);
    for (const t of [ping, pong]) {
      if (!t) continue;
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
      gl.viewport(0, 0, t.w, t.h);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function resizeTargets() {
    const w = Math.max(1, canvas.width);
    const h = Math.max(1, canvas.height);
    if (ping && ping.w === w && ping.h === h) return;
    destroyTarget(gl, ping);
    destroyTarget(gl, pong);
    ping = makeTarget(gl, w, h);
    pong = makeTarget(gl, w, h);
    clearTargets(resolveBg(getSettings()));
  }

  function resize() {
    const parent = canvas.parentElement ?? canvas;
    const rect = parent.getBoundingClientRect();
    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    cssW = Math.max(rect.width, vw, 2);
    cssH = Math.max(rect.height, vh, 2);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (!pointer.seen) {
      pointer.x = cssW * 0.5;
      pointer.y = cssH * 0.5;
      attract.x = pointer.x;
      attract.y = pointer.y;
    }
    resizeTargets();
    if (!laidOut && cssW > 2 && cssH > 2) {
      laidOut = true;
      scatterAll();
    }
  }

  function localPoint(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function snapToRing(cx: number, cy: number) {
    const n = Math.min(CAPACITY, getSettings().count | 0);
    for (let i = 0; i < n; i++) {
      const ang = seed[i] * Math.PI * 2 + i * 0.017;
      const target = RING_R + (seed[i] - 0.5) * 10;
      const tx = cx + Math.cos(ang) * target;
      const ty = cy + Math.sin(ang) * target;
      x[i] += (tx - x[i]) * 0.78;
      y[i] += (ty - y[i]) * 0.78;
      const txv = -(ty - cy);
      const tyv = tx - cx;
      const len = Math.hypot(txv, tyv) || 1;
      vx[i] = (txv / len) * 520;
      vy[i] = (tyv / len) * 520;
    }
  }

  function handlePointer(e: PointerEvent, kind: "move" | "down" | "up" | "cancel") {
    if (fromChrome(e) && kind !== "up" && kind !== "cancel") return;
    const p = localPoint(e);
    const now = performance.now();
    if (kind === "move" && pointer.seen) {
      const dt = Math.max(0.004, (now - pointer.lastT) / 1000);
      pointer.vx = (p.x - pointer.x) / dt;
      pointer.vy = (p.y - pointer.y) / dt;
    }
    pointer.lastT = now;
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.seen = true;
    if (kind === "down") {
      pointer.down = true;
      pointer.active = true;
      attract.x = p.x;
      attract.y = p.y;
      holdAcc = 0;
      snapToRing(p.x, p.y);
    } else if (kind === "move") {
      pointer.active = true;
    } else {
      pointer.down = false;
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        pointer.active = false;
      }
    }
  }

  function step(dt: number, settings: SettingsSnapshot) {
    const n = Math.min(CAPACITY, settings.count | 0);
    const force = settings.force;
    const mode: FieldMode = settings.mode;
    const maxSp = (pointer.down ? 1600 : 1400) * (0.55 + force * 0.5);
    const pvx = pointer.vx;
    const pvy = pointer.vy;
    const follow = 1 - Math.exp(-(pointer.down ? 42 : 18) * dt);
    attract.x += (pointer.x - attract.x) * follow;
    attract.y += (pointer.y - attract.y) * follow;
    const ax = attract.x;
    const ay = attract.y;
    hueShift += dt * (26 + force * 10);

    if (pointer.down) holdAcc = Math.min(holdAcc + dt, 1.2);
    else holdAcc = 0;

    const damp = Math.exp(-(pointer.down ? 2.4 : 1.35) * dt);
    const idle = pointer.active ? 4 : 14;
    const cx = cssW * 0.5;
    const cy = cssH * 0.5;
    const wide = Math.min(cssW, cssH);
    let speedSum = 0;

    for (let i = 0; i < n; i++) {
      const dx = ax - x[i];
      const dy = ay - y[i];
      const dist = Math.hypot(dx, dy);
      const inv = 1 / Math.max(dist, 8);
      const nx = dx * inv;
      const ny = dy * inv;
      const tx = -ny;
      const ty = nx;

      const rest = pointer.down
        ? RING_R + (seed[i] - 0.5) * 10
        : 56 + seed[i] * wide * 0.42;
      const err = dist - rest;
      const spring = pointer.down ? 260 * force : 36 * force;
      const orbit = pointer.down ? 1750 * force : 980 * force;

      let accX = nx * err * spring + tx * orbit;
      let accY = ny * err * spring + ty * orbit;

      if (!pointer.down) {
        if (mode === "flow") {
          const t = hueShift * 0.035;
          const ang =
            Math.sin(x[i] * 0.008 + t + seed[i]) +
            Math.cos(y[i] * 0.0064 - t * 0.7);
          accX = Math.cos(ang * 1.65) * 720 * force + nx * err * 18 * force + pvx * 0.9;
          accY = Math.sin(ang * 1.65) * 720 * force + ny * err * 18 * force + pvy * 0.9;
        } else if (mode === "orbit") {
          const ox = x[i] - cx;
          const oy = y[i] - cy;
          const r = Math.max(Math.hypot(ox, oy), 18);
          const ux = ox / r;
          const uy = oy / r;
          const targetR = 40 + seed[i] * wide * 0.44;
          accX = -uy * 1100 * force + ux * (targetR - r) * 6.2 + nx * 12 * force;
          accY = ux * 1100 * force + uy * (targetR - r) * 6.2 + ny * 12 * force;
        } else if (mode === "wave") {
          const phase = dist * 0.04 - hueShift * 0.11 + seed[i] * 2;
          const mag = Math.sin(phase) * 520 * force;
          accX = -nx * mag + tx * 320 * force;
          accY = -ny * mag + ty * 320 * force;
        }
        accX += pvx * Math.exp(-dist / 140) * 2.4;
        accY += pvy * Math.exp(-dist / 140) * 2.4;
      } else {
        const vRad = vx[i] * nx + vy[i] * ny;
        accX -= nx * vRad * 28;
        accY -= ny * vRad * 28;
        const rx = ax - nx * rest;
        const ry = ay - ny * rest;
        x[i] += (rx - x[i]) * 0.16;
        y[i] += (ry - y[i]) * 0.16;
      }

      const ang = hueShift * 0.12 + seed[i] * Math.PI * 2;
      accX += Math.cos(ang) * idle;
      accY += Math.sin(ang) * idle;

      vx[i] = (vx[i] + accX * dt) * damp;
      vy[i] = (vy[i] + accY * dt) * damp;

      let sp = Math.hypot(vx[i], vy[i]);
      if (sp > maxSp) {
        const s = maxSp / sp;
        vx[i] *= s;
        vy[i] *= s;
        sp = maxSp;
      }

      x[i] += vx[i] * dt;
      y[i] += vy[i] * dt;

      if (x[i] < -12) x[i] += cssW + 24;
      else if (x[i] > cssW + 12) x[i] -= cssW + 24;
      if (y[i] < -12) y[i] += cssH + 24;
      else if (y[i] > cssH + 12) y[i] -= cssH + 24;

      const heading = Math.atan2(vy[i], vx[i]) * 57.2957795;
      let hue = heading + 180 + dist * 0.04 + seed[i] * 48 + hueShift * 0.65;
      let glowSp = sp + 80;
      if (pointer.active && dist < 120) {
        glowSp += Math.exp(-dist / 48) * 90;
      }
      if (pointer.down) {
        const onRing = Math.exp((-((dist - rest) * (dist - rest))) / (2 * 18 * 18));
        glowSp += 220 + onRing * 180 + holdAcc * 60;
        hue += onRing * 10;
      }
      const o = i * STRIDE;
      pack[o] = x[i];
      pack[o + 1] = y[i];
      pack[o + 2] = glowSp;
      pack[o + 3] = hue;
      speedSum += sp;
    }

    pointer.vx *= Math.exp(-6 * dt);
    pointer.vy *= Math.exp(-6 * dt);
    return n ? speedSum / n : 0;
  }

  function draw(settings: SettingsSnapshot, n: number) {
    if (!ping || !pong) return;
    const bg = resolveBg(settings);
    const [br, bgG, bb] = parseHex(bg);
    const light = luminance(br, bgG, bb) > 0.52;
    const fade = settings.trail <= 0.001 ? 1 : Math.max(0.012, Math.pow(1 - settings.trail, 1.05));
    const src = ping;
    const dst = pong;

    gl.viewport(0, 0, dst.w, dst.h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
    gl.disable(gl.BLEND);
    gl.disableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);

    bindQuad(fadeProg, loc.fadePos, loc.fadeUv);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src.tex);
    gl.uniform1i(loc.fadeTex, 0);
    gl.uniform3f(loc.fadeBg, br / 255, bgG / 255, bb / 255);
    gl.uniform1f(loc.fadeAmt, fade);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.enable(gl.BLEND);
    if (light) {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    } else {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }

    gl.disableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pack.subarray(0, n * STRIDE));
    gl.useProgram(pointProg);
    gl.enableVertexAttribArray(loc.aPos);
    gl.vertexAttribPointer(loc.aPos, 2, gl.FLOAT, false, STRIDE * 4, 0);
    gl.enableVertexAttribArray(loc.aSpeed);
    gl.vertexAttribPointer(loc.aSpeed, 1, gl.FLOAT, false, STRIDE * 4, 8);
    gl.enableVertexAttribArray(loc.aHue);
    gl.vertexAttribPointer(loc.aHue, 1, gl.FLOAT, false, STRIDE * 4, 12);
    gl.uniform2f(loc.uRes, cssW, cssH);
    gl.uniform1f(loc.uDpr, dpr);
    gl.uniform1f(loc.uScale, 1.12);
    gl.uniform1f(loc.uPalette, PALETTE_INDEX[settings.palette] ?? 0);
    gl.uniform1f(loc.uLight, light ? 1 : 0);
    gl.drawArrays(gl.POINTS, 0, n);

    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);
    bindQuad(copyProg, loc.copyPos, loc.copyUv);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dst.tex);
    gl.uniform1i(loc.copyTex, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    ping = dst;
    pong = src;
  }

  function frame(now: number) {
    if (!running) return;
    const raw = lastT === 0 ? 0.016 : Math.min((now - lastT) / 1000, MAX_DT);
    lastT = now;
    const settings = getSettings();
    const n = Math.min(CAPACITY, settings.count | 0);
    const mean = step(raw, settings);
    draw(settings, n);
    frameN += 1;
    const inst = raw > 0 ? 1 / raw : 60;
    fpsEma = fpsEma * 0.9 + inst * 0.1;
    if ((frameN & 7) === 0) {
      useLive.getState().setLive({
        meanSpeed: mean,
        fps: fpsEma,
        samples: n,
        gl: true,
      });
    }
    raf = window.requestAnimationFrame(frame);
  }

  const onMove = (e: PointerEvent) => handlePointer(e, "move");
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    handlePointer(e, "down");
  };
  const onUp = (e: PointerEvent) => handlePointer(e, "up");
  const onCancel = (e: PointerEvent) => handlePointer(e, "cancel");
  const onBlur = () => {
    pointer.down = false;
    pointer.vx = 0;
    pointer.vy = 0;
  };
  const onWinResize = () => resize();
  const ro = new ResizeObserver(() => resize());

  return {
    start() {
      if (running) return;
      running = true;
      resize();
      useLive.getState().setLive({ gl: true, samples: getSettings().count });
      ro.observe(canvas.parentElement ?? canvas);
      window.addEventListener("resize", onWinResize);
      window.visualViewport?.addEventListener("resize", onWinResize);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
      window.addEventListener("blur", onBlur);
      document.addEventListener("visibilitychange", onBlur);
      lastT = 0;
      raf = window.requestAnimationFrame(frame);
    },
    destroy() {
      running = false;
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", onWinResize);
      window.visualViewport?.removeEventListener("resize", onWinResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onBlur);
      destroyTarget(gl, ping);
      destroyTarget(gl, pong);
      ping = null;
      pong = null;
      gl.deleteBuffer(pointBuf);
      gl.deleteBuffer(quadBuf);
      gl.deleteProgram(pointProg);
      gl.deleteProgram(fadeProg);
      gl.deleteProgram(copyProg);
    },
    clearTrails() {
      clearTargets(resolveBg(getSettings()));
    },
    resetParticles() {
      scatterAll();
      hueShift = 0;
      clearTargets(resolveBg(getSettings()));
    },
    pulse() {
      snapToRing(pointer.x || cssW * 0.5, pointer.y || cssH * 0.5);
    },
    capturePng() {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
        a.href = url;
        a.download = `vortex-${stamp}.png`;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      }, "image/png");
    },
    pointer(e, kind) {
      handlePointer(e, kind);
    },
    blur() {
      onBlur();
    },
  };
}
