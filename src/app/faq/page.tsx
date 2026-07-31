import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Preguntas frecuentes" };

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="Ayuda"
      title="Preguntas simples."
      lead="Respuestas transparentes para una colección que todavía se encuentra en etapa conceptual."
      sections={[
        {
          title: "¿Las prendas ya están disponibles?",
          body: <p>No. Esta demo valida experiencia, catálogo y operación. La venta real se habilitará cuando precios, stock y fichas hayan sido confirmados.</p>,
        },
        {
          title: "¿Cómo se procesa el pago?",
          body: <p>El pedido se prepara en PUDU y el pago se completa en el entorno seguro de Mercado Pago. PUDU no recibe datos de tarjeta.</p>,
        },
        {
          title: "¿Qué significa producto conceptual?",
          body: <p>Que el nombre, imagen y precio ayudan a probar el sistema, pero materiales, prestaciones, tallaje y disponibilidad no deben interpretarse como una oferta comercial definitiva.</p>,
        },
        {
          title: "¿Dónde se diseña PUDU?",
          body: <p>PUDU se presenta como marca outdoor chilena independiente. La entidad legal operadora será informada antes del lanzamiento.</p>,
        },
      ]}
    />
  );
}
