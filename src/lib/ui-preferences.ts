import { create } from "zustand";

type Language = "es" | "en";
type Theme = "dark" | "light";
function preference(key: string): string | null {
  try { return typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get(key) || localStorage.getItem(`vortex-ui-${key}`); } catch { return null; }
}
function save(key: string, value: string) {
  try { localStorage.setItem(`vortex-ui-${key}`, value); } catch { /* Preferences still work without storage. */ }
}
export const useUiPreferences = create<{
  language: Language; theme: Theme;
  setLanguage: (value: Language) => void; setTheme: (value: Theme) => void;
}>((set) => ({
  language: preference("lang") === "en" ? "en" : "es",
  theme: preference("theme") === "light" ? "light" : "dark",
  setLanguage: (language) => { save("lang", language); set({language}); },
  setTheme: (theme) => { save("theme", theme); set({theme}); },
}));
const dictionary: Record<string, string> = {
  "Mostrar interfaz": "Show interface",
  "Mostrar interfaz (H)": "Show interface (H)",
  "Compartir esta escena de Vórtice": "Share this Vórtice scene",
  "Compartir escena": "Share scene",
  "Ocultar instrumento": "Hide instrument",
  "Mostrar instrumento": "Show instrument",
  "Instrumento (I)": "Instrument (I)",
  "Movimientos de Vórtice": "Vórtice movements",
  "CAPTURA · LISTA": "CAPTURE · READY",
  "ESCENA · COPIADA": "SCENE · COPIED",
  "Instrumento de Vórtice": "Vórtice instrument",
  "Cerrar instrumento": "Close instrument",
  "Muestras": "Samples",
  "Energía": "Energy",
  "Estela": "Trail",
  "Paleta": "Palette",
  "Fondo": "Background",
  "Fondo personalizado": "Custom background",
  "Borrar": "Clear",
  "Reiniciar": "Reset",
  "Captura": "Capture",
  "Pantalla": "Fullscreen",
  "Lienzo": "Canvas",
  "Otros universos de Gracián Baena": "Other universes by Gracián Baena",
  "Aigoritmo · app local ↗": "Aigoritmo · local app ↗",
  "Silenciar": "Mute",
  "Activar sonido": "Enable sound",
  "Silenciar (M)": "Mute (M)",
  "Sonido (M)": "Sound (M)",
  "Volumen": "Volume",
  "Campo de datos WebGL": "WebGL particle field",
  "Vórtice — instrumento visual generativo WebGL": "Vórtice — generative WebGL visual instrument",
  "VÓRTICE": "VORTEX",
  "FLUJO": "FLOW",
  "ÓRBITA": "ORBIT",
  "ONDA": "WAVE",
  "ATRAER": "ATTRACT",
  "DERIVAR": "DRIFT",
  "GRAVITAR": "GRAVITATE",
  "RESONAR": "RESONATE",
  "Atracción, torsión y densidad alrededor de tu gesto.": "Attraction, twist and density around your gesture.",
  "Una corriente continua que se pliega alrededor del movimiento.": "A continuous current folding around movement.",
  "Cuerpos, radios y gravedad en torno a un centro inestable.": "Bodies, radii and gravity around an unstable centre.",
  "Impulsos que atraviesan el campo y vuelven convertidos en forma.": "Impulses crossing the field and returning as form.",
  "silencio / atracción": "silence / attraction",
  "deriva / respiración": "drift / breath",
  "gravedad / calor": "gravity / warmth",
  "pulso / fricción": "pulse / friction",
  "resonancia / aire": "resonance / air",
  "materia / calma": "matter / calm",
  "Espectro": "Spectrum",
  "Brasa": "Ember",
  "Hielo": "Ice",
  "Plata": "Silver",
  "Vacío": "Void",
  "Tinta": "Ink",
  "Abismo": "Abyss",
  "Pizarra": "Slate",
  "Niebla": "Fog",
  "Papel": "Paper",
  "TOCA · ARRASTRA · ESCUCHA": "TOUCH · DRAG · LISTEN",
  "MOVEMENTS": "Movimientos",
  "STATES": "Escenas",
  "TUNE": "Ajustes",
  "FIELD": "Campo",
  "INSTRUMENT / 06": "Instrumento / 06",
  "GENERATIVE FIELD / 2026": "Campo generativo / 2026",
  "MOVE TO DISTURB THE FIELD": "Mueve para transformar el campo",
  "A VISUAL INSTRUMENT BY GRACIÁN BAENA": "Un instrumento visual de Gracián Baena",
  "BY GRACIÁN BAENA": "Por Gracián Baena",
  "MOVE · HOLD · DISTURB · SPACE TO PULSE": "MUEVE · MANTÉN · TRANSFORMA · ESPACIO PARA PULSAR"
};
const englishKeys = new Set(["MOVEMENTS", "STATES", "TUNE", "FIELD", "INSTRUMENT / 06", "GENERATIVE FIELD / 2026", "MOVE TO DISTURB THE FIELD", "A VISUAL INSTRUMENT BY GRACI\u00c1N BAENA", "BY GRACI\u00c1N BAENA", "MOVE \u00b7 HOLD \u00b7 DISTURB \u00b7 SPACE TO PULSE"]);
export function useUiText() {
  const language = useUiPreferences((state) => state.language);
  return (text: string) => englishKeys.has(text) ? (language === "es" ? dictionary[text] : text) : (language === "en" ? dictionary[text] || text : text);
}
