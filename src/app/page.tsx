import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Layers3,
  ScanLine,
} from "lucide-react";
import { featuredProducts } from "@/data/products";
import { ProductCard } from "@/components/product-card";

export default function Home() {
  return (
    <main id="contenido" tabIndex={-1}>
      <link
        rel="preload"
        as="image"
        href="/images/pudu-hero-mobile.webp"
        media="(max-width: 640px)"
        fetchPriority="high"
      />
      <section className="hero" aria-labelledby="hero-title">
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet="/images/pudu-hero-mobile.webp"
          />
          <img
            src="/images/pudu-hero-concept.webp"
            alt="Caminante con chaqueta verde contempla un valle glaciar patagónico"
            width="1440"
            height="960"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="hero__image"
          />
        </picture>
        <div className="hero__veil" />
        <div className="hero__content">
          <p className="hero__kicker">
            <span aria-hidden="true" /> Colección 01 · Sur de Chile
          </p>
          <h1 id="hero-title">
            Hecho para
            <br />
            <span>seguir.</span>
          </h1>
          <p className="hero__copy">
            Capas técnicas de presencia silenciosa. Diseñadas para moverse entre
            viento, lluvia y ciudad sin cambiar de lenguaje.
          </p>
          <div className="hero__actions">
            <Link
              className="button button--light"
              href="/coleccion"
              prefetch={false}
            >
              Explorar colección
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <a className="text-link text-link--light" href="#manifiesto">
              Conocer PUDU
              <ArrowDownRight aria-hidden="true" size={18} />
            </a>
          </div>
        </div>
        <div className="hero__index" aria-hidden="true">
          <span>Territorio<br /><b>53° S</b></span>
          <span>Sistema<br /><b>CL / 01</b></span>
        </div>
      </section>

      <section className="principles" aria-label="Datos de la colección">
        <div>
          <span>Origen</span>
          <strong>Chile</strong>
        </div>
        <div>
          <span>Arquitectura</span>
          <strong>3 capas</strong>
        </div>
        <div>
          <span>Moneda</span>
          <strong>CLP · IVA incluido</strong>
        </div>
        <div>
          <span>Entrega</span>
          <strong>Despacho por zona</strong>
        </div>
      </section>

      <section className="section-shell collection-preview">
        <header className="section-heading">
          <div>
            <p className="eyebrow">Colección 01</p>
            <h2>El clima cambia.<br />La intención no.</h2>
          </div>
          <div className="section-heading__aside">
            <p>
              Ocho piezas para construir un sistema sobrio, modular y listo para
              acompañar distintos ritmos.
            </p>
            <Link className="text-link" href="/coleccion">
              Ver las 8 piezas
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </header>
        <div className="product-grid product-grid--featured">
          <ProductCard product={featuredProducts[0]} />
          <ProductCard product={featuredProducts[1]} />
          <aside className="collection-field-note" aria-label="Sistema de capas PUDU">
            <p className="eyebrow">Nota de campo / 01</p>
            <Layers3 aria-hidden="true" size={32} strokeWidth={1.4} />
            <h3>Una capa no compite. Se integra.</h3>
            <p>Base, abrigo y exterior forman un mismo lenguaje visual.</p>
            <span aria-hidden="true">PUDU · CL · 53°S</span>
          </aside>
          <ProductCard product={featuredProducts[2]} />
          <ProductCard product={featuredProducts[3]} />
        </div>
      </section>

      <section id="manifiesto" className="manifesto">
        <div className="manifesto__media">
          <Image
            src="/images/pudu-material-editorial.webp"
            alt="Chaqueta verde bosque sobre roca volcánica con musgo y helecho"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
          />
          <div className="manifesto__contours" aria-hidden="true" />
          <div className="manifesto__coordinates" aria-hidden="true">
            <span>LAT 53°08&apos; S</span>
            <span>LON 70°53&apos; O</span>
            <span>CAPA / EXTERIOR</span>
          </div>
        </div>
        <div className="manifesto__content">
          <p className="eyebrow">PUDU / Manifiesto</p>
          <h2>Pequeño en escala. Preciso por naturaleza.</h2>
          <p className="manifesto__lead">
            Nos inspira el animal más pequeño del bosque austral: atento,
            silencioso y perfectamente adaptado a su territorio.
          </p>
          <p>
            PUDU nace para crear prendas útiles, honestas y visualmente precisas.
            La primera colección es una propuesta conceptual: cada material y
            especificación final será publicado solo después de validarse.
          </p>
          <Link className="text-link" href="/faq">
            Cómo estamos construyendo la marca
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </section>

      <section id="materiales" className="section-shell design-system">
        <header className="design-system__intro">
          <p className="eyebrow">Diseño que trabaja</p>
          <h2>Menos promesas.<br />Mejores decisiones.</h2>
          <p>
            Cada pieza parte de tres criterios que pueden comprobarse en el uso:
            movimiento, modularidad y mantenimiento claro.
          </p>
        </header>
        <div className="design-grid">
          <article>
            <Activity aria-hidden="true" />
            <span>MOV / 01</span>
            <h3>Movimiento primero</h3>
            <p>
              Cortes articulados y volumen donde importa, sin agregar ruido a la
              silueta.
            </p>
          </article>
          <article>
            <Layers3 aria-hidden="true" />
            <span>CAP / 02</span>
            <h3>Capas que conversan</h3>
            <p>
              Proporciones pensadas para combinar base, abrigo y protección
              exterior.
            </p>
          </article>
          <article>
            <ScanLine aria-hidden="true" />
            <span>TRZ / 03</span>
            <h3>Ficha abierta</h3>
            <p>
              Composición, cuidado y origen visibles antes de que cada producto
              salga a venta.
            </p>
          </article>
        </div>
      </section>

      <section className="closing-cta">
        <div className="closing-cta__map" aria-hidden="true" />
        <div className="closing-cta__content">
          <p className="eyebrow">Prepararse también es avanzar</p>
          <h2>Tu próxima capa empieza aquí.</h2>
          <Link className="button button--light" href="/coleccion">
            Ver colección completa
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
        <div className="closing-cta__legend" aria-hidden="true">
          <span>PUDU / SISTEMA 01</span>
          <span>DISEÑADO EN CHILE</span>
        </div>
      </section>
    </main>
  );
}
