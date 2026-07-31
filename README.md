# PUDU Outdoor Commerce

Comercio outdoor chileno construido como monolito modular con Next.js, TypeScript, PostgreSQL y Prisma. Incluye storefront editorial, colección, fichas de producto, carrito local, checkout invitado, Mercado Pago Checkout Pro sandbox, estado de pedido verificado y panel operativo privado.

La colección y sus precios son conceptuales. No deben habilitarse en producción hasta contar con catálogo, stock, fichas, políticas y datos legales definitivos.

## Inicio local

Requisitos:

- Node.js 22 o superior.
- Docker Desktop con WSL 2 para la ejecución integral.
- Copia local de `.env.example` como `.env`.

```powershell
npm ci
npm run db:generate
docker compose up --build
```

El sitio queda disponible en `http://localhost:3000`. La ejecución sin PostgreSQL solo se admite en desarrollo con `PUDU_DEMO_MODE=true`; el modo producción falla de forma segura si no existe `DATABASE_URL`.

Para trabajar sin contenedores:

```powershell
npm run dev
```

## Panel privado

`/admin` no aparece en la navegación pública. Requiere PostgreSQL y un propietario inicial con TOTP.

1. Generar `ADMIN_TOTP_ENCRYPTION_KEY` con 32 bytes en base64.
2. Definir un `ADMIN_BOOTSTRAP_TOKEN` aleatorio de al menos 32 caracteres.
3. Generar un secreto TOTP base32 y registrarlo en una aplicación autenticadora.
4. Ejecutar una sola vez `POST /api/admin/auth/bootstrap` con el token bootstrap como `Bearer` y el cuerpo validado que documenta el contrato Zod.
5. El endpoint queda inutilizable cuando ya existe un administrador.

El panel permite operar catálogo, variantes, imágenes R2, stock, zonas de despacho y estados de pedido. Las mutaciones se registran en auditoría.

## Servicios externos

- Mercado Pago: solo sandbox en esta versión. PUDU nunca recibe datos de tarjeta.
- Cloudflare R2: carga directa prefirmada desde el panel; PNG, JPEG o WebP hasta 8 MB.
- Resend: consultas y correos operativos.
- Sentry: captura de errores sin PII y muestreo reducido.
- GA4 y Meta Pixel: no cargan antes del consentimiento.

Los secretos se configuran fuera del repositorio. Las variables públicas de analítica deben estar presentes durante el build de la imagen.

## Calidad

```powershell
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
```

La CI agrega CodeQL, auditoría de dependencias, Trivy, Lighthouse y pruebas de navegador. Los artefactos y credenciales de Playwright están excluidos de Git.

## EasyPanel

La imagen produce dos procesos:

- `web`: `node server.js`
- `worker`: `npm run worker`

PostgreSQL debe ser privado y persistente. EasyPanel administra HTTPS y el proxy; los secretos se inyectan desde su panel. El procedimiento, backup y rollback se encuentran en `docs/RUNBOOK.md`.

## Gobierno

- Documentación PMO: `docs/PRODUCT_CHARTER.md`, `docs/BACKLOG.md`, `docs/RISKS.md`.
- Aceptación y QA: `docs/ACCEPTANCE_MATRIX.md`, `docs/QA_STRATEGY.md`.
- Arquitectura y seguridad: `docs/ARCHITECTURE.md`, `docs/SECURITY_MODEL.md`.
- Operación: `docs/RUNBOOK.md`.

No se concede licencia open source. Todos los derechos quedan reservados a PUDU.
