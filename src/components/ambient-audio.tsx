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
  const graphRef = useRef<{
    context: AudioContext;
    analyser: AnalyserNode;
    raf: number;
  } | null>(null);
  const on = useAmbient((s) => s.on);
  const volume = useAmbient((s) => s.volume);

  useEffect(() => {
    useAmbient.setState({
      on: readAmbientOn(),
      volume: readAmbientVolume(),
      energy: 0,
    });

    const audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "metadata";
    audioRef.current = audio;

    const startAnalysis = async () => {
      const state = useAmbient.getState();
      if (!state.on || state.volume <= 0) return;

      if (!graphRef.current && typeof AudioContext !== "undefined") {
        try {
          const context = new AudioContext();
          const source = context.createMediaElementSource(audio);
          const analyser = context.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.84;
          source.connect(analyser);
          analyser.connect(context.destination);
          const data = new Uint8Array(analyser.frequencyBinCount);

          const tick = () => {
            analyser.getByteFrequencyData(data);
            let low = 0;
            let mid = 0;
            const lowEnd = Math.max(2, Math.floor(data.length * 0.18));
            const midEnd = Math.max(lowEnd + 1, Math.floor(data.length * 0.52));
            for (let i = 0; i < lowEnd; i++) low += data[i] ?? 0;
            for (let i = lowEnd; i < midEnd; i++) mid += data[i] ?? 0;
            low /= lowEnd * 255;
            mid /= Math.max(1, (midEnd - lowEnd) * 255);
            useAmbient.getState().setEnergy(low * 0.68 + mid * 0.32);
            const raf = window.requestAnimationFrame(tick);
            if (graphRef.current) graphRef.current.raf = raf;
          };

          graphRef.current = { context, analyser, raf: 0 };
          tick();
        } catch {
          useAmbient.getState().setEnergy(0);
        }
      }

      if (graphRef.current?.context.state === "suspended") {
        await graphRef.current.context.resume().catch(() => undefined);
      }

      audio.volume = state.volume;
      await audio.play().catch(() => undefined);
    };

    const start = () => {
      void startAnalysis();
    };

    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start, { once: true });

    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;

      if (graphRef.current) {
        window.cancelAnimationFrame(graphRef.current.raf);
        void graphRef.current.context.close().catch(() => undefined);
        graphRef.current = null;
      }
      useAmbient.getState().setEnergy(0);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = on ? volume : 0;
    if (on && volume > 0) {
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
      useAmbient.getState().setEnergy(0);
    }
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

export function AmbientToggle({
  className = "",
}: {
  className?: string;
}) {
  const on = useAmbient((s) => s.on);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
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
        <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Sustained Focus
        </label>
        <span className="font-mono text-[10px] tabular-nums text-foreground">
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
