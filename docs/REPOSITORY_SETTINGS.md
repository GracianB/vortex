# Vórtice · revisión administrativa de GitHub

Inspección del **19 de octubre de 2026**. Este documento informa sobre los ajustes observados: no implica que se hayan modificado.

**Confirmado:** repositorio público; rama principal `main`; workflows `Vórtice Quality` (tipos, lint, unitarios, build, dependencias y E2E Chromium) y `Production Smoke` (manual). Issues, Wiki y Projects estaban activados; `delete_branch_on_merge` desactivado en la revisión. Los tests de la versión actual están en CI, pero **un Quality verde no acredita automáticamente el despliegue en Vercel**.

## Ajustes que debe aplicar un administrador

1. En **Settings → General → Pull Requests**, activar **Automatically delete head branches** tras merge.
2. En **Settings → Rules / Branches**, proteger `main`, impedir force-push y exigir los trabajos de Quality y Browser E2E que correspondan.
3. En **Settings → Security**, comprobar **secret scanning**, Dependabot alerts y actualizaciones de dependencias disponibles en el plan.
4. Si Wiki y Projects no tienen contenido activo, desactivarlos para evitar mantenimiento duplicado; conservar Issues para incidencias reales.
5. Ejecutar el workflow **Production Smoke** después del despliegue en Vercel para confirmar la URL externa.

La conexión de GitHub usada en esta intervención permite cambiar archivos y PRs, pero **no expone acciones para modificar esos ajustes administrativos**. No se ha alterado la visibilidad ni los permisos.
