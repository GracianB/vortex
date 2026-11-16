import { useUiText } from "@/lib/ui-preferences";
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
    synthGain: GainNode;
    synthOscA: OscillatorNode;
    synthOscB: OscillatorNode;
    filter: BiquadFilterNode;
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

          // Generative Harmonic Drone Synthesizer
          const synthGain = context.createGain();
          synthGain.gain.setValueAtTime(state.volume * 0.08, context.currentTime);

          const filter = context.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(140, context.currentTime);

          const synthOscA = context.createOscillator();
          synthOscA.type = "sine";
          synthOscA.frequency.setValueAtTime(55, context.currentTime); // A1 sub-bass

          const synthOscB = context.createOscillator();
          synthOscB.type = "triangle";
          synthOscB.frequency.setValueAtTime(82.4, context.currentTime); // E2 fifth

          synthOscA.connect(filter);
          synthOscB.connect(filter);
          filter.connect(synthGain);
          synthGain.connect(analyser);

          source.connect(analyser);
          analyser.connect(context.destination);

          synthOscA.start();
          synthOscB.start();

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
            const computedEnergy = low * 0.68 + mid * 0.32;
            useAmbient.getState().setEnergy(computedEnergy);

            if (graphRef.current) {
              graphRef.current.filter.frequency.setTargetAtTime(
                120 + computedEnergy * 580,
                context.currentTime,
                0.1,
              );
            }

            const raf = window.requestAnimationFrame(tick);
            if (graphRef.current) graphRef.current.raf = raf;
          };

          graphRef.current = {
            context,
            analyser,
            synthGain,
            synthOscA,
            synthOscB,
            filter,
            raf: 0,
          };
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

    const onPulse = () => {
      const state = useAmbient.getState();
      if (!state.on || state.volume <= 0 || !graphRef.current) return;
      try {
        const ctx = graphRef.current.context;
        const now = ctx.currentTime;
        const chime = ctx.createOscillator();
        const gain = ctx.createGain();
        chime.type = "sine";
        chime.frequency.setValueAtTime(523.25, now); // C5
        chime.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25);
        gain.gain.setValueAtTime(state.volume * 0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        chime.connect(gain);
        gain.connect(ctx.destination);
        chime.start(now);
        chime.stop(now + 0.6);
      } catch {
        // ignore
      }
    };

    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start, { once: true });
    window.addEventListener("vortex:pulse", onPulse);

    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      window.removeEventListener("vortex:pulse", onPulse);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;

      if (graphRef.current) {
        window.cancelAnimationFrame(graphRef.current.raf);
        try {
          graphRef.current.synthOscA.stop();
          graphRef.current.synthOscB.stop();
        } catch {
          // ignore
        }
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
    if (graphRef.current) {
      graphRef.current.synthGain.gain.setValueAtTime(
        on ? volume * 0.08 : 0,
        graphRef.current.context.currentTime,
      );
    }
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
  const t = useUiText();
  const on = useAmbient((s) => s.on);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      aria-label={t(on ? "Silenciar" : "Activar sonido")}
      title={t(on ? "Silenciar (M)" : "Sonido (M)")}
      aria-pressed={on}
      onClick={() => useAmbient.getState().toggle()}
    >
      {on ? <Volume2 /> : <VolumeX />}
    </Button>
  );
}

export function AmbientVolume() {
  const t = useUiText();
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
        aria-label={t("Volumen")}
      />
    </div>
  );
}
