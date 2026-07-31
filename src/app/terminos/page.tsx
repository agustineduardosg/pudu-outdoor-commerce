import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Documento preliminar"
      title="Términos."
      lead="Esta página reserva la estructura legal necesaria, pero no reemplaza una revisión profesional."
      notice="Incorporar razón social, RUT, domicilio, contacto, derecho de retracto, garantías, despacho, cambios, jurisdicción y fecha de vigencia. Debe revisarlo asesor legal chileno."
      sections={[
        { title: "Identificación del proveedor", body: <p>Pendiente de datos legales de la entidad operadora de PUDU.</p> },
        { title: "Productos y precios", body: <p>Las fichas productivas deberán mostrar características, precio total, disponibilidad y condiciones antes de comprar.</p> },
        { title: "Pago y confirmación", body: <p>Un pedido se considera pagado únicamente después de la verificación server-side del proveedor de pago.</p> },
        { title: "Garantías, cambios y retracto", body: <p>Pendiente de política comercial validada según la normativa chilena aplicable.</p> },
      ]}
    />
  );
}
