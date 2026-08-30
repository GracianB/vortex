import { useEffect, useRef } from "react";
import { create } from "zustand";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const SRC = "/audio/sustained-focus.mp3";
const ON_KEY = "vortex-music";
const VOL_KEY = "vortex-music-vol";

function readOn() {
  try {
    return localStorage.getItem(ON_KEY) !== "0";
  } catch {
    return true;
  }
}
function readVol() {
  try {
    const n = Number(localStorage.getItem(VOL_KEY));
    if (Number.isFinite(n)) return Math.min(1, Math.max(0, n));
  } catch {
    /* ignore */
  }
  return 0.45;
}

type Ambient = {
  on: boolean;
  volume: number;
  setOn: (on: boolean) => void;
  setVolume: (volume: number) => void;
  toggle: () => void;
};

export const useAmbient = create<Ambient>((set, get) => ({
  on: true,
  volume: 0.45,
  setOn: (on) => {
    set({ on });
    try {
      localStorage.setItem(ON_KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  },
  setVolume: (volume) => {
    const v = Math.min(1, Math.max(0, volume));
    set({ volume: v, on: v > 0 ? get().on || true : false });
    try {
      localStorage.setItem(VOL_KEY, String(v));
      if (v === 0) localStorage.setItem(ON_KEY, "0");
      else localStorage.setItem(ON_KEY, "1");
    } catch {
      /* ignore */
    }
  },
  toggle: () => get().setOn(!get().on),
}));

export function AmbientEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const on = useAmbient((s) => s.on);
  const volume = useAmbient((s) => s.volume);

  useEffect(() => {
    useAmbient.setState({ on: readOn(), volume: readVol() });
    const audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;
    const start = () => {
      const s = useAmbient.getState();
      if (!s.on) return;
      audio.volume = s.volume;
      void audio.play().catch(() => {});
    };
    window.addEventListener("pointerdown", start);
    return () => {
      window.removeEventListener("pointerdown", start);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = on ? volume : 0;
    if (on && volume > 0) void audio.play().catch(() => {});
    else audio.pause();
  }, [on, volume]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.code === "KeyM" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        useAmbient.getState().toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}

export function AmbientToggle() {
  const on = useAmbient((s) => s.on);
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label={on ? "Silenciar" : "Activar sonido"}
      title={on ? "Silenciar (M)" : "Sonido (M)"}
      aria-pressed={on}
      onClick={() => useAmbient.getState().toggle()}
    >
      {on ? <Volume2 /> : <VolumeX />}
    </Button>
  );
}

export function AmbientVolume() {
  const on = useAmbient((s) => s.on);
  const volume = useAmbient((s) => s.volume);
  const shown = on ? volume : 0;
  return (
    <div className="mt-1">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-xs font-medium text-muted-foreground">
          Sustained Focus
        </label>
        <span className="text-xs tabular-nums text-foreground">
          {Math.round(shown * 100)}%
        </span>
      </div>
      <Slider
        min={0}
        max={1}
        step={0.01}
        value={[shown]}
        onValueChange={([v]) => {
          if (typeof v !== "number") return;
          useAmbient.getState().setVolume(v);
          if (v > 0) useAmbient.getState().setOn(true);
        }}
        aria-label="Volumen"
      />
    </div>
  );
}
