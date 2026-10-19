# Validación de release y producción

**Versión técnica del paquete:** `6.0.0` (no se reetiqueta a «V1»).

### Calidad del código

En CI, `.github/workflows/quality.yml` ejecuta TypeScript, lint, unitarios, build, auditoría de dependencias y Chromium E2E. Último flujo aprobado consultado antes de esta mejora documental: [Vórtice Quality · 14 Oct 2026](https://github.com/GracianB/vortex/actions/runs/38500738368).

### Producción

Existe `.github/workflows/production-smoke.yml` y una ejecución [Production Smoke aprobada · 7 Oct 2026](https://github.com/GracianB/vortex/actions/runs/37691075866). **Ese chequeo corresponde al commit de esa fecha**: no acredita por sí solo los cambios posteriores ni sustituye probar la URL desplegada hoy. La documentación debe conservar esta distinción.

Ejecución manual desde la raíz:

```bash
npm ci
npm run quality
npm run test:browser
npm run smoke:live
```

`npm run smoke:live` accede a un recurso de red y puede fallar por despliegue, conectividad o disponibilidad del proveedor. En GitHub, `Vórtice Production Smoke` es un workflow manual.

[Certificado histórico](../RELEASE_V6.md) · [README](../README.md).
