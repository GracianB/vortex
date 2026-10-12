import { useUiPreferences, useUiText } from "@/lib/ui-preferences";
import { useCallback, useEffect, useState, type ReactNode, type RefObject } from "react";
import {
  Download,
  Eraser,
  Focus,
  Maximize,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  buildSceneUrl,
  COUNT_MAX,
  COUNT_MIN,
  COUNT_STEP,
  FIELD_BG_OPTIONS,
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
  type FieldMode,
  type SettingsSnapshot,
} from "@/lib/settings";
import { MASTER_SCENES, MOVEMENTS, movementFor } from "@/lib/movements";
import { cn } from "@/lib/utils";
import { AmbientToggle, AmbientVolume } from "@/components/ambient-audio";
import type { ParticleCanvasHandle } from "@/components/particle-canvas";

type Props = {
  canvas: RefObject<ParticleCanvasHandle | null>;
};

function fmt(n: number, digits = 0) {
  if (digits === 0) {
    return Math.round(n)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return n.toFixed(digits).replace(".", ",");
}

export function ControlDock({ canvas }: Props) {
  const t = useUiText();
  const language = useUiPreferences((state) => state.language);
  const theme = useUiPreferences((state) => state.theme);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.uiTheme = theme;
  }, [language, theme]);
  const count = useSettings((s) => s.count);
  const force = useSettings((s) => s.force);
  const trail = useSettings((s) => s.trail);
  const palette = useSettings((s) => s.palette);
  const mode = useSettings((s) => s.mode);
  const bg = useSettings((s) => s.bg);
  const customBg = useSettings((s) => s.customBg);
  const fps = useLive((s) => s.fps);
  const renderDpr = useLive((s) => s.renderDpr);
  const gl = useLive((s) => s.gl);

  const [panelOpen, setPanelOpen] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const movement = movementFor(mode);
  const paletteLabel = PALETTES.find((item) => item.id === palette)?.label ?? "";
  const activeScene = MASTER_SCENES.find(
    (scene) =>
      scene.mode === mode &&
      scene.palette === palette &&
      scene.bg === bg &&
      scene.count === count &&
      scene.force === force &&
      scene.trail === trail,
  );

  const currentSnapshot = (): SettingsSnapshot => {
    const state = useSettings.getState();
    return {
      count: state.count,
      force: state.force,
      trail: state.trail,
      palette: state.palette,
      mode: state.mode,
      bg: state.bg,
      customBg: state.customBg,
    };
  };

  const share = async () => {
    const base =
      typeof window !== "undefined"
        ? window.location.href
        : "https://vortex-gilt-xi.vercel.app/";
    const url = buildSceneUrl(base, currentSnapshot());
    const data = {
      title: "VØRTICE",
      text: `VØRTICE · ${movement.roman} · ${t(movement.name)}`,
      url,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(data);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 1500);
      }
    } catch {
      // Native share cancellation is not an error state for the experience.
    }
  };

  const setMovement = useCallback(
    (next: FieldMode) => {
      useSettings.getState().setMode(next);
      window.setTimeout(() => canvas.current?.pulse(), 30);
    },
    [canvas],
  );

  const applyMasterScene = (id: string) => {
    const scene = MASTER_SCENES.find((item) => item.id === id);
    if (!scene) return;
    useSettings.getState().applyScene({
      mode: scene.mode,
      palette: scene.palette,
      bg: scene.bg,
      count: scene.count,
      force: scene.force,
      trail: scene.trail,
    });
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("vortex:scene", {
          detail: {
            code: scene.code,
            label: scene.label,
            note: scene.note,
          },
        }),
      );
      canvas.current?.pulse();
    }, 40);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (event.code === "KeyR" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        canvas.current?.resetParticles();
      } else if (event.code === "KeyC" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        canvas.current?.clearTrails();
      } else if (event.code === "KeyS" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        canvas.current?.capturePng();
      } else if (event.code === "Space") {
        event.preventDefault();
        canvas.current?.pulse();
      } else if (event.code === "Digit1") {
        setMovement("vortex");
      } else if (event.code === "Digit2") {
        setMovement("flow");
      } else if (event.code === "Digit3") {
        setMovement("orbit");
      } else if (event.code === "Digit4") {
        setMovement("wave");
      } else if (event.code === "KeyH" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setChromeHidden((value) => !value);
      } else if (event.code === "KeyI" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setPanelOpen((value) => !value);
      } else if (event.code === "Escape") {
        setPanelOpen(false);
      } else if (event.code === "KeyF" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        if (!document.fullscreenElement) {
          void document.documentElement.requestFullscreen?.();
        } else {
          void document.exitFullscreen?.();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canvas, setMovement]);

  const capture = () => {
    canvas.current?.capturePng();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  if (chromeHidden) {
    return (
      <button
        type="button"
        data-ui="chrome"
        data-testid="chrome-toggle"
        onClick={() => setChromeHidden(false)}
        aria-label={t("Mostrar interfaz")}
        title={t("Mostrar interfaz (H)")}
        className="v6-reveal pointer-events-auto absolute right-4 top-4 z-20"
      >
        <span aria-hidden="true" />
        UI · H
      </button>
    );
  }

  return (
    <>
      <header data-ui="chrome" className="v6-chrome pointer-events-none absolute inset-x-0 top-0 z-20">
        <a
          href="https://gracianb.github.io/GracianB/"
          className="v6-signature pointer-events-auto"
          aria-label="Gracián Baena"
        >
          <span className="v6-signature__name">VØRTICE</span>
          <span className="v6-signature__line" aria-hidden="true" />
          <span className="v6-signature__movement">
            {movement.roman} · {t(movement.name)}
          </span>
        </a>

        <div className="v6-actions pointer-events-auto">
          <div className="v6-preferences" role="group" aria-label={language === "es" ? "Idioma y tema" : "Language and theme"}>
            <button type="button" aria-label={language === "es" ? "Cambiar a inglés" : "Switch to Spanish"} onClick={() => useUiPreferences.getState().setLanguage(language === "es" ? "en" : "es")}>{language.toUpperCase()}</button>
            <button type="button" aria-label={language === "es" ? (theme === "dark" ? "Usar tema claro" : "Usar tema oscuro") : (theme === "dark" ? "Use light theme" : "Use dark theme")} aria-pressed={theme === "light"} onClick={() => useUiPreferences.getState().setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "☀" : "☾"}</button>
          </div>
          <AmbientToggle className="v6-icon-button" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("Compartir esta escena de Vórtice")}
            title={t("Compartir escena")}
            data-testid="btn-share"
            className="v6-icon-button"
            onClick={share}
          >
            <Share2 />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t(panelOpen ? "Ocultar instrumento" : "Mostrar instrumento")}
            title={t("Instrumento (I)")}
            aria-expanded={panelOpen}
            data-testid="instrument-toggle"
            className="v6-icon-button"
            onClick={() => setPanelOpen((value) => !value)}
          >
            <SlidersHorizontal />
          </Button>
        </div>
      </header>

      <nav
        data-ui="chrome"
        aria-label={t("Movimientos de Vórtice")}
        className={cn("v6-movement-rail", panelOpen && "is-panel-open")}
      >
        {MOVEMENTS.map((item) => {
          const active = item.id === mode;
          return (
            <button
              key={item.id}
              type="button"
              data-testid={`mode-${item.id}`}
              aria-current={active ? "true" : undefined}
              className={cn("v6-movement", active && "is-active")}
              onClick={() => setMovement(item.id)}
            >
              <span>{item.roman}</span>
              <strong>{t(item.name)}</strong>
            </button>
          );
        })}
      </nav>

      {saved || shared ? (
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center">
          <p
            role="status"
            aria-live="polite"
            className="v6-toast"
          >
            {t(saved ? "CAPTURA · LISTA" : "ESCENA · COPIADA")}
          </p>
        </div>
      ) : null}

      {panelOpen ? (
        <aside
          data-ui="chrome"
          data-testid="instrument-panel"
          aria-label={t("Instrumento de Vórtice")}
          className="v6-instrument"
        >
          <div className="v6-instrument__head">
            <div>
              <p>{t("INSTRUMENT / 06")}</p>
              <h2>VØRTICE</h2>
            </div>
            <button
              type="button"
              aria-label={t("Cerrar instrumento")}
              onClick={() => setPanelOpen(false)}
              className="v6-panel-close"
            >
              <X />
            </button>
          </div>

          <div className="v6-instrument__scroll">
            <section className="v6-section">
              <div className="v6-section__label">
                <span>01</span>
                <p>{t("MOVEMENTS")}</p>
              </div>
              <div className="v6-movement-list">
                {MOVEMENTS.map((item) => {
                  const active = item.id === mode;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={cn("v6-movement-card", active && "is-active")}
                      onClick={() => setMovement(item.id)}
                    >
                      <span>{item.roman}</span>
                      <div>
                        <strong>{t(item.name)}</strong>
                        <small>{t(item.description)}</small>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="v6-section">
              <div className="v6-section__label">
                <span>02</span>
                <p>{t("STATES")}</p>
              </div>
              <div className="v6-scene-grid">
                {MASTER_SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    type="button"
                    data-testid={`scene-${scene.id}`}
                    onClick={() => applyMasterScene(scene.id)}
                    className={cn(
                      "v6-scene",
                      activeScene?.id === scene.id && "is-active",
                    )}
                  >
                    <span>{scene.code}</span>
                    <strong>{scene.label}</strong>
                    <small>{t(scene.note)}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="v6-section">
              <div className="v6-section__label">
                <span>03</span>
                <p>{t("TUNE")}</p>
              </div>

              <InstrumentSlider
                label={t("Muestras")}
                value={fmt(count)}
                min={COUNT_MIN}
                max={COUNT_MAX}
                step={COUNT_STEP}
                current={count}
                onChange={(value) => useSettings.getState().setCount(value)}
              />
              <InstrumentSlider
                label={t("Energía")}
                value={`${fmt(force, 2)}×`}
                min={FORCE_MIN}
                max={FORCE_MAX}
                step={FORCE_STEP}
                current={force}
                onChange={(value) => useSettings.getState().setForce(value)}
              />
              <InstrumentSlider
                label={t("Estela")}
                value={fmt(trail, 2)}
                min={TRAIL_MIN}
                max={TRAIL_MAX}
                step={TRAIL_STEP}
                current={trail}
                onChange={(value) => useSettings.getState().setTrail(value)}
              />

              <div className="mt-5">
                <div className="v6-tune-row">
                  <span>{t("Paleta")}</span>
                  <strong>{t(paletteLabel).toUpperCase()}</strong>
                </div>
                <div className="v6-palette-row">
                  {PALETTES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={`${t("Paleta")} ${t(item.label)}`}
                      title={t(item.label)}
                      data-palette={item.id}
                      className={cn(
                        "v6-palette",
                        palette === item.id && "is-active",
                      )}
                      onClick={() => useSettings.getState().setPalette(item.id)}
                    >
                      <span />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <div className="v6-tune-row">
                  <span>{t("Fondo")}</span>
                  <strong>
                    {t(FIELD_BG_OPTIONS.find((item) => item.id === bg)?.label ??
                      (bg === "custom" ? "Custom" : bg)
                    ).toUpperCase()}
                  </strong>
                </div>
                <div className="v6-bg-row">
                  {FIELD_BG_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={`${t("Fondo")} ${t(item.label)}`}
                      title={t(item.label)}
                      className={cn(
                        "v6-bg",
                        bg === item.id && "is-active",
                      )}
                      style={{
                        background:
                          item.id === "void"
                            ? "#050506"
                            : item.id === "ink"
                              ? "#0c121c"
                              : item.id === "abyss"
                                ? "#071412"
                                : item.id === "slate"
                                  ? "#181a20"
                                  : item.id === "fog"
                                    ? "#1a1714"
                                    : "#e6e1d6",
                      }}
                      onClick={() =>
                        useSettings.getState().setBg(item.id as FieldBgId)
                      }
                    />
                  ))}
                  <label className={cn("v6-bg v6-bg--custom", bg === "custom" && "is-active")}>
                    <input
                      type="color"
                      value={customBg}
                      aria-label={t("Fondo personalizado")}
                      onChange={(event) =>
                        useSettings.getState().setCustomBg(event.target.value)
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="mt-5">
                <AmbientVolume />
              </div>
            </section>

            <section className="v6-section">
              <div className="v6-section__label">
                <span>04</span>
                <p>{t("FIELD")}</p>
              </div>
              <div className="v6-utility-grid">
                <Utility
                  testId="btn-clear"
                  label={t("Borrar")}
                  shortcut="C"
                  icon={<Eraser />}
                  onClick={() => canvas.current?.clearTrails()}
                />
                <Utility
                  testId="btn-reset"
                  label={t("Reiniciar")}
                  shortcut="R"
                  icon={<RotateCcw />}
                  onClick={() => canvas.current?.resetParticles()}
                />
                <Utility
                  testId="btn-capture"
                  label={t("Captura")}
                  shortcut="S"
                  icon={<Download />}
                  onClick={capture}
                />
                <Utility
                  label={t("Pantalla")}
                  shortcut="F"
                  icon={<Maximize />}
                  onClick={() => {
                    if (!document.fullscreenElement) {
                      void document.documentElement.requestFullscreen?.();
                    } else {
                      void document.exitFullscreen?.();
                    }
                  }}
                />
                <Utility
                  label={t("Lienzo")}
                  shortcut="H"
                  icon={<Focus />}
                  onClick={() => setChromeHidden(true)}
                />
              </div>
            </section>

            <nav className="v6-universes" aria-label={t("Otros universos de Gracián Baena")}>
              <a href="https://gracianb.github.io/systems-lab/" target="_blank" rel="noopener noreferrer">Systems Lab ↗</a>
              <a href="https://gracianb.github.io/systems-lab/#aigoritmo" target="_blank" rel="noopener noreferrer">{t("Aigoritmo · app local ↗")}</a>
              <a href="https://gracianb.github.io/professional-deck/" target="_blank" rel="noopener noreferrer">Deck ↗</a>
            </nav>

            <footer className="v6-instrument__footer">
              <span>
                {gl ? `${Math.round(fps)} FPS · ${renderDpr.toFixed(2)}×` : "WEBGL · INIT"}
              </span>
              <a
                href="https://gracianb.github.io/GracianB/"
                target="_blank"
                rel="noreferrer"
              >
                GRACIÁN BAENA · 2026
              </a>
            </footer>
          </div>
        </aside>
      ) : null}
    </>
  );
}

function InstrumentSlider({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="v6-slider-block">
      <div className="v6-tune-row">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[current]}
        onValueChange={([next]) => {
          if (typeof next === "number") onChange(next);
        }}
        aria-label={label}
      />
    </div>
  );
}

function Utility({
  testId,
  label,
  shortcut,
  icon,
  onClick,
}: {
  testId?: string;
  label: string;
  shortcut: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      className="v6-utility"
      onClick={onClick}
    >
      <span>{icon}</span>
      <strong>{label}</strong>
      <small>{shortcut}</small>
    </button>
  );
}
