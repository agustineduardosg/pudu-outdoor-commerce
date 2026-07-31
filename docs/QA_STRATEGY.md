# Estrategia de calidad — PUDU Outdoor Commerce

## Objetivo y gates

La calidad se evalúa como una condición de salida, no como una revisión posterior. Un cambio puede llegar a `main` solo cuando lint, tipos, pruebas, build, auditoría de dependencias y escaneos de seguridad están aprobados. El lanzamiento exige además:

- cero defectos críticos o altos abiertos;
- Lighthouse móvil: rendimiento ≥ 90; accesibilidad, buenas prácticas y SEO ≥ 95;
- LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1;
- axe sin impactos `critical` o `serious`;
- checkout de prueba aprobado, pendiente y rechazado verificado contra Mercado Pago;
- restauración de backup y rollback ensayados.

Las pruebas automáticas reducen riesgo, pero no reemplazan la revisión con lector de pantalla, navegación de teclado, contraste visual, contenido legal ni dispositivos físicos.

## Pirámide y cobertura

| Nivel | Responsabilidad | Ejecución |
| --- | --- | --- |
| Unitarias | reglas de dinero CLP, totales, stock, reservas, estados, validadores y firma de webhook | cada PR |
| Integración | PostgreSQL real, transacciones concurrentes, idempotencia, expiración de reservas y adaptadores externos simulados | cada PR |
| API | schemas, RFC 9457, autenticación, no-cache y errores | cada PR |
| E2E | descubrimiento, variante, carrito persistente, checkout invitado y panel protegido | cada PR |
| Accesibilidad | axe, teclado, foco, landmarks y reducción de movimiento | cada PR |
| Mobile | breakpoints, táctil, 44 px, menús y ausencia de overflow | cada PR |
| Rendimiento | presupuestos Playwright y Lighthouse con tres ejecuciones | cada PR |
| Cross-browser | Chromium, Firefox, WebKit, Chrome Android y Safari iOS emulados | `main` y antes de release |
| Seguridad | CodeQL, auditoría npm, Trivy, headers, CORS, webhook y acceso administrativo | cada PR / semanal |
| Manual | VoiceOver/NVDA, zoom 200 %, alto contraste, dispositivos, copy y políticas | antes de release |

## Datos y aislamiento

- La suite usa una base PostgreSQL exclusiva y efímera.
- Las migraciones se aplican antes de probar y el seed debe ser determinista: exactamente ocho productos conceptuales activos.
- Cada prueba que cree pedidos usa identificadores aleatorios y elimina sus datos; ninguna prueba depende del orden de ejecución.
- Mercado Pago, Resend, R2 y Sentry se prueban con sandbox o adaptadores falsos. No se simula la API propia cuando el propósito es validar el contrato interno.
- Credenciales de QA se inyectan por variables protegidas. Nunca se incluyen tokens, cookies o datos personales en fixtures, trazas o capturas.

## Matriz de aceptación

### Comercio

- El servidor recalcula precio, despacho e IVA y descarta cualquier precio enviado por el navegador.
- Dos checkouts simultáneos sobre la última unidad no pueden venderla dos veces.
- La reserva permanece activa 30 minutos y se libera de forma idempotente.
- Un webhook repetido o fuera de orden no duplica pago, pedido, correo ni movimiento de stock.
- El retorno del navegador no cambia el pedido a pagado.
- Monto, moneda y referencia se cotejan con Mercado Pago antes de consumir stock.
- Un pago tardío o inconsistente pasa a `REVIEW`.

### Administración

- `/admin` y `/api/admin/*` requieren sesión y rol en el servidor.
- El propietario necesita TOTP; intentos fallidos se limitan y registran.
- Cambios de catálogo, stock, despacho y pedido dejan auditoría sin PII sensible.
- Respuestas privadas usan `Cache-Control: private, no-store`.

### Experiencia

- El recorrido principal funciona con teclado y con zoom de 200 %.
- Mensajes de error identifican el campo, explican la corrección y no dependen del color.
- Imágenes relevantes tienen texto alternativo; las decorativas usan `alt=""`.
- Todos los controles táctiles principales miden al menos 44 × 44 px.
- La preferencia `prefers-reduced-motion` elimina animaciones no esenciales.

## Uso local

Requisitos adicionales de desarrollo:

- `@playwright/test`
- `@axe-core/playwright`
- `@lhci/cli`

Comandos esperados:

```text
npx prisma migrate deploy
npx prisma db seed
npx playwright install
npx playwright test --project=chromium
npx playwright test --project=accessibility
npx playwright test --project=api
PW_FULL_BROWSERS=1 npx playwright test
TEST_PRODUCTION=1 npx playwright test --project=performance
npm run build
npx lhci autorun --config=tests/lighthouse/lighthouserc.cjs
```

En Windows PowerShell, definir la matriz completa con:

```powershell
$env:PW_FULL_BROWSERS="1"
npx playwright test
$env:TEST_PRODUCTION="1"
npx playwright test --project=performance
```

Los artefactos quedan en `playwright-report/`, `test-results/` y `.lighthouseci/`. Ante una falla, revisar primero la traza de Playwright y el JSON de axe o rendimiento adjunto.

## Triage

| Severidad | Definición | SLA antes de producción |
| --- | --- | --- |
| Crítica | pérdida/corrupción de datos, cobro o stock incorrecto, bypass de auth, secreto expuesto | bloquea todo; corrección inmediata |
| Alta | checkout inutilizable, accesibilidad seria, vulnerabilidad explotable, caída de ruta principal | bloquea release |
| Media | degradación con alternativa razonable, navegador secundario, contenido incorrecto no legal | corregir o aceptar por escrito |
| Baja | detalle cosmético sin impacto funcional | backlog priorizado |

Toda excepción a un gate registra responsable, motivo, riesgo, compensación y fecha de vencimiento.
