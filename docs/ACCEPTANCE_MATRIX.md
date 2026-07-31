# Matriz de aceptación y trazabilidad — PUDU Outdoor Commerce

## Uso

- Estado: `Pendiente`, `Cumple`, `No cumple` o `No aplica`.
- Todo criterio P0 es obligatorio. La evidencia debe ser reproducible y enlazarse desde el informe QA.
- G3 exige cero defectos críticos o altos; G5 exige además la aprobación comercial y legal del propietario.

| ID | Requisito trazado | Criterio verificable | Evidencia mínima | Gate | Responsable | Estado |
|---|---|---|---|---|---|---|
| AC-01 | B-01, B-02, B-03 | Inicio, colección y navegación responden correctamente en móvil, tablet y escritorio | Capturas + prueba E2E | G2 | UX/Frontend | Cumple |
| AC-02 | B-04 | La ficha muestra precio CLP, imágenes, talla, color, stock y CTA; impide variantes inválidas | E2E de producto | G2 | Frontend/QA | Cumple |
| AC-03 | C-01 | El carrito permite agregar, editar, eliminar y persiste al recargar | E2E + prueba de almacenamiento | G2 | Frontend/QA | Cumple |
| AC-04 | C-02, E-01 | Alterar precio o total en el cliente no cambia el total calculado por servidor | Prueba de integración adversa | G3 | Backend/QA | Cumple |
| AC-05 | C-03, C-04 | Checkout valida datos, zona, tarifa y umbral de envío gratis | E2E con casos válidos e inválidos | G3 | Backend/QA | Pendiente |
| AC-06 | C-05 | Dos compras concurrentes no venden más stock que el disponible | Prueba de concurrencia | G3 | Backend/QA | Pendiente |
| AC-07 | C-05 | Una reserva no pagada se libera tras 30 minutos sin afectar otra reserva | Prueba del worker con reloj controlado | G3 | Backend/QA | Pendiente |
| AC-08 | C-06 | La preferencia Mercado Pago se crea en backend y PUDU no recibe datos de tarjeta | Log redactado + prueba sandbox | G3 | Backend | Pendiente |
| AC-09 | C-07 | Retorno del navegador no confirma pago; solo la verificación del proveedor cambia el estado | Integración sandbox | G3 | Backend/QA | Pendiente |
| AC-10 | C-07 | Webhooks duplicados, inválidos o desordenados no duplican pedido, pago ni stock | Suite de integración | G3 | Backend/QA | Pendiente |
| AC-11 | C-07, D-05 | Monto, moneda o referencia discordantes llevan el pedido a `REVIEW` | Casos adversos automatizados | G3 | Backend/QA | Pendiente |
| AC-12 | C-08 | Estado del pedido requiere token aleatorio y no permite enumeración | Prueba de autorización | G3 | Seguridad/QA | Cumple |
| AC-13 | D-01 | Panel exige sesión, rol y TOTP para propietario; aplica bloqueo por intentos | E2E de autenticación | G3 | Seguridad/QA | Pendiente |
| AC-14 | D-02, D-03, D-04 | Catálogo, stock, despacho y pedidos pueden administrarse con auditoría | E2E admin + registro de auditoría | G3 | Backend/QA | Pendiente |
| AC-15 | E-02 | CSP, HSTS, cookies seguras, CSRF/origin checks y rate limiting están activos | Pruebas de cabeceras e integración | G3 | Seguridad | Cumple |
| AC-16 | E-03, E-07 | Repositorio, imagen, logs y analítica no contienen secretos ni PII sensible | Escáneres + revisión dirigida | G3 | Seguridad | Cumple |
| AC-17 | B-07, E-05 | Uso completo con teclado, foco visible, áreas ≥ 44 px, zoom 200 % y movimiento reducido | Checklist manual + Axe | G3 | UX/QA | Cumple |
| AC-18 | E-05 | Axe no reporta incidencias críticas o serias | Reporte automatizado | G3 | QA | Cumple |
| AC-19 | E-05 | Flujos críticos funcionan en Chrome, Edge, Firefox, Safari, iOS Safari y Chrome Android | Matriz cross-browser | G3 | QA | Pendiente |
| AC-20 | E-06 | Lighthouse móvil logra rendimiento ≥ 90 y accesibilidad, buenas prácticas y SEO ≥ 95 | Reporte Lighthouse CI | G3 | Frontend/QA | Cumple |
| AC-21 | E-06 | LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1 en escenario acordado | Lighthouse/telemetría de staging | G4 | Frontend/DevOps | Pendiente |
| AC-22 | E-08 | GA4 y Meta Pixel no generan solicitudes antes del consentimiento y pueden revocarse | Captura de red automatizada/manual | G3 | Frontend/QA | Pendiente |
| AC-23 | F-01 | CI ejecuta formato, lint, tipos, pruebas, build, CodeQL, auditoría, Trivy y Lighthouse | Ejecución verde protegida | G4 | DevOps | Pendiente |
| AC-24 | A-03, F-02 | Web, worker y PostgreSQL levantan en contenedores; live/ready reflejan estado real | Logs + healthchecks | G4 | DevOps | Pendiente |
| AC-25 | F-03 | Error de prueba llega a Sentry y logs JSON omiten PII sensible | Evidencia de alerta y log | G4 | DevOps | Pendiente |
| AC-26 | F-04 | Backup cifrado cumple retención y puede restaurarse en una base limpia | Acta de simulacro | G4 | DevOps | Pendiente |
| AC-27 | F-05 | Se recupera el commit anterior sin pérdida de integridad y migraciones avanzan hacia delante | Acta de rollback cronometrado | G4 | DevOps | Pendiente |
| AC-28 | B-05, R-07 | Todo texto, precio o activo provisional está identificado y no atribuye prestaciones no verificadas | Revisión editorial | G1/G5 | Producto | Cumple |
| AC-29 | B-06, R-01 | Páginas legales, contacto, políticas y datos del operador están aprobados | Aprobación escrita del propietario | G5 | Propietario PUDU | Pendiente |
| AC-30 | F-06, F-07 | Dominio, HTTPS, monitoreo y credenciales productivas funcionan; checklist de lanzamiento firmado | Smoke test productivo + acta | G5 | DevOps/Propietario | Pendiente |

## Escenarios críticos de regresión

1. Descubrir producto → elegir talla/color → agregar al carrito → calcular despacho → pagar en sandbox → confirmar pedido.
2. Rechazo y pago pendiente mantienen mensajes y stock coherentes.
3. Reserva vencida y pago tardío no causan sobreventa; la inconsistencia queda en `REVIEW`.
4. Dos eventos idénticos de Mercado Pago producen un único efecto.
5. Usuario no autenticado, rol incorrecto y segundo factor ausente no acceden a `/admin`.
6. Consentimiento rechazado o revocado evita solicitudes a GA4 y Meta.
7. Restauración de backup y rollback dejan healthchecks y flujo de compra funcionales.

## Regla de salida

La liberación se rechaza si existe un P0 en `No cumple`, un defecto crítico/alto abierto, un escáner con hallazgo crítico/alto explotable, o falta la aprobación escrita de los datos comerciales y legales. Las excepciones requieren aceptación explícita del propietario y líder técnico, con riesgo residual registrado en `RISKS.md`.
