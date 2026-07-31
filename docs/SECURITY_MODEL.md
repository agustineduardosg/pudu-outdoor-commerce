# Modelo de seguridad

## Activos protegidos

- Stock, pedidos y estados de pago.
- Credenciales administrativas y secretos TOTP.
- Datos de contacto y despacho.
- Credenciales de Mercado Pago, R2, Resend y Sentry.
- Integridad de catálogo, variantes y tarifas.

## Fronteras de confianza

- El navegador nunca aporta precios, totales ni estados.
- El retorno de Mercado Pago nunca confirma un pago.
- Los webhooks requieren firma vigente y luego verificación contra el proveedor.
- Las URL de checkout y medios se restringen a destinos conocidos.
- El panel requiere sesión HttpOnly, SameSite Strict, rol, TOTP para OWNER y origen confiable.

## Controles

- Argon2id, TOTP cifrado AES-256-GCM y bloqueo tras 5 intentos.
- Cookies seguras en HTTPS, sesiones de 8 horas y revocación al salir.
- CSP, anti-framing, `nosniff`, política de permisos y referrer restrictivo.
- Límites de cuerpo, Zod estricto y rate limiting.
- Reservas y consumo de stock en transacciones serializables.
- Idempotencia en checkout, webhooks, pagos y entregas de correo.
- Logs estructurados sin nombres, correos, direcciones, tokens ni payloads.
- Sentry con `sendDefaultPii=false` y redacción adicional.
- GA4 y Meta Pixel solo tras consentimiento explícito.
- Secretos fuera de Git; `.env.example` contiene únicamente nombres.

## Amenazas principales

| Amenaza | Mitigación |
|---|---|
| Manipulación de precio | Resolución de SKU y precio en servidor |
| Sobreventa | Reserva transaccional y stock reservado |
| Webhook duplicado o reordenado | Evento único, estados normalizados y transición validada |
| Pago tardío | Estado `REVIEW`, sin consumo automático |
| Fuerza bruta admin | Rate limit, bloqueo, Argon2id y TOTP |
| CSRF | SameSite Strict y verificación de `Origin`/Fetch Metadata |
| XSS | React escaping, CSP y sin HTML aportado por usuarios |
| Carga maliciosa | PUT prefirmado, MIME permitido, 8 MB y verificación HEAD |
| Filtración de PII | Redacción de logs/telemetría y mínimos datos |

## Gate de producción

No publicar hasta completar credenciales reales, revisión legal, escaneo de secretos, prueba de restauración, Mercado Pago sandbox, TOTP del propietario y cero defectos críticos/altos.
