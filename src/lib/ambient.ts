import { create } from "zustand";

const ON_KEY = "vortex-music";
const VOL_KEY = "vortex-music-vol";

export function readAmbientOn() {
  try {
    return localStorage.getItem(ON_KEY) !== "0";
  } catch {
    return true;
  }
}

export function readAmbientVolume() {
  try {
    const n = Number(localStorage.getItem(VOL_KEY));
    if (Number.isFinite(n)) return Math.min(1, Math.max(0, n));
  } catch {
    // Storage is optional.
  }
  return 0.45;
}

type AmbientState = {
  on: boolean;
  volume: number;
  setOn: (on: boolean) => void;
  setVolume: (volume: number) => void;
  toggle: () => void;
};

export const useAmbient = create<AmbientState>((set, get) => ({
  on: true,
  volume: 0.45,
  setOn: (on) => {
    set({ on });
    try {
      localStorage.setItem(ON_KEY, on ? "1" : "0");
    } catch {
      // Storage is optional.
    }
  },
  setVolume: (volume) => {
    const v = Math.min(1, Math.max(0, volume));
    set({ volume: v, on: v > 0 });
    try {
      localStorage.setItem(VOL_KEY, String(v));
      localStorage.setItem(ON_KEY, v > 0 ? "1" : "0");
    } catch {
      // Storage is optional.
    }
  },
  toggle: () => get().setOn(!get().on),
}));
