# Vórtice

Campo de datos WebGL: miles de muestras que se arremolinan hacia el cursor, con estelas, paletas y captura de pantalla.

Parte del PLAY de [Gracián Baena](https://gracianb.github.io/GracianB/#play) · [systems-lab](https://gracianb.github.io/systems-lab/)

## Probarlo en local

Node.js 22+.

```bash
git clone https://github.com/GracianB/vortex.git
cd vortex
npm install
npm run dev
```

Abre [http://localhost:8080](http://localhost:8080).

## Publicar (Vercel Hobby = gratis)

Vórtice no cabe en GitHub Pages (SSR + WebGL). El plan **Hobby de Vercel es 0 €** para proyectos personales.

1. Entra en [vercel.com/new](https://vercel.com/new) con GitHub
2. Importa `GracianB/vortex`
3. Build: `npm run build` (ya es el default)
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GracianB/vortex)

Cuando tengas la URL (`algo.vercel.app`), se cambia el botón PLAY del hub.

## Controles

- Mueve el puntero para deformar el campo
- Mantén pulsado para inyectar energía
- Campos: **Vórtice**, **Flujo**, **Órbita**, **Onda**
- Ajusta muestras, energía, estela, paleta y fondo
- `C` borra estelas · `R` reinicia · `S` descarga una captura
