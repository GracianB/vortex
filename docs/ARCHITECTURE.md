# Arquitectura de Vórtice

Vórtice es una experiencia **React 19 + TypeScript** compilada con **Vite**, con rendering WebGL dentro de un único lienzo.

```text
src/
├── app.tsx                    presentación, navegación y experiencia
├── components/
│   ├── particle-canvas.tsx    ciclo de vida del contexto WebGL
│   ├── control-dock.tsx       instrumento y controles
│   └── ambient-audio.tsx      audio opcional
└── lib/
    ├── particles.ts           simulación y motor de partículas
    ├── settings.ts            preferencias y escenas
    ├── render-quality.ts      adaptación al rendimiento
    ├── movements.ts           reglas de movimiento
    └── ambient.ts             audio
public/                        imagen social, recursos y pista ambiental
scripts/                       contratos, presupuesto, E2E y smoke externo
.github/workflows/             Quality y Production Smoke (manual)
```

### Decisiones

- El lienzo es el centro visual; `I` revela el instrumento bajo demanda, `H` lo esconde.
- El modelo/estado permite reproducir configuraciones y compartir URLs.
- La capa del componente gestiona restauración y pérdida de contexto WebGL; un fallo muestra una explicación en vez de fingir un render.
- La calidad se adapta a la capacidad del dispositivo; `prefers-reduced-motion` tiene precedencia sobre la animación ornamental.
- El modo embed es una opción de presentación. Systems Lab lo inserta **solo bajo acción del visitante**.
- Modo claro/oscuro del **póster en Systems Lab** no equivale a cambiar el motor de Vórtice; los estados Paper, Void, etc. pertenecen al instrumento.

Mantener la página de entrada como experiencia y el README como índice, no como una segunda aplicación interactiva con animaciones externas.
