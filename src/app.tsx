import { useEffect, useRef, useState } from "react";
import {
  ParticleCanvas,
  type ParticleCanvasHandle,
} from "@/components/particle-canvas";
import { ControlDock } from "@/components/control-dock";
import { AmbientEngine } from "@/components/ambient-audio";
import { movementFor } from "@/lib/movements";
import { parseSceneSearch, useSettings } from "@/lib/settings";

type Chapter = {
  eyebrow: string;
  title: string;
  note: string;
};

export function App() {
  const canvasRef = useRef<ParticleCanvasHandle>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const previousModeRef = useRef(useSettings.getState().mode);
  const idleTimerRef = useRef<number | null>(null);
  const lastActivityRef = useRef(0);

  const mode = useSettings((state) => state.mode);
  const movement = movementFor(mode);

  const [hint, setHint] = useState(true);
  const [intro, setIntro] = useState(true);
  const [introDone, setIntroDone] = useState(false);
  const [embed, setEmbed] = useState(false);
  const [idle, setIdle] = useState(false);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  useEffect(() => {
    const settings = useSettings.getState();
    settings.hydrate();
    try {
      const params = new URLSearchParams(window.location.search);
      setEmbed(params.has("embed"));
      settings.applyScene(parseSceneSearch(window.location.search));
    } catch {
      // A malformed URL must never prevent the field from starting.
    }
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = window.setTimeout(
      () => setIntroDone(true),
      reduce ? 180 : 2100,
    );
    const gone = window.setTimeout(
      () => setIntro(false),
      reduce ? 380 : 2850,
    );
    const skip = () => {
      setIntroDone(true);
      window.setTimeout(() => setIntro(false), reduce ? 80 : 520);
    };

    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(gone);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  useEffect(() => {
    const hide = () => setHint(false);
    const timer = window.setTimeout(hide, 5200);
    window.addEventListener("pointerdown", hide, { once: true });
    window.addEventListener("pointermove", hide, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", hide);
      window.removeEventListener("pointermove", hide);
    };
  }, []);

  useEffect(() => {
    if (previousModeRef.current === mode) return;
    previousModeRef.current = mode;
    const next = movementFor(mode);
    setChapter({
      eyebrow: `${next.roman} / MOVEMENT`,
      title: next.name,
      note: next.verb,
    });
    const timer = window.setTimeout(() => setChapter(null), 1450);
    return () => window.clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    const onScene = (event: Event) => {
      const detail = (event as CustomEvent<{
        code?: string;
        label?: string;
        note?: string;
      }>).detail;
      if (!detail?.label) return;
      setChapter({
        eyebrow: `${detail.code ?? "00"} / STATE`,
        title: detail.label,
        note: (detail.note ?? "").toUpperCase(),
      });
      window.setTimeout(() => setChapter(null), 1550);
    };
    window.addEventListener("vortex:scene", onScene);
    return () => window.removeEventListener("vortex:scene", onScene);
  }, []);

  useEffect(() => {
    if (embed) return;

    const armIdle = () => {
      const now = performance.now();
      if (now - lastActivityRef.current < 220) return;
      lastActivityRef.current = now;
      setIdle(false);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => setIdle(true), 9000);
    };

    armIdle();
    window.addEventListener("pointermove", armIdle, { passive: true });
    window.addEventListener("pointerdown", armIdle, { passive: true });
    window.addEventListener("keydown", armIdle);

    return () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      window.removeEventListener("pointermove", armIdle);
      window.removeEventListener("pointerdown", armIdle);
      window.removeEventListener("keydown", armIdle);
    };
  }, [embed]);

  useEffect(() => {
    const element = cursorRef.current;
    if (!element) return;

    element.style.left = `${window.innerWidth / 2}px`;
    element.style.top = `${window.innerHeight / 2}px`;

    const move = (event: PointerEvent) => {
      const onUi =
        event.target instanceof Element &&
        Boolean(event.target.closest("[data-ui]"));
      element.style.opacity = onUi ? "0" : "1";
      element.style.left = `${event.clientX}px`;
      element.style.top = `${event.clientY}px`;
      element.classList.toggle("is-down", event.buttons === 1);
    };

    const down = (event: PointerEvent) => {
      if (event.buttons !== 1) return;
      element.classList.add("is-down");
      const onUi =
        event.target instanceof Element &&
        Boolean(event.target.closest("[data-ui]"));
      if (onUi) return;

      const id = Date.now() + Math.random();
      setRipples((current) => [
        ...current.slice(-4),
        { id, x: event.clientX, y: event.clientY },
      ]);
      window.setTimeout(() => {
        setRipples((current) => current.filter((item) => item.id !== id));
      }, 700);
    };

    const up = () => element.classList.remove("is-down");

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
    <main
      data-testid="vortex-root"
      data-movement={movement.id}
      className="fixed inset-0 overflow-hidden bg-background text-foreground select-none"
    >
      <h1 className="sr-only">Vórtice — instrumento visual generativo WebGL</h1>
      <ParticleCanvas ref={canvasRef} />
      <div className="vortex-vignette" aria-hidden="true" />
      <div className="v6-grain" aria-hidden="true" />

      <div ref={cursorRef} className="vortex-cursor" aria-hidden="true">
        <i />
      </div>

      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="vortex-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          aria-hidden="true"
        />
      ))}

      <AmbientEngine />

      {intro && !embed ? (
        <div
          className={`vortex-intro v6-intro${introDone ? " is-done" : ""}`}
          aria-hidden="true"
        >
          <div className="v6-intro__axis" />
          <div className="vortex-intro__mark v6-intro__mark">
            <p className="v6-intro__eyebrow">GENERATIVE FIELD / 2026</p>
            <span className="vortex-intro__word">VØRTICE</span>
            <p className="vortex-intro__tag">MOVE TO DISTURB THE FIELD</p>
            <p className="v6-intro__author">A VISUAL INSTRUMENT BY GRACIÁN BAENA</p>
          </div>
          <span className="vortex-intro__scan" />
        </div>
      ) : null}

      {chapter && !embed ? (
        <div className="v6-chapter" aria-live="polite">
          <span>{chapter.eyebrow}</span>
          <strong>{chapter.title}</strong>
          <small>{chapter.note}</small>
        </div>
      ) : null}

      {idle && !intro && !embed ? (
        <div className="v6-idle-signature" aria-hidden="true">
          <span>VØRTICE</span>
          <i />
          <small>BY GRACIÁN BAENA</small>
        </div>
      ) : null}

      {!embed ? (
        <div className="pointer-events-none absolute inset-0">
          <ControlDock canvas={canvasRef} />
          {hint ? (
            <p className="v6-gesture-hint">
              <span className="sm:hidden">TOCA · ARRASTRA · ESCUCHA</span>
              <span className="hidden sm:inline">
                MOVE · HOLD · DISTURB · SPACE TO PULSE
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
