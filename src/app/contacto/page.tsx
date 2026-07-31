import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { getProduct } from "@/data/products";

export const metadata: Metadata = { title: "Contacto" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ interes?: string }>;
}) {
  const { interes } = await searchParams;
  const product = interes ? getProduct(interes) : undefined;

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
        <ContactForm
          defaultMessage={
            product
              ? `Quiero recibir novedades sobre ${product.name}. Mi talla y color de interés son: `
              : undefined
          }
        />
      </div>
    </main>
  );
}
