import type { FieldMode, Preset } from "./settings.ts";

export type Movement = {
  id: FieldMode;
  roman: "I" | "II" | "III" | "IV" | "V";
  name: string;
  verb: string;
  description: string;
};

export const MOVEMENTS: Movement[] = [
  {
    id: "vortex",
    roman: "I",
    name: "VÓRTICE",
    verb: "ATRAER",
    description: "Atracción, torsión y densidad alrededor de tu gesto.",
  },
  {
    id: "flow",
    roman: "II",
    name: "FLUJO",
    verb: "DERIVAR",
    description: "Una corriente continua que se pliega alrededor del movimiento.",
  },
  {
    id: "orbit",
    roman: "III",
    name: "ÓRBITA",
    verb: "GRAVITAR",
    description: "Cuerpos, radios y gravedad en torno a un centro inestable.",
  },
  {
    id: "wave",
    roman: "IV",
    name: "ONDA",
    verb: "RESONAR",
    description: "Impulsos que atraviesan el campo y vuelven convertidos en forma.",
  },
  {
    id: "chaos",
    roman: "V",
    name: "CAOS",
    verb: "COLAPSAR",
    description: "Turbulencia browniana: repulsión, colisión y entropía total.",
  },
];

export const MASTER_SCENES: Array<
  Preset & { code: string; note: string }
> = [
  {
    id: "void",
    code: "00",
    label: "VOID",
    note: "silencio / atracción",
    mode: "vortex",
    palette: "ice",
    bg: "void",
    count: 7600,
    force: 1.15,
    trail: 0.95,
  },
  {
    id: "aurora-v6",
    code: "01",
    label: "AURORA",
    note: "deriva / respiración",
    mode: "flow",
    palette: "aurora",
    bg: "abyss",
    count: 9400,
    force: 1.05,
    trail: 0.95,
  },
  {
    id: "solar-v6",
    code: "02",
    label: "SOLAR",
    note: "gravedad / calor",
    mode: "orbit",
    palette: "solar",
    bg: "void",
    count: 9800,
    force: 1.2,
    trail: 0.94,
  },
  {
    id: "ember-v6",
    code: "03",
    label: "EMBER",
    note: "pulso / fricción",
    mode: "wave",
    palette: "ember",
    bg: "ink",
    count: 7800,
    force: 1.35,
    trail: 0.91,
  },
  {
    id: "ice-v6",
    code: "04",
    label: "ICE",
    note: "resonancia / aire",
    mode: "wave",
    palette: "ice",
    bg: "void",
    count: 6800,
    force: 0.9,
    trail: 0.96,
  },
  {
    id: "paper-v6",
    code: "05",
    label: "PAPER",
    note: "materia / calma",
    mode: "vortex",
    palette: "silver",
    bg: "paper",
    count: 5600,
    force: 0.85,
    trail: 0.88,
  },
  {
    id: "storm-v7",
    code: "06",
    label: "STORM",
    note: "caos / tormenta",
    mode: "chaos",
    palette: "spectrum",
    bg: "slate",
    count: 14000,
    force: 2.1,
    trail: 0.82,
  },
  {
    id: "galaxy-v7",
    code: "07",
    label: "GALAXY",
    note: "nebulosa / infinito",
    mode: "orbit",
    palette: "nebula",
    bg: "void",
    count: 16000,
    force: 1.0,
    trail: 0.96,
  },
];

export function movementFor(mode: FieldMode) {
  return MOVEMENTS.find((movement) => movement.id === mode) ?? MOVEMENTS[0];
}
