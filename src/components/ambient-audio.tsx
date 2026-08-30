import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const SRC = "/audio/sustained-focus.mp3";
const KEY = "vortex-music";

export function AmbientToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onRef = useRef(true);
  const [on, setOn] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === "0") {
        onRef.current = false;
        setOn(false);
      }
    } catch {
      /* ignore */
    }

    const audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.4;
    audioRef.current = audio;

    const start = () => {
      if (!onRef.current) return;
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

  const toggle = () => {
    const next = !onRef.current;
    onRef.current = next;
    setOn(next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (next) void audio.play().catch(() => {});
    else audio.pause();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.code === "KeyM" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label={on ? "Silenciar ambiente" : "Activar ambiente"}
      title={on ? "Silenciar (M)" : "Ambiente (M)"}
      aria-pressed={on}
      onClick={toggle}
    >
      {on ? <Volume2 /> : <VolumeX />}
    </Button>
  );
}
