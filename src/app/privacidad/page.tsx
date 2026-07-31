import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Privacidad y cookies" };

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Documento preliminar"
      title="Privacidad."
      lead="La arquitectura minimiza los datos recogidos y separa la medición opcional del funcionamiento esencial."
      notice="Confirmar responsable de datos, finalidades, bases de tratamiento, proveedores, transferencias, retención y canal de derechos antes de producción."
      sections={[
        { title: "Datos esenciales", body: <p>Para completar un pedido se solicitan contacto y dirección de entrega. El carrito se conserva localmente en el dispositivo y no contiene credenciales.</p> },
        { title: "Pagos", body: <p>Los datos de tarjeta se ingresan en Mercado Pago. PUDU conserva solo identificadores y estados necesarios para conciliar el pedido.</p> },
        { title: "Medición", body: <p>GA4 y Meta permanecen desactivados hasta que la persona acepte medición comercial. La preferencia puede modificarse desde el control “Privacidad”.</p> },
        { title: "Seguridad", body: <p>Se aplican controles de acceso, cifrado en tránsito, registros con datos sensibles redactados y retención limitada.</p> },
      ]}
    />
  );
}
