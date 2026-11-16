# Guía de interacción avanzada

| Entrada | Acción |
| --- | --- |
| Puntero / Touch | Dirige la atracción gravitacional del campo |
| Pulsar y arrastrar | Ejerce atracción y genera ondas de choque locales |
| Inclinación (Giroscopio) | En móviles/tablets, inclinar el dispositivo orienta la gravedad física |
| `1` a `7` | Vórtice, Flujo, Órbita, Onda, Caos, Singularidad, Supernova |
| `Espacio` | Dispara pulso gravitacional y onda de choque supersónica |
| `P` | Alterna aleatoriamente entre las 11 escenas maestras curadas |
| `V` | Graba 5 segundos de vídeo cinemático WebM a 60 FPS |
| `S` | Descarga captura de alta fidelidad PNG |
| `C` | Limpia el búfer de estelas |
| `R` | Reinicia y dispersa las partículas |
| `M` | Activa o silencia el audio ambiental y el sintetizador armónico |
| `I` | Abre o pliega el panel de instrumentos |
| `H` | Modo inmersivo: oculta la interfaz y deja solo el lienzo |
| `F` | Alterna pantalla completa |

El panel controla energía, densidad (hasta 32.000 partículas), estelas, movimiento, paletas cromáticas y fondos. Los **once estados maestros** son Void, Aurora, Solar, Ember, Ice, Paper, Storm, Galaxy, Singularity, Supernova y Celestial.

### Accesibilidad y rendimiento

- En móvil el control táctil y giroscópico está activo sin requerir teclado físico.
- El sistema adapta la resolución de renderizado al DPR del dispositivo y respeta la preferencia de movimiento reducido.
- El audio incluye síntesis armónica adaptativa basada en Web Audio API junto a la pista ambiental.
- Si WebGL no está disponible, se muestra un estado de fallo comprensible sin romper la aplicación.
- Compartir genera enlaces exactos con el estado completo de la simulación mediante parámetros URL.

[Volver al README](../README.md).
