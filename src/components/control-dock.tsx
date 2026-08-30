import { useEffect, useState, type ReactNode, type RefObject } from "react";
import {
  ChevronDown,
  Download,
  Eraser,
  RotateCcw,
  Pipette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  COUNT_MAX,
  COUNT_MIN,
  COUNT_STEP,
  FIELD_BG_OPTIONS,
  FIELD_MODES,
  FORCE_MAX,
  FORCE_MIN,
  FORCE_STEP,
  PALETTES,
  TRAIL_MAX,
  TRAIL_MIN,
  TRAIL_STEP,
  useLive,
  useSettings,
  type FieldBgId,
} from "@/lib/settings";
import { cn } from "@/lib/utils";
import { AmbientToggle, AmbientVolume } from "@/components/ambient-audio";
import type { ParticleCanvasHandle } from "@/components/particle-canvas";

type Props = {
  canvas: RefObject<ParticleCanvasHandle | null>;
};

function fmt(n: number, digits = 0) {
  if (digits === 0) {
    const rounded = Math.round(n).toString();
    return rounded.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  const fixed = n.toFixed(digits);
  const [intPart, frac] = fixed.split(".");
  const grouped = (intPart ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${grouped},${frac}`;
}

export function ControlDock({ canvas }: Props) {
  const count = useSettings((s) => s.count);
  const force = useSettings((s) => s.force);
  const trail = useSettings((s) => s.trail);
  const palette = useSettings((s) => s.palette);
  const mode = useSettings((s) => s.mode);
  const bg = useSettings((s) => s.bg);
  const customBg = useSettings((s) => s.customBg);
  const meanSpeed = useLive((s) => s.meanSpeed);
  const fps = useLive((s) => s.fps);
  const gl = useLive((s) => s.gl);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (e.code === "KeyR" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        canvas.current?.resetParticles();
      } else if (e.code === "KeyC" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        canvas.current?.clearTrails();
      } else if (e.code === "KeyS" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        canvas.current?.capturePng();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canvas]);

  const capture = () => {
    canvas.current?.capturePng();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  return (
    <>
      <header
        data-ui="chrome"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-5"
      >
        <div className="pointer-events-auto rounded-xl bg-card/90 px-4 py-3 shadow-border">
          <p className="font-display text-lg leading-tight tracking-display text-foreground">
            Vórtice
          </p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground tabular-nums">
            {fmt(count)} muestras
            {meanSpeed > 0 ? ` · ${fmt(meanSpeed, 0)} u/s` : ""}
          </p>
          <a
            className="mt-0.5 block text-xs leading-snug text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            href="https://suno.com/s/Zq81WeM02AVZnhuC"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sustained Focus · grabae
          </a>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            {gl ? "WebGL" : "Inicializando"}
            {fps > 1 ? ` · ${Math.round(fps)} fps` : ""}
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <AmbientToggle />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Borrar estelas"
            title="Borrar estelas (C)"
            data-testid="btn-clear"
            onClick={() => canvas.current?.clearTrails()}
          >
            <Eraser />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Reiniciar campo"
            title="Reiniciar (R)"
            data-testid="btn-reset"
            onClick={() => canvas.current?.resetParticles()}
          >
            <RotateCcw />
          </Button>
          <Button
            type="button"
            variant="default"
            size="icon"
            aria-label="Descargar captura"
            title="Descargar captura (S)"
            data-testid="btn-capture"
            onClick={capture}
          >
            <Download />
          </Button>
        </div>
      </header>

      {saved ? (
        <p className="pointer-events-none absolute top-20 right-4 z-10 rounded-md bg-card px-3 py-2 text-xs text-foreground shadow-border sm:right-5">
          Captura lista
        </p>
      ) : null}

      <aside
        data-ui="chrome"
        className={cn(
          "pointer-events-auto absolute inset-x-4 bottom-4 z-10 flex max-h-[46vh] flex-col rounded-xl bg-card/95 shadow-border sm:inset-x-auto sm:left-5 sm:bottom-5 sm:w-80 sm:max-h-[min(36rem,calc(100dvh-7rem))]",
          "pb-[max(0px,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="flex h-11 items-center justify-between px-4">
          <p className="text-sm font-medium text-foreground">Controles</p>
          <button
            type="button"
            className="flex h-11 items-center gap-1 text-xs font-medium text-muted-foreground sm:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="vortex-controls"
          >
            Más
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-150 ease-out",
                open ? "rotate-0" : "-rotate-90",
              )}
            />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-4 pb-4">
          <div className="mb-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Campo</p>
            <div className="flex flex-wrap gap-1.5">
              {FIELD_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => useSettings.getState().setMode(m.id)}
                  className={cn(
                    "h-9 rounded-md px-3 text-xs font-medium shadow-border transition-[background-color,color,box-shadow] duration-150 ease-out",
                    mode === m.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80",
                  )}
                  aria-pressed={mode === m.id}
                  data-testid={`mode-${m.id}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Muestras" value={fmt(count)}>
            <Slider
              min={COUNT_MIN}
              max={COUNT_MAX}
              step={COUNT_STEP}
              value={[count]}
              onValueChange={([v]) => {
                if (typeof v === "number") useSettings.getState().setCount(v);
              }}
              aria-label="Cantidad de muestras"
              data-testid="slider-count"
            />
          </Field>

          <Field label="Energía" value={`${fmt(force, 2)}×`}>
            <Slider
              min={FORCE_MIN}
              max={FORCE_MAX}
              step={FORCE_STEP}
              value={[force]}
              onValueChange={([v]) => {
                if (typeof v === "number") useSettings.getState().setForce(v);
              }}
              aria-label="Energía del campo"
              data-testid="slider-force"
            />
          </Field>

          <AmbientVolume />

          <div
            id="vortex-controls"
            className={cn(open ? "max-sm:block" : "max-sm:hidden")}
          >
            <Field label="Estela" value={fmt(trail, 2)}>
              <Slider
                min={TRAIL_MIN}
                max={TRAIL_MAX}
                step={TRAIL_STEP}
                value={[trail]}
                onValueChange={([v]) => {
                  if (typeof v === "number") useSettings.getState().setTrail(v);
                }}
                aria-label="Persistencia de estelas"
                data-testid="slider-trail"
              />
            </Field>

            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Paleta</p>
              <div className="flex flex-wrap gap-1.5">
                {PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => useSettings.getState().setPalette(p.id)}
                    className={cn(
                      "h-9 rounded-md px-3 text-xs font-medium shadow-border transition-[background-color,color,box-shadow] duration-150 ease-out",
                      palette === p.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80",
                    )}
                    aria-pressed={palette === p.id}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Fondo</p>
              <div className="flex flex-wrap items-center gap-2">
                {FIELD_BG_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-label={opt.label}
                    title={opt.label}
                    aria-pressed={bg === opt.id}
                    onClick={() => useSettings.getState().setBg(opt.id)}
                    className={cn(
                      "size-8 rounded-md shadow-border ring-offset-2 ring-offset-card transition-[box-shadow,transform] duration-150 ease-out",
                      swatchClass(opt.id),
                      bg === opt.id
                        ? "ring-2 ring-ring"
                        : "hover:ring-2 hover:ring-ring/40",
                    )}
                  />
                ))}
                <label
                  className={cn(
                    "relative size-8 cursor-pointer overflow-hidden rounded-md shadow-border ring-offset-2 ring-offset-card",
                    bg === "custom" ? "ring-2 ring-ring" : "",
                  )}
                  title="Color personalizado"
                >
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: customBg }}
                  />
                  <Pipette className="absolute inset-0 m-auto size-3.5 text-primary mix-blend-difference" />
                  <input
                    type="color"
                    value={customBg}
                    aria-label="Color de fondo personalizado"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) =>
                      useSettings.getState().setCustomBg(e.target.value)
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-1">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs tabular-nums text-foreground">{value}</span>
      </div>
      {children}
    </div>
  );
}

function swatchClass(id: Exclude<FieldBgId, "custom">) {
  switch (id) {
    case "void":
      return "bg-field-void";
    case "ink":
      return "bg-field-ink";
    case "abyss":
      return "bg-field-abyss";
    case "slate":
      return "bg-field-slate";
    case "fog":
      return "bg-field-fog";
    case "paper":
      return "bg-field-paper";
  }
}
