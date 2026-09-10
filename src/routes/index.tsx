import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ParticleCanvas, type ParticleCanvasHandle } from "@/components/particle-canvas";
import { ControlDock } from "@/components/control-dock";
import { AmbientEngine } from "@/components/ambient-audio";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const canvasRef = useRef<ParticleCanvasHandle>(null);
  const [hint, setHint] = useState(true);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useSettings.getState().hydrate();
  }, []);

  useEffect(() => {
    const hide = () => setHint(false);
    const timer = window.setTimeout(hide, 4200);
    window.addEventListener("pointerdown", hide, { once: true });
    window.addEventListener("pointermove", hide, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", hide);
      window.removeEventListener("pointermove", hide);
    };
  }, []);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const ui = e.target instanceof Element && e.target.closest("[data-ui]");
      el.style.opacity = ui ? "0" : "1";
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      el.classList.toggle("is-down", e.buttons === 1);
    };
    const up = () => el.classList.remove("is-down");
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <main className="fixed inset-0 overflow-hidden bg-background text-foreground select-none">
      <h1 className="sr-only">Vórtice — visualización de datos WebGL</h1>
      <ParticleCanvas ref={canvasRef} />
      <div
        ref={cursorRef}
        className="vortex-cursor pointer-events-none fixed top-0 left-0 z-[8] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7af3ff]/80 opacity-0 mix-blend-screen shadow-[0_0_18px_rgba(122,243,255,0.55)]"
        aria-hidden="true"
      />
      <AmbientEngine />
      <div className="pointer-events-none absolute inset-0">
        <ControlDock canvas={canvasRef} />
        {hint ? (
          <p className="absolute top-[32%] left-1/2 z-10 w-max max-w-[min(90vw,22rem)] -translate-x-1/2 rounded-md border border-[color-mix(in_srgb,#7af3ff_35%,transparent)] bg-card/80 px-4 py-2 text-center text-sm text-foreground shadow-border">
            Mueve el cursor. Eso es todo. Mantén pulsado para inyectar energía.
          </p>
        ) : null}
      </div>
    </main>
  );
}
