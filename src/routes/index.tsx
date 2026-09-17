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
  const [intro, setIntro] = useState(true);
  const [introDone, setIntroDone] = useState(false);
  const [embed, setEmbed] = useState(false);
  const [consent, setConsent] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    useSettings.getState().hydrate();
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has("embed")) setEmbed(true);
      const bgParam = params.get("bg");
      if (bgParam && /^[0-9a-fA-F]{6}$/.test(bgParam)) {
        useSettings.getState().setCustomBg(`#${bgParam}`);
      }
    } catch {
      /* sin params */
    }
    try {
      if (!window.localStorage.getItem("vortex-consent")) setConsent(true);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const holdT = window.setTimeout(() => setIntroDone(true), reduce ? 250 : 1900);
    const gone = window.setTimeout(() => setIntro(false), reduce ? 550 : 2650);
    const skip = () => {
      setIntroDone(true);
      window.setTimeout(() => setIntro(false), 650);
    };
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      window.clearTimeout(holdT);
      window.clearTimeout(gone);
      window.removeEventListener("pointerdown", skip);
    };
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
    el.style.left = `${window.innerWidth / 2}px`;
    el.style.top = `${window.innerHeight / 2}px`;
    const move = (e: PointerEvent) => {
      const ui = e.target instanceof Element && Boolean(e.target.closest("[data-ui]"));
      el.style.opacity = ui ? "0" : "1";
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.classList.toggle("is-down", e.buttons === 1);
    };
    const down = (e: PointerEvent) => {
      if (e.buttons !== 1) return;
      el.classList.add("is-down");
      const ui = e.target instanceof Element && Boolean(e.target.closest("[data-ui]"));
      if (ui) return;
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);
    };
    const up = () => el.classList.remove("is-down");
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <main className="fixed inset-0 overflow-hidden bg-background text-foreground select-none">
      <h1 className="sr-only">Vórtice — visualización de datos WebGL</h1>
      <ParticleCanvas ref={canvasRef} />
      <div className="vortex-vignette" aria-hidden="true" />
      <div ref={cursorRef} className="vortex-cursor" aria-hidden="true">
        <i />
      </div>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="vortex-ripple"
          style={{ left: r.x, top: r.y }}
          aria-hidden="true"
        />
      ))}
      <AmbientEngine />
      {intro && !embed ? (
        <div
          className={`vortex-intro${introDone ? " is-done" : ""}`}
          aria-hidden="true"
        >
          <div className="vortex-intro__mark">
            <span className="vortex-intro__word">VÓRTICE</span>
            <p className="vortex-intro__tag">Mueve el cursor. Eso es todo.</p>
          </div>
          <span className="vortex-intro__scan" />
        </div>
      ) : null}
      {!embed ? (
        <div className="pointer-events-none absolute inset-0">
          <ControlDock canvas={canvasRef} />
          {hint ? (
            <p className="absolute top-[32%] left-1/2 z-10 w-max max-w-[min(90vw,22rem)] -translate-x-1/2 rounded-md border border-[color-mix(in_srgb,#7af3ff_35%,transparent)] bg-card/80 px-4 py-2 text-center text-sm text-foreground shadow-border">
              Mueve el cursor. Click: solo las cercanas. Cada campo, un gesto.
            </p>
          ) : null}
        </div>
      ) : null}
      {consent && !embed ? (
        <CookieNotice onClose={() => setConsent(false)} />
      ) : null}
    </main>
  );
}

function CookieNotice({ onClose }: { onClose: () => void }) {
  const decide = (value: "yes" | "no") => {
    try {
      window.localStorage.setItem("vortex-consent", value);
    } catch {
      /* almacenamiento no disponible */
    }
    onClose();
  };
  return (
    <div
      data-ui="chrome"
      className="pointer-events-auto fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-md flex-col gap-2 rounded-xl border border-[color-mix(in_srgb,#7af3ff_24%,transparent)] bg-card/95 px-4 py-3 text-xs shadow-border sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
    >
      <p className="text-muted-foreground">
        Vórtice solo guarda tus{" "}
        <b className="font-medium text-foreground">ajustes</b> en este navegador
        (almacenamiento local). Sin rastreo ni publicidad.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => decide("no")}
          className="rounded-md bg-muted px-3 py-1.5 font-medium text-foreground hover:bg-muted/80"
        >
          Rechazar
        </button>
        <button
          type="button"
          onClick={() => decide("yes")}
          className="rounded-md bg-[#7af3ff] px-3 py-1.5 font-medium text-[#06070a] hover:brightness-110"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
