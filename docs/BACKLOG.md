# Backlog maestro — PUDU Outdoor Commerce

## Convenciones

- Prioridad: **P0** imprescindible para v1; **P1** importante antes de producción; **P2** mejora posterior.
- Estado inicial: `Pendiente`, `En curso`, `Bloqueado` o `Terminado`.
- Una historia solo pasa a `Terminado` con evidencia asociada en `ACCEPTANCE_MATRIX.md`.

## Épica A — Fundación y gobierno

| ID | Prioridad | Historia / entregable | Criterio de cierre | Estado |
|---|---|---|---|---|
| A-01 | P0 | Inicializar Next.js, TypeScript estricto y estructura modular | Build reproducible y convenciones documentadas | Pendiente |
| A-02 | P0 | Configurar PostgreSQL, Prisma y migraciones | Esquema versionado, migración limpia y datos demo | Pendiente |
| A-03 | P0 | Preparar Docker para web, worker y base de datos | Entorno local inicia con healthchecks correctos | Pendiente |
| A-04 | P0 | Mantener charter, riesgos, backlog y trazabilidad | Documentos vigentes y vinculados a criterios de aceptación | Terminado |
| A-05 | P1 | Crear registro de decisiones y manual operativo | Decisiones críticas y runbooks disponibles | Pendiente |

## Épica B — Marca, UX y contenido

| ID | Prioridad | Historia / entregable | Criterio de cierre | Estado |
|---|---|---|---|---|
| B-01 | P0 | Implementar sistema visual PUDU | Paleta, tipografía, retícula y componentes consistentes | Pendiente |
| B-02 | P0 | Crear navegación y estructura responsive | Todas las rutas públicas accesibles en móvil y escritorio | Pendiente |
| B-03 | P0 | Publicar inicio editorial y colección | Mensaje de marca claro y acceso a ocho productos demo | Pendiente |
| B-04 | P0 | Crear ficha de producto | Imágenes, precio, variantes, stock y CTA comprensibles | Pendiente |
| B-05 | P0 | Incorporar activos conceptuales reemplazables | Activos optimizados y marcados como provisionales | Pendiente |
| B-06 | P1 | Completar guía, FAQ, contacto y políticas | Contenido navegable, con campos legales pendientes señalados | Pendiente |
| B-07 | P0 | Cumplir accesibilidad base | Teclado, foco, contraste, zoom y movimiento reducido verificados | Pendiente |

## Épica C — Comercio y checkout

| ID | Prioridad | Historia / entregable | Criterio de cierre | Estado |
|---|---|---|---|---|
| C-01 | P0 | Gestionar carrito local persistente | Agregar, cambiar cantidad, eliminar y recuperar sesión | Pendiente |
| C-02 | P0 | Recalcular precios y stock en servidor | No se confía en valores enviados por el navegador | Pendiente |
| C-03 | P0 | Capturar datos de entrega como invitado | Validación clara y consentimiento aplicable | Pendiente |
| C-04 | P0 | Calcular despacho por zona y envío gratis | Tarifas y umbral configurables, total correcto | Pendiente |
| C-05 | P0 | Crear reserva transaccional de 30 minutos | Evita sobreventa y libera reservas vencidas | Pendiente |
| C-06 | P0 | Integrar Mercado Pago Checkout Pro de prueba | Preferencia creada en backend y retorno no confirma pago | Pendiente |
| C-07 | P0 | Procesar webhooks idempotentes | Firma, monto, moneda y referencia verificados | Pendiente |
| C-08 | P0 | Mostrar estado de pedido con token público | Acceso no enumerable y estados consistentes | Pendiente |
| C-09 | P1 | Enviar confirmaciones transaccionales | Correos de estado sin exponer datos innecesarios | Pendiente |

## Épica D — Operación y administración

| ID | Prioridad | Historia / entregable | Criterio de cierre | Estado |
|---|---|---|---|---|
| D-01 | P0 | Implementar acceso administrativo seguro | Sesión protegida, roles, bloqueo y TOTP del propietario | Pendiente |
| D-02 | P0 | Administrar catálogo, variantes y medios | Altas, cambios, archivo y validaciones auditables | Pendiente |
| D-03 | P0 | Administrar stock y zonas de despacho | Cambios persistentes y registro de auditoría | Pendiente |
| D-04 | P0 | Consultar y actualizar pedidos | Filtros, detalle, estado y trazabilidad | Pendiente |
| D-05 | P1 | Gestionar pagos inconsistentes | Estado `REVIEW` y procedimiento manual documentado | Pendiente |
| D-06 | P1 | Implementar carga a almacenamiento S3/R2 | Tipo/tamaño restringidos y URL persistente | Pendiente |

## Épica E — Seguridad, privacidad y calidad

| ID | Prioridad | Historia / entregable | Criterio de cierre | Estado |
|---|---|---|---|---|
| E-01 | P0 | Validar contratos con Zod y errores RFC 9457 | Entradas inválidas fallan de forma uniforme | Pendiente |
| E-02 | P0 | Aplicar CSP, HSTS, CSRF/origin checks y rate limiting | Controles verificados en integración | Pendiente |
| E-03 | P0 | Proteger PII y secretos | Sin secretos ni PII sensible en repositorio, logs o analítica | Pendiente |
| E-04 | P0 | Automatizar pruebas unitarias, integración y E2E | Flujos críticos y casos adversos cubiertos | Pendiente |
| E-05 | P0 | Auditar accesibilidad y navegadores objetivo | Sin defectos críticos/altos; Axe limpio | Pendiente |
| E-06 | P0 | Cumplir presupuestos de rendimiento y SEO | Lighthouse y Core Web Vitals dentro de objetivo | Pendiente |
| E-07 | P1 | Ejecutar escaneo de dependencias, código e imagen | Hallazgos críticos/altos resueltos o bloquean release | Pendiente |
| E-08 | P0 | Implementar consentimiento de analítica | GA4/Meta no cargan antes de aceptar | Pendiente |

## Épica F — Entrega y operación

| ID | Prioridad | Historia / entregable | Criterio de cierre | Estado |
|---|---|---|---|---|
| F-01 | P0 | Crear pipeline CI | Lint, tipos, pruebas, build y controles de seguridad obligatorios | Pendiente |
| F-02 | P0 | Desplegar staging en EasyPanel | Web, worker y PostgreSQL privados y saludables | Pendiente |
| F-03 | P0 | Incorporar logs, Sentry y healthchecks | Fallos detectables sin registrar PII sensible | Pendiente |
| F-04 | P0 | Configurar backups cifrados y retención | Restauración comprobada con evidencia | Pendiente |
| F-05 | P0 | Ensayar rollback | Commit anterior recuperable y procedimiento medido | Pendiente |
| F-06 | P1 | Configurar dominio, HTTPS y monitoreo externo | DNS y certificados válidos; alerta de caída comprobada | Bloqueado |
| F-07 | P0 | Publicar producción | Gates G1–G5 aprobados y credenciales reales validadas | Bloqueado |

## Secuencia de entrega

1. **Incremento 1 — Base:** A-01 a A-05 y B-01.
2. **Incremento 2 — Experiencia:** B-02 a B-07 y C-01.
3. **Incremento 3 — Comercio:** C-02 a C-09 y D-01 a D-05.
4. **Incremento 4 — Endurecimiento:** D-06, E-01 a E-08 y F-01.
5. **Incremento 5 — Operación:** F-02 a F-07.

`F-06` y `F-07` permanecen bloqueados hasta recibir dominio, datos legales, catálogo final y credenciales productivas.
