import type { ErrorComponentProps } from "@tanstack/react-router";
import { RefreshCcw, TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-7 text-center shadow-[0_24px_80px_-32px_rgba(122,243,255,0.35)]">
        <span
          className="mx-auto grid size-12 place-items-center rounded-full border border-[color-mix(in_srgb,#7af3ff_35%,transparent)] text-[#7af3ff]"
          aria-hidden="true"
        >
          <TriangleAlert className="size-5" strokeWidth={1.8} />
        </span>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#7af3ff]">
          Vórtice · Runtime
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-display">
          El campo se ha detenido
        </h1>
        <p className="mx-auto mt-3 max-w-md break-words text-sm leading-relaxed text-muted-foreground">
          {error.message ||
            "Ha ocurrido un error inesperado al iniciar la experiencia."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mx-auto mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#7af3ff] px-4 text-sm font-semibold text-[#06070a] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7af3ff]"
        >
          <RefreshCcw className="size-4" />
          Reiniciar experiencia
        </button>
      </section>
    </main>
  );
}
