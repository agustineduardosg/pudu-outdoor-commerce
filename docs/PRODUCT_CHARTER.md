# Carta de producto — PUDU Outdoor Commerce

## 1. Propósito

Lanzar la primera tienda digital de PUDU, marca outdoor chilena independiente con una propuesta técnica, premium y editorial. La experiencia debe permitir descubrir la colección, elegir variantes, comprar como invitado y pagar mediante Mercado Pago, sin que PUDU procese datos de tarjeta.

## 2. Resultado de negocio

- Validar la propuesta de marca y convertir tráfico en ventas reales en Chile.
- Entregar una operación administrable: catálogo, stock, despacho, pedidos y contenidos.
- Establecer una base segura, medible y desplegable en EasyPanel, preparada para evolucionar sin rehacer el núcleo.

## 3. Usuarios y partes interesadas

| Actor | Necesidad | Responsabilidad |
|---|---|---|
| Cliente final | Compra rápida, clara, confiable y móvil | Elegir variantes y entregar datos correctos |
| Propietario PUDU | Control comercial y operativo | Aprobar marca, catálogo, precios y políticas |
| Operaciones | Visibilidad de pedidos y stock | Preparar, despachar y actualizar estados |
| Soporte | Resolver dudas e incidencias | Gestionar contacto, pagos pendientes y cambios |
| Equipo TI | Operación segura y trazable | Construcción, pruebas, despliegue y monitoreo |

## 4. Alcance de v1

### Incluido

- Sitio en español, precios enteros en CLP con IVA incluido.
- Inicio editorial, colección, producto, carrito, checkout, estado de pedido, guía de tallas, envíos/devoluciones, FAQ, contacto y páginas legales.
- Ocho productos conceptuales reemplazables, con tallas, colores, SKU y stock.
- Compra como invitado y carrito persistente en el dispositivo.
- Mercado Pago Checkout Pro en modo prueba y verificación de pagos en servidor.
- Reserva de stock por 30 minutos, control de concurrencia e idempotencia de webhooks.
- Despacho por zonas y umbral configurable de envío gratis.
- Panel privado para catálogo, medios, inventario, despacho y pedidos.
- Consentimiento para analítica; GA4 y Meta Pixel solo después de la autorización.
- Contenedores para web, worker y PostgreSQL; CI, observabilidad, backups y rollback documentado.

### Excluido

- Cuentas de clientes, fidelización y cupones.
- Venta internacional, monedas o idiomas adicionales.
- Integración ERP, courier o cotización automática de despacho.
- Diseño definitivo de logo, influencers y fotografía comercial.

## 5. Principios de producto

1. **Confianza antes que persuasión:** no publicar testimonios, certificaciones ni atributos técnicos no comprobados.
2. **El servidor es la fuente de verdad:** precios, stock, despacho, totales y estado de pago se recalculan y verifican en backend.
3. **Compra sin fricción:** el flujo principal no requiere registro.
4. **Accesibilidad por defecto:** objetivo WCAG 2.2 AA y uso completo con teclado.
5. **Privacidad y mínimo dato:** recopilar solo lo necesario para vender, despachar y asistir.
6. **Diseño reemplazable:** activos conceptuales claramente identificados para facilitar la incorporación del material final.

## 6. Métricas y criterios de éxito

- Flujo completo de compra de prueba ejecutable de inicio a confirmación.
- Cero defectos críticos o altos al aprobar la versión local.
- Lighthouse móvil: rendimiento ≥ 90; accesibilidad, buenas prácticas y SEO ≥ 95.
- Core Web Vitals objetivo: LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1.
- Cero incidencias críticas o serias en Axe.
- Webhooks duplicados o desordenados sin doble cobro lógico, pedido o descuento de stock.
- Restauración de backup y rollback ensayados antes de producción.

## 7. Gobierno y etapas

| Gate | Evidencia requerida | Autoridad de aprobación |
|---|---|---|
| G1 — Dirección | Carta, sitemap, sistema visual y contenido demo | Propietario PUDU + Dirección de producto |
| G2 — Funcional local | Flujos públicos, administración y checkout de prueba | Líder técnico |
| G3 — Calidad | Matriz de aceptación completa, informe QA y revisión de seguridad | QA + Líder técnico |
| G4 — Staging | Despliegue EasyPanel, healthchecks, backup y rollback | DevOps + Propietario PUDU |
| G5 — Producción | Datos legales, catálogo, dominio y credenciales productivas confirmados | Propietario PUDU |

Los cambios de alcance posteriores a G1 se registran con impacto en plazo, riesgo y aceptación. Ningún gate posterior compensa un criterio obligatorio no cumplido.

## 8. Restricciones, dependencias y supuestos

- VPS objetivo: 2 vCPU, 4 GB RAM, 40 GB SSD y backups externos.
- El repositorio será público y sin licencia open source por defecto.
- Secretos solo en variables protegidas; nunca en Git, logs o analítica.
- El usuario debe proporcionar antes de G5: identidad legal, dominio, correo de soporte, catálogo y activos finales, precios, stock, tabla de tallas y políticas revisadas.
- Producción depende de accesos válidos a GitHub, EasyPanel, Mercado Pago, almacenamiento S3/R2, correo, Sentry, GA4 y Meta.
- La disponibilidad de marca y dominio, y la revisión legal chilena, son prerrequisitos del lanzamiento, no entregables técnicos.

## 9. Definición de terminado

La v1 se considera terminada cuando todos los requisitos obligatorios de `ACCEPTANCE_MATRIX.md` tienen evidencia, no existen defectos críticos o altos abiertos, el propietario aprueba el contenido comercial y legal, y staging demuestra compra, monitoreo, backup y rollback sin intervención de desarrollo.
