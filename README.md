# Vórtice

Campo de datos WebGL: miles de muestras que se arremolinan hacia el cursor, con estelas, paletas y captura de pantalla.

## Probarlo en local

Necesitas Node.js 22+.

```bash
git clone https://github.com/GracianB/vortex.git
cd vortex
npm install
npm run dev
```

Abre [http://localhost:8080](http://localhost:8080).

## Controles

- Mueve el puntero para deformar el campo
- Mantén pulsado para inyectar energía
- Campos: **Vórtice**, **Flujo**, **Órbita**, **Onda**
- Ajusta muestras, energía, estela, paleta y fondo
- `C` borra estelas · `R` reinicia · `S` descarga una captura

## Publicar

Importa este repositorio en [Vercel](https://vercel.com/new) (el build ya usa el preset de Vercel). Comando de build: `npm run build`.
