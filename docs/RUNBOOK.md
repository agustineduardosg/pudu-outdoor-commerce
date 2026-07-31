# Runbook de operación — PUDU Outdoor Commerce

## Arquitectura operativa

EasyPanel ejecuta una única imagen con dos procesos:

- `web`: Next.js en el puerto 3000, expuesto únicamente detrás del proxy HTTPS;
- `worker`: webhooks, liberación de reservas y correos, sin puerto público;
- `db`: PostgreSQL privado con volumen persistente.

Cloudflare R2 conserva imágenes, Resend entrega correos y Sentry recibe errores. EasyPanel contiene todos los secretos; GitHub solo contiene nombres y valores de CI no productivos.

## Primer despliegue en staging

1. Crear un proyecto privado en EasyPanel y conectar el repositorio.
2. Crear PostgreSQL con volumen, red privada y contraseña aleatoria.
3. Crear la aplicación `web` desde el `Dockerfile`, puerto 3000 y healthcheck `/api/health/ready`.
4. Crear `worker` desde la misma imagen con comando `npm run worker`, sin dominio ni puerto.
5. Configurar variables de staging:
   - `NODE_ENV=production`
   - `APP_ORIGIN=https://staging…`
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
   - `MERCADO_PAGO_MODE=sandbox`, credenciales sandbox y firma de webhook
   - R2, Resend y Sentry
6. Aplicar `npx prisma migrate deploy` como tarea de una sola ejecución y sembrar solo los ocho productos demo.
7. Configurar dominio temporal, HTTPS y acceso privado al staging.
8. Registrar en Mercado Pago la URL exacta `/api/webhooks/mercadopago`.
9. Ejecutar smoke, checkout sandbox, backup/restauración y rollback.
10. Promover la misma imagen aprobada a producción. No reconstruir entre staging y producción.

El endpoint de Mercado Pago confirma recepción con HTTP 202 después de validar
firma y persistir un evento idempotente. El worker consulta el pago al proveedor,
aplica pedido, reservas y stock en una transacción serializable y crea una entrega
de correo en el mismo commit. La entrega usa una clave idempotente estable de
Resend por pedido; reiniciar el worker no duplica la confirmación.

No activar autodespliegue de `main` hasta completar el primer lanzamiento estable.
En el Compose local, el servicio de una sola ejecución `migrate` aplica
migraciones y seed antes de habilitar `web`; en EasyPanel se conserva como
tarea explícita para no acoplar cambios de esquema a cada reinicio.

## Comprobaciones posteriores

- `/api/health/live` responde 200: el proceso está vivo.
- `/api/health/ready` responde 200: PostgreSQL y dependencias obligatorias están listas.
- Portada, colección y una ficha responden 200 sin errores de consola.
- Panel redirige a autenticación y exige TOTP.
- Checkout sandbox crea preferencia sin aceptar precios del cliente.
- Webhook válido cambia el estado una sola vez; uno inválido responde 4xx.
- Sentry recibe un evento controlado sin correo, dirección, token ni cookie.
- Los logs son JSON y contienen `requestId`, servicio, nivel y evento, con PII redactada.

## Deploy normal

1. Confirmar CI verde y aprobación del cambio.
2. Crear backup manual previo si hay migración.
3. Guardar el SHA, imagen activa y versión de migración.
4. Desplegar `web`; esperar readiness.
5. Desplegar `worker`; verificar que procese una tarea.
6. Ejecutar smoke contra producción.
7. Observar por 30 minutos tasa 5xx, latencia, pagos `REVIEW`, cola y errores Sentry.

Las migraciones son siempre hacia delante, compatibles con la versión anterior durante el despliegue y nunca eliminan columnas/datos en la misma entrega que deja de usarlos.

## Backups

- Backup PostgreSQL cifrado cada seis horas fuera del VPS.
- Retención: 7 copias diarias, 5 semanales y 12 mensuales.
- R2 mantiene versionado o política equivalente para activos.
- Una vez al mes se restaura la copia más reciente en una base aislada, se aplican migraciones y se verifican conteos, un pedido y su pago.
- Registrar fecha, copia, RPO observado, RTO y resultado. Objetivo inicial: RPO ≤ 6 h; RTO ≤ 2 h.

Un backup que no ha sido restaurado con éxito no se considera confiable.

## Rollback

1. Detener despliegues y conservar logs/evidencia.
2. Si la base es compatible, volver a desplegar la imagen del SHA anterior.
3. Reiniciar `web` y `worker`, confirmar readiness y ejecutar smoke.
4. Si una migración causó el incidente, aplicar una migración correctiva hacia delante. No usar `migrate reset` ni restaurar sobre producción.
5. Restaurar la base solo ante corrupción/pérdida confirmada, con aprobación del responsable y una ventana de indisponibilidad comunicada.
6. Documentar impacto, línea de tiempo y acciones preventivas.

## Incidentes

### Pagos pendientes

1. Buscar por `external_reference`, nunca por datos de tarjeta.
2. Consultar el pago directamente en Mercado Pago.
3. Si está pendiente, mantener pedido y reserva según política; no marcar pagado manualmente.
4. Si está aprobado, validar monto, moneda y referencia antes de reintentar el evento.
5. Si no coincide, pasar a `REVIEW`, bloquear despacho y escalar.

### Webhook repetido o fuera de orden

1. Confirmar firma, `requestId` e identificador del proveedor.
2. Verificar la tabla de eventos; un ID ya procesado no se repite.
3. Reconsultar el recurso en Mercado Pago, no confiar solo en el cuerpo recibido.
4. Reprocesar desde la operación idempotente y revisar stock/pedido.

### Sobreventa o stock inconsistente

1. Pausar la variante afectada.
2. Comparar stock, reservas activas y pedidos pagados dentro de una transacción.
3. No editar registros históricos. Crear movimiento compensatorio auditado.
4. Contactar a clientes solo después de definir resolución y responsable.

### Cola detenida

1. Confirmar salud de PostgreSQL y conectividad del worker.
2. Revisar eventos `RECEIVED`/`PROCESSING` y correos
   `PENDING`/`PROCESSING`, tarea más antigua e intentos, sin imprimir payloads
   con PII.
3. Reiniciar una instancia del worker.
4. El worker recupera automáticamente claims con más de diez minutos. Reintentar
   únicamente tareas idempotentes; enviar fallas permanentes a revisión.

### Secreto expuesto

1. Revocar/rotar inmediatamente en el proveedor.
2. Actualizar EasyPanel y reiniciar servicios.
3. Invalidar sesiones si afecta autenticación.
4. Revisar logs, Git e historial de accesos; eliminar el secreto no sustituye su revocación.
5. Registrar alcance, tiempo de exposición y medidas.

## Monitoreo y alertas

Alertar por:

- disponibilidad externa o readiness fallida por más de 2 minutos;
- tasa 5xx > 2 % durante 5 minutos;
- p95 del checkout > 2 s;
- tarea más antigua del worker > 5 minutos;
- tres o más pagos `REVIEW` en 15 minutos;
- volumen de disco > 80 %;
- backup con más de 7 horas o restauración mensual vencida.

Los logs no incluyen `Authorization`, cookies, secretos, cuerpos de autenticación, direcciones completas ni respuestas de proveedores. Para soporte se usan IDs opacos de pedido y correlación.

## Rotación y mantenimiento

- Dependabot propone actualizaciones semanalmente.
- CodeQL se ejecuta en PR, `main` y semanalmente.
- Trivy bloquea imágenes con vulnerabilidades altas/críticas corregibles.
- Secretos: cada 90 días o inmediatamente tras sospecha.
- TOTP del propietario: recuperación guardada fuera del VPS.
- Revisión trimestral de administradores, reglas de firewall, dominios y accesos EasyPanel/GitHub.
