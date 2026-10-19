# Vórtice · auditoría de repositorio y límites de publicación

Última revisión de GitHub: 19 de octubre de 2026.

## Confirmado en el repositorio

- **Público**, rama principal `main`, workflow Quality activo (tests, TypeScript, ESLint, build, budget, auditoría de dependencias, Chromium).
- V6 consta como release técnico en `RELEASE_V6.md`.
- El código es React/TypeScript con render WebGL; **no** es un vídeo ni una captura estática.
- `npm run smoke:live` y workflow `production-smoke.yml` verifican producción cuando se ejecutan.
- El último Quality disponible se completó en verde; esto **no verifica** por sí mismo que Vercel haya publicado el commit.

## Ajustes que requieren una acción administrativa en GitHub

La conexión permite revisar archivos y PRs, pero no cambiar de forma segura los ajustes administrativos del repositorio desde esta intervención.

- Activar **borrado automático de ramas tras merge**.
- Exigir al menos Quality y Browser E2E en PR a `main`, evitando push directo si hay protección de rama.
- Activar/consultar **secret scanning**, **Dependabot alerts** y actualización de dependencias si están disponibles.
- Desactivar **Wiki** y **Projects** si no hay contenido que mantener; mantener **Issues** para bugs reales.
- Mantener la URL de Vercel como homepage solo tras comprobar el despliegue con `npm run smoke:live`.

No se cambian permisos, secretos ni disponibilidad del despliegue mediante documentación.
