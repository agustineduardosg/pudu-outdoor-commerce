# Aceptación local

Fecha: 30 de julio de 2026  
Decisión: **aprobación técnica y visual condicionada**

## Evidencia aprobada

- Compilación de producción: 25 rutas.
- Lint y TypeScript estricto: sin errores.
- Unitarias: 11/11.
- Contratos API demo: 6/6.
- Navegador final sobre producción: 29/29.
- Axe: 7/7, sin incidencias críticas o serias.
- Seguridad de navegador: 6/6.
- Experiencia móvil: 7/7.
- Dependencias productivas: 0 vulnerabilidades.
- Lighthouse móvil: rendimiento 91, accesibilidad 100, buenas prácticas 100 y SEO 100.

El LCP simulado de Lighthouse fue 3,4 s; el presupuesto Playwright sobre producción aprobó el límite de 2,5 s. Debe repetirse con tres mediciones en staging.

## Condiciones antes de publicar

1. Habilitar WSL/Virtual Machine Platform y reiniciar Windows.
2. Validar Docker Compose con PostgreSQL, migraciones, worker, outbox y restauración.
3. Completar Mercado Pago sandbox con credenciales válidas.
4. Recibir aprobación visual del propietario.
5. Sustituir datos, políticas, catálogo, precios, stock y tarifas conceptuales.

Hasta cumplir estas condiciones no se publica en GitHub ni EasyPanel.
