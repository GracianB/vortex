import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { createEngine, type EngineApi } from "@/lib/particles";
import { useSettings, type SettingsSnapshot } from "@/lib/settings";

export type ParticleCanvasHandle = {
  clearTrails: () => void;
  resetParticles: () => void;
  capturePng: () => void;
};

type Props = {
  ref?: Ref<ParticleCanvasHandle>;
};

export function ParticleCanvas({ ref }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<EngineApi | null>(null);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    clearTrails: () => engineRef.current?.clearTrails(),
    resetParticles: () => engineRef.current?.resetParticles(),
    capturePng: () => engineRef.current?.capturePng(),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: EngineApi;
    try {
      engine = createEngine(canvas, () => {
        const s = useSettings.getState();
        const snap: SettingsSnapshot = {
          count: s.count,
          force: s.force,
          trail: s.trail,
          palette: s.palette,
          mode: s.mode,
          bg: s.bg,
          customBg: s.customBg,
        };
        return snap;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "WebGL no disponible");
      return;
    }

    engineRef.current = engine;
    engine.start();

    window.__vortex = {
      count: () => useSettings.getState().count,
      force: () => useSettings.getState().force,
      mode: () => useSettings.getState().mode,
      gl: true,
      clear: () => engine.clearTrails(),
      reset: () => engine.resetParticles(),
      capture: () => engine.capturePng(),
    };

    return () => {
      engine.destroy();
      engineRef.current = null;
      if (window.__vortex) delete window.__vortex;
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 size-full cursor-none touch-none bg-background"
        data-canvas="vortex"
        data-engine="webgl"
        aria-label="Campo de datos WebGL"
      />
      {error ? (
        <p className="absolute inset-0 z-10 m-auto h-fit max-w-sm rounded-xl bg-card px-5 py-4 text-center text-sm text-foreground shadow-border">
          {error}
        </p>
      ) : null}
    </>
  );
}

declare global {
  interface Window {
    __vortex?: {
      count: () => number;
      force: () => number;
      mode: () => string;
      gl: boolean;
      clear: () => void;
      reset: () => void;
      capture: () => void;
    };
  }
}
