<div align="center">

<a href="https://vortex-gilt-xi.vercel.app/"><img src="./public/vortex-cover.svg" width="100%" alt="VÓRTICE · campo generativo WebGL y trazos fluidos" /></a>

# VØRTICE

**Un instrumento visual. El movimiento lo decides tú.**

[**Abrir la experiencia ↗**](https://vortex-gilt-xi.vercel.app/) · [**Systems Lab ↗**](https://gracianb.github.io/systems-lab/) · [**Portafolio ↗**](https://gracianb.github.io/GracianB/)

React 19 · TypeScript · WebGL · Vite · interacción en tiempo real

</div>

---

## No es un vídeo: es un sistema que responde

Mueve el cursor, cambia el campo, modifica su intensidad o simplemente deja que el movimiento respire. El proyecto se ejecuta en el navegador y no requiere iniciar sesión.

| Cuatro movimientos | Seis estados maestros | Herramientas |
| --- | --- | --- |
| **1 Vórtice** · 2 Flujo · 3 Órbita · 4 Onda | VOID · AURORA · SOLAR · EMBER · ICE · PAPER | Paletas y densidad; audio ambiental; captura PNG; compartir escena; modo lienzo |

### Prueba estos controles

| Acción | Control |
| --- | --- |
| Cambiar movimiento | `1`, `2`, `3`, `4` |
| Pulso | `Espacio` |
| Abrir el instrumento | `I` |
| Interfaz mínima | `H` |
| Reiniciar / limpiar | `R` / `C` |
| Captura / pantalla completa | `S` / `F` |
| Audio ambiental | `M` |

**Diseñado también para móvil:** controles táctiles, ajuste de calidad, respeto a movimiento reducido y aviso cuando WebGL no está disponible. La URL de compartir conserva los parámetros de la escena.

## Ejecutar y verificar

Requiere **Node 24**.

```bash
npm ci
npm run dev
```

Abre [localhost:8080](http://localhost:8080/). Para validar una versión:

```bash
npm run quality
npm run test:browser
```

El primer comando verifica tipos, lint, pruebas, compilación y presupuesto de tamaño. El segundo valida el navegador real con Playwright. CI comprueba ambos en GitHub. La disponibilidad del despliegue de Vercel debe validarse **independientemente** de esos controles.

## Arquitectura y evidencia

- **`src/lib/particles.ts`:** motor WebGL, dinámica, renderizado y gestión de recursos.
- **`src/lib/settings.ts`:** estados y parámetros persistentes.
- **`src/components/particle-canvas.tsx`:** ciclo de vida, recuperación del contexto y fallback.
- **`src/components/control-dock.tsx`:** controles de instrumento y accesibilidad.
- **`src/lib/ambient.ts`:** capa sonora y respuesta del campo.
- **`scripts/`:** contratos, auditoría de seguridad, presupuesto, E2E y prueba de disponibilidad pública.

[**Certificado técnico V6**](RELEASE_V6.md) · [**Documentación ampliada**](docs/V6_REFERENCE.md) · [**Auditoría GitHub**](docs/REPOSITORY_REVIEW.md) · [**Cambios**](CHANGELOG.md) · [**CI**](https://github.com/GracianB/vortex/actions)

<sub>Una experiencia interactiva propia dentro del ecosistema GracianB. Las imágenes de portada explican la pieza, pero no sustituyen a la simulación viva.</sub>
