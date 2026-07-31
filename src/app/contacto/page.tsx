import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactPage() {
  return (
    <main id="contenido" tabIndex={-1} className="page-shell info-page">
      <header className="legal-hero">
        <p className="eyebrow">Contacto</p>
        <h1>Hablemos claro.</h1>
        <p>
          Escríbenos sobre productos, pedidos o colaboraciones. El correo y los
          horarios definitivos se publicarán antes del lanzamiento.
        </p>
      </header>
      <div className="contact-layout">
        <div>
          <p className="eyebrow">Atención PUDU</p>
          <h2>Una conversación humana, sin vueltas.</h2>
          <p>
            No compartas información de tarjetas ni contraseñas. Para revisar un
            pedido solo necesitaremos su número y el correo usado en la compra.
          </p>
        </div>
        <ContactForm />
      </div>
    </main>
  );
}
