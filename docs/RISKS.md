# Registro de riesgos — PUDU Outdoor Commerce

## Escala

- Probabilidad e impacto: Baja (1), Media (2), Alta (3).
- Exposición = probabilidad × impacto.
- Riesgos con exposición ≥ 6 se revisan en cada gate y pueden bloquear la salida.

| ID | Riesgo | P | I | Exp. | Mitigación preventiva | Disparador / contingencia | Responsable |
|---|---|---:|---:|---:|---|---|---|
| R-01 | Datos legales, políticas o marca no aprobados a tiempo | 3 | 3 | 9 | Usar placeholders explícitos y checklist de insumos | Falta un dato al iniciar G4: mantener staging y bloquear producción | Propietario PUDU |
| R-02 | Credenciales externas incompletas o inválidas | 3 | 3 | 9 | Inventario de accesos y prueba temprana en sandbox | Falla de autenticación: desactivar integración afectada y no avanzar de gate | DevOps |
| R-03 | Sobreventa por concurrencia o reservas vencidas | 2 | 3 | 6 | Transacciones, bloqueo de filas, reservas con TTL y pruebas concurrentes | Stock negativo o doble reserva: suspender SKU y reconciliar pedidos | Backend |
| R-04 | Webhook falso, duplicado o desordenado altera pedidos | 2 | 3 | 6 | Verificación de firma y proveedor; idempotencia y máquina de estados | Inconsistencia: mover pedido a `REVIEW`, no consumir stock y alertar | Backend |
| R-05 | Pago tardío llega después de liberar stock | 2 | 3 | 6 | Reconsultar pago y disponibilidad antes de confirmar | Sin stock al aprobar: `REVIEW`, contacto y resolución manual | Operaciones |
| R-06 | Activos editoriales perjudican rendimiento | 2 | 2 | 4 | Formatos modernos, tamaños responsive, carga diferida y presupuesto | LCP supera 2,5 s: reemplazar/comprimir activo y bloquear G3 | Frontend |
| R-07 | Contenido demo se confunde con afirmaciones comerciales reales | 2 | 3 | 6 | Marcar activos y textos provisionales; evitar prestaciones no verificadas | Hallazgo en revisión: retirar afirmación y repetir aprobación de contenido | Producto |
| R-08 | Acceso no autorizado al panel o a datos de clientes | 2 | 3 | 6 | Argon2id, TOTP, RBAC, sesiones seguras, rate limit y auditoría | Señal de compromiso: revocar sesiones/secretos, aislar servicio y activar runbook | Seguridad |
| R-09 | PII o secretos quedan expuestos en Git, logs o analítica | 2 | 3 | 6 | Escaneo automático, redacción y allowlist de eventos | Hallazgo: rotar secreto, limpiar exposición y evaluar notificación | Seguridad |
| R-10 | Dependencia o imagen contiene vulnerabilidad crítica | 2 | 3 | 6 | Versiones fijadas, auditoría, CodeQL y Trivy en CI | CVE explotable: bloquear release, actualizar o aislar función | Líder técnico |
| R-11 | Restauración de base de datos no funciona | 2 | 3 | 6 | Backups cifrados, retención y simulacro mensual | Simulacro falla: detener despliegues y corregir antes de G5 | DevOps |
| R-12 | VPS insuficiente ante carga o procesos simultáneos | 2 | 2 | 4 | Límites, métricas, worker separado y prueba de carga básica | Saturación sostenida: reducir carga no crítica o ampliar VPS | DevOps |
| R-13 | Diferencias entre entorno local y EasyPanel | 2 | 2 | 4 | Misma imagen Docker, migraciones automatizadas y `.env.example` | Staging no reproduce local: congelar release y comparar configuración | DevOps |
| R-14 | Incumplimiento de accesibilidad en componentes clave | 2 | 2 | 4 | Revisión temprana, Axe y pruebas reales con teclado/zoom | Incidencia crítica/seria: bloquear G3 hasta corregir | UX/QA |
| R-15 | Analítica carga sin consentimiento válido | 2 | 3 | 6 | Consent mode y pruebas de red antes/después de aceptar | Solicitud previa detectada: deshabilitar tags y corregir antes del release | Frontend |
| R-16 | Repositorio público revela propiedad intelectual o configuración sensible | 2 | 3 | 6 | Revisión de contenido, sin licencia abierta, plantillas sin valores | Dato sensible publicado: hacer privado temporalmente, rotar y sanear historial | Líder técnico |

## Riesgos aceptados y reservas

- Se acepta que los precios, tarifas, textos legales y activos visuales sean demostrativos hasta que el propietario los confirme.
- Se acepta el despacho manual por zonas en v1; el riesgo operacional se controla mediante configuración y revisión del pedido.
- No se acepta trasladar a producción ningún riesgo de exposición ≥ 6 sin mitigación comprobada o aceptación escrita del propietario y líder técnico.

## Cadencia

- Revisar el registro al cerrar cada gate y después de cualquier incidente.
- Agregar riesgos nuevos con responsable, disparador y contingencia antes de incorporarlos al backlog.
- Cerrar un riesgo solo con evidencia de eliminación; si persiste con menor exposición, actualizarlo en vez de borrarlo.
