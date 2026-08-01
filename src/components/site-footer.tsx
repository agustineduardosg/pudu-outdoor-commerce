import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-wordmark" aria-hidden="true" translate="no">
        PUDU
      </div>
      <div className="footer-grid">
        <div>
          <Image
            className="footer-logo"
            src="/images/pudu-logo-master.webp"
            alt="PUDU — Explore and protect"
            width={180}
            height={180}
          />
          <p className="eyebrow">PUDU Outdoor</p>
          <p className="footer-copy">
            Objetos para compartir el camino. PUDU Ruta 500 está actualmente en
            validación para su lanzamiento en Chile.
          </p>
        </div>
        <div>
          <p className="footer-title">Explorar</p>
          <Link href="/coleccion">Colección</Link>
          <Link href="/guia-de-tallas">Guía de tallas</Link>
          <Link href="/envios-y-devoluciones">Envíos y devoluciones</Link>
        </div>
        <div>
          <p className="footer-title">Información</p>
          <Link href="/faq">Preguntas frecuentes</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/terminos">Términos</Link>
          <Link href="/privacidad">Privacidad y cookies</Link>
        </div>
        <div>
          <p className="footer-title">PUDU Objects / 01</p>
          <p>Ruta 500 · Concepto en validación.</p>
          <p>Ropa PUDU · Próximamente.</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} PUDU. Todos los derechos reservados.</span>
        <span>Chile · CLP</span>
      </div>
    </footer>
  );
}
