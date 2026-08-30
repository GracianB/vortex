# Vórtice

Campo de datos WebGL: miles de muestras que se arremolinan hacia el cursor, con estelas, paletas y captura de pantalla.

**Live:** [vortex-gilt-xi.vercel.app](https://vortex-gilt-xi.vercel.app/)

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

## Live

https://vortex-gilt-xi.vercel.app/

Vercel Hobby. Cada `git push` a `main` vuelve a publicar.

## Controles

- Mueve el puntero para deformar el campo
- Mantén pulsado para inyectar energía
- Campos: **Vórtice**, **Flujo**, **Órbita**, **Onda**
- Ajusta muestras, energía, estela, paleta y fondo
- `C` borra estelas · `R` reinicia · `S` descarga una captura
