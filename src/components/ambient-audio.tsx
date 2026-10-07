import { useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  readAmbientOn,
  readAmbientVolume,
  useAmbient,
} from "@/lib/ambient";

const SRC = "/audio/sustained-focus.mp3";

export function AmbientEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const on = useAmbient((s) => s.on);
  const volume = useAmbient((s) => s.volume);

  useEffect(() => {
    useAmbient.setState({
      on: readAmbientOn(),
      volume: readAmbientVolume(),
    });

    const audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "metadata";
    audioRef.current = audio;

    const start = () => {
      const state = useAmbient.getState();
      if (!state.on || state.volume <= 0) return;
      audio.volume = state.volume;
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
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }
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
        onValueChange={([value]) => {
          if (typeof value === "number") useAmbient.getState().setVolume(value);
        }}
        aria-label="Volumen"
      />
    </div>
  );
}
