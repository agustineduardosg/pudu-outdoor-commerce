import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Envíos y devoluciones" };

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Servicio local"
      title="Envíos claros."
      lead="La primera versión contempla tarifas configurables por zona y compra como invitado."
      notice="Confirmar cobertura, operador logístico, plazos, tarifas, dirección de devolución y política comercial con la entidad legal."
      sections={[
        {
          title: "Despacho",
          body: (
            <>
              <p>El costo se calcula según la zona elegida antes de iniciar el pago.</p>
              <ul>
                <li>Región Metropolitana: tarifa demo $4.990.</li>
                <li>Zona Centro: tarifa demo $6.990.</li>
                <li>Zona Sur: tarifa demo $8.990.</li>
              </ul>
              <p>Estos valores están deshabilitados para producción hasta su aprobación.</p>
            </>
          ),
        },
        {
          title: "Cambios y devoluciones",
          body: (
            <p>
              El flujo definitivo informará plazos, estado exigido de la prenda,
              canales de contacto y costos de devolución antes de confirmar la compra.
            </p>
          ),
        },
        {
          title: "Seguimiento",
          body: (
            <p>
              Cada pedido tendrá un número y una página de estado protegida por un
              enlace aleatorio enviado al correo del comprador.
            </p>
          ),
        },
      ]}
    />
  );
}
