import { create } from "zustand";

export const STORAGE_KEY = "vortex-settings-v3";
export const SETTINGS_VERSION = 3;

export type PaletteId = "spectrum" | "aurora" | "ember" | "ice" | "silver";
export type FieldMode = "vortex" | "flow" | "orbit" | "wave";
export type FieldBgId =
  | "void"
  | "ink"
  | "abyss"
  | "slate"
  | "fog"
  | "paper"
  | "custom";

export const FIELD_BACKGROUNDS: Record<Exclude<FieldBgId, "custom">, string> = {
  void: "#050506",
  ink: "#0c121c",
  abyss: "#071412",
  slate: "#181a20",
  fog: "#1a1714",
  paper: "#e6e1d6",
};

export const PALETTES: { id: PaletteId; label: string }[] = [
  { id: "spectrum", label: "Espectro" },
  { id: "aurora", label: "Aurora" },
  { id: "ember", label: "Brasa" },
  { id: "ice", label: "Hielo" },
  { id: "silver", label: "Plata" },
];

export const FIELD_MODES: { id: FieldMode; label: string }[] = [
  { id: "vortex", label: "Vórtice" },
  { id: "flow", label: "Flujo" },
  { id: "orbit", label: "Órbita" },
  { id: "wave", label: "Onda" },
];

export const FIELD_BG_OPTIONS: { id: Exclude<FieldBgId, "custom">; label: string }[] =
  [
    { id: "void", label: "Vacío" },
    { id: "ink", label: "Tinta" },
    { id: "abyss", label: "Abismo" },
    { id: "slate", label: "Pizarra" },
    { id: "fog", label: "Niebla" },
    { id: "paper", label: "Papel" },
  ];

export const COUNT_MIN = 800;
export const COUNT_MAX = 20000;
export const COUNT_STEP = 200;
export const FORCE_MIN = 0.15;
export const FORCE_MAX = 3;
export const FORCE_STEP = 0.05;
export const TRAIL_MIN = 0;
export const TRAIL_MAX = 0.97;
export const TRAIL_STEP = 0.01;

export function defaultCount(): number {
  if (typeof window === "undefined") return 8000;
  return window.matchMedia("(max-width: 640px)").matches ? 4000 : 8000;
}

export type SettingsSnapshot = {
  count: number;
  force: number;
  trail: number;
  palette: PaletteId;
  mode: FieldMode;
  bg: FieldBgId;
  customBg: string;
};

type Persisted = SettingsSnapshot & { version: number };

export function resolveBg(s: SettingsSnapshot): string {
  if (s.bg === "custom") return s.customBg;
  return FIELD_BACKGROUNDS[s.bg];
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function parsePersisted(raw: string): Partial<SettingsSnapshot> | null {
  try {
    const data = JSON.parse(raw) as Partial<Persisted>;
    if (!data || (data.version !== 1 && data.version !== 2 && data.version !== SETTINGS_VERSION)) {
      return null;
    }
    const next: Partial<SettingsSnapshot> = {};
    if (typeof data.count === "number") {
      next.count = clamp(
        Math.round(data.count / COUNT_STEP) * COUNT_STEP,
        COUNT_MIN,
        COUNT_MAX,
      );
    }
    if (typeof data.force === "number") {
      next.force = clamp(data.force, FORCE_MIN, FORCE_MAX);
    }
    if (typeof data.trail === "number") {
      next.trail = clamp(data.trail, TRAIL_MIN, TRAIL_MAX);
    }
    if (PALETTES.some((p) => p.id === data.palette)) {
      next.palette = data.palette as PaletteId;
    }
    if (FIELD_MODES.some((m) => m.id === data.mode)) {
      next.mode = data.mode as FieldMode;
    }
    if (data.bg === "custom" || FIELD_BG_OPTIONS.some((b) => b.id === data.bg)) {
      next.bg = data.bg as FieldBgId;
    }
    if (typeof data.customBg === "string" && /^#[0-9a-fA-F]{6}$/.test(data.customBg)) {
      next.customBg = data.customBg;
    }
    return next;
  } catch {
    return null;
  }
}

type SettingsStore = SettingsSnapshot & {
  hydrated: boolean;
  setCount: (count: number) => void;
  setForce: (force: number) => void;
  setTrail: (trail: number) => void;
  setPalette: (palette: PaletteId) => void;
  setMode: (mode: FieldMode) => void;
  setBg: (bg: FieldBgId) => void;
  setCustomBg: (customBg: string) => void;
  hydrate: () => void;
  persist: () => void;
  restoreDefaults: () => void;
};

export const useSettings = create<SettingsStore>((set, get) => ({
  count: 8000,
  force: 1,
  trail: 0.93,
  palette: "ice",
  mode: "vortex",
  bg: "void",
  customBg: "#102018",
  hydrated: false,
  setCount: (count) => {
    set({ count: clamp(count, COUNT_MIN, COUNT_MAX) });
    get().persist();
  },
  setForce: (force) => {
    set({ force: clamp(force, FORCE_MIN, FORCE_MAX) });
    get().persist();
  },
  setTrail: (trail) => {
    set({ trail: clamp(trail, TRAIL_MIN, TRAIL_MAX) });
    get().persist();
  },
  setPalette: (palette) => {
    set({ palette });
    get().persist();
  },
  setMode: (mode) => {
    set({ mode });
    get().persist();
  },
  setBg: (bg) => {
    set({ bg });
    get().persist();
  },
  setCustomBg: (customBg) => {
    set({ customBg, bg: "custom" });
    get().persist();
  },
  hydrate: () => {
    if (typeof window === "undefined" || get().hydrated) return;
    const defaults: Partial<SettingsSnapshot> = { count: defaultCount() };
    const stored =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem("vortex-settings-v1");
    const parsed = stored ? parsePersisted(stored) : null;
    set({ ...defaults, ...parsed, hydrated: true });
  },
  persist: () => {
    if (typeof window === "undefined" || !get().hydrated) return;
    const { count, force, trail, palette, mode, bg, customBg } = get();
    const payload: Persisted = {
      version: SETTINGS_VERSION,
      count,
      force,
      trail,
      palette,
      mode,
      bg,
      customBg,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  },
  restoreDefaults: () => {
    set({
      count: defaultCount(),
      force: 1,
      trail: 0.93,
      palette: "ice",
      mode: "vortex",
      bg: "void",
      customBg: "#102018",
    });
    get().persist();
  },
}));

type LiveState = {
  meanSpeed: number;
  fps: number;
  samples: number;
  gl: boolean;
  setLive: (next: Partial<Omit<LiveState, "setLive">>) => void;
};

export const useLive = create<LiveState>((set) => ({
  meanSpeed: 0,
  fps: 0,
  samples: 0,
  gl: false,
  setLive: (next) => set(next),
}));
