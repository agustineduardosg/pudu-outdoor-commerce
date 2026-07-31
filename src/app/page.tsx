import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Coffee,
  Package,
  ScanLine,
  UsersRound,
} from "lucide-react";

export default function Home() {
  return (
    <main id="contenido" tabIndex={-1} className="ruta-home">
      <section className="ruta-hero" aria-labelledby="ruta-title">
        <div className="ruta-hero__copy">
          <p className="ruta-kicker">
            <span aria-hidden="true" /> PUDU OBJECTS / 01
          </p>
          <h1 id="ruta-title">
            Ruta <span>500</span>
          </h1>
          <p className="ruta-hero__statement">
            Un termo. Tres tazas.
            <br />
            El camino se comparte.
          </p>
          <p className="ruta-hero__description">
            El primer objeto PUDU nace alrededor de una pausa: 500 ml y tres
            tazas para compartir algo caliente durante el trayecto.
          </p>
          <div className="ruta-hero__actions">
            <a className="button button--light" href="#producto">
              Conocer el set
              <ArrowDownRight aria-hidden="true" size={18} />
            </a>
            <Link className="text-link text-link--light" href="/contacto">
              Avisarme del lanzamiento
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <p className="ruta-hero__status">
            Concepto en validación · Venta aún no habilitada
          </p>
        </div>
        <div className="ruta-hero__visual">
          <Image
            src="/images/pudu-ruta-500-hero-v1.avif"
            alt="Concepto PUDU Ruta 500 en color bosque con tres tazas"
            fill
            priority
            unoptimized
            sizes="(max-width: 840px) 100vw, 55vw"
          />
          <span className="ruta-hero__asset-label">SYNTHETIC CONCEPT / V1</span>
        </div>
        <div className="ruta-hero__coordinates" aria-hidden="true">
          <span>OBJ / 01</span>
          <span>CL / 2026</span>
        </div>
      </section>

      <section className="ruta-facts" aria-label="Contenido declarado del producto base">
        <div>
          <span>Capacidad</span>
          <strong>500 ml</strong>
        </div>
        <div>
          <span>Para compartir</span>
          <strong>3 tazas</strong>
        </div>
        <div>
          <span>Interior declarado</span>
          <strong>Acero inoxidable</strong>
        </div>
        <div>
          <span>Estado</span>
          <strong>Muestra pendiente</strong>
        </div>
      </section>

      <section id="producto" className="ruta-product section-shell">
        <header className="ruta-section-heading">
          <div>
            <p className="eyebrow">PUDU Ruta 500 · Set de Refugio</p>
            <h2>Lleva calor.<br />Comparte ruta.</h2>
          </div>
          <p>
            Un formato compacto para paseos, viajes y pausas cotidianas. La
            ficha final se publicará después de comprobar la muestra real.
          </p>
        </header>

        <div className="ruta-product__layout">
          <figure className="ruta-product__figure">
            <Image
              src="/images/pudu-ruta-500-packaging-v1.avif"
              alt="Concepto de empaque PUDU Ruta 500 con termo y tres tazas"
              width={1536}
              height={1024}
              unoptimized
              sizes="(max-width: 900px) 100vw, 66vw"
            />
            <figcaption>Concepto de empaque · La muestra real puede variar</figcaption>
          </figure>
          <aside className="ruta-product__contents" aria-label="Contenido del set">
            <p className="eyebrow">Dentro del set</p>
            <div>
              <Coffee aria-hidden="true" />
              <span>01</span>
              <h3>Termo de 500 ml</h3>
              <p>Interior de acero inoxidable y exterior plástico, según proveedor.</p>
            </div>
            <div>
              <UsersRound aria-hidden="true" />
              <span>03</span>
              <h3>Tazas con asa</h3>
              <p>Tres porciones para hacer de la pausa un momento compartido.</p>
            </div>
            <div>
              <Package aria-hidden="true" />
              <span>01</span>
              <h3>Caja de presentación</h3>
              <p>Faja PUDU de baja inversión sobre el empaque existente.</p>
            </div>
          </aside>
        </div>
      </section>

      <section id="rastro" className="ruta-signature">
        <div className="ruta-signature__copy">
          <p className="eyebrow">Firma de producto / Rastro PUDU</p>
          <h2>Una línea.<br />Un paisaje.</h2>
          <p>
            El rastro topográfico continúa del termo a cada taza. Separadas son
            fragmentos; reunidas forman una misma ruta.
          </p>
          <div className="ruta-signature__rule" aria-hidden="true" />
          <span>Marca pequeña · Una tinta · Aplicación reproducible</span>
        </div>
        <div className="ruta-signature__visual">
          <Image
            src="/images/pudu-ruta-500-colorways-v1.avif"
            alt="Concepto de colores Bosque, Obsidiana y Glaciar para PUDU Ruta 500"
            fill
            unoptimized
            sizes="(max-width: 900px) 100vw, 62vw"
          />
          <p>Colores conceptuales sujetos a disponibilidad del proveedor.</p>
        </div>
      </section>

      <section className="ruta-validation section-shell">
        <header>
          <p className="eyebrow">Antes de vender</p>
          <h2>Primero se comprueba.</h2>
        </header>
        <div className="ruta-validation__grid">
          <article>
            <span>01</span>
            <ScanLine aria-hidden="true" />
            <h3>Muestra física</h3>
            <p>Confirmaremos color, terminaciones, contenido y medidas reales.</p>
          </article>
          <article>
            <span>02</span>
            <ScanLine aria-hidden="true" />
            <h3>Prueba de uso</h3>
            <p>Mediremos temperatura, hermeticidad, vertido, lavado y resistencia.</p>
          </article>
          <article>
            <span>03</span>
            <ScanLine aria-hidden="true" />
            <h3>Marca durable</h3>
            <p>La aplicación PUDU deberá superar humedad, roce y ciclos de limpieza.</p>
          </article>
        </div>
      </section>

      <section className="ruta-apparel">
        <div className="ruta-apparel__image">
          <Image
            src="/images/pudu-material-editorial.webp"
            alt="Prenda conceptual PUDU sobre roca y vegetación"
            fill
            sizes="(max-width: 860px) 100vw, 50vw"
          />
          <span>PRÓXIMAMENTE</span>
        </div>
        <div className="ruta-apparel__copy">
          <p className="eyebrow">PUDU Apparel</p>
          <h2>La ropa sigue en camino.</h2>
          <p>
            Polares, softshells y accesorios continúan en desarrollo. No serán
            ofrecidos hasta que materiales, calce y confección estén validados.
          </p>
          <Link className="text-link" href="/coleccion">
            Ver colección conceptual
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </section>

      <section className="ruta-closing">
        <div>
          <p className="eyebrow">Primera serie PUDU</p>
          <h2>El camino se comparte.</h2>
        </div>
        <Link className="button button--light" href="/contacto">
          Quiero enterarme
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>
    </main>
  );
}
