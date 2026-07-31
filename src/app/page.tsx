import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Compass,
  Layers3,
  MoveUpRight,
  ShieldCheck,
} from "lucide-react";
import { featuredProducts } from "@/data/products";
import { ProductCard } from "@/components/product-card";

export default function Home() {
  return (
    <main id="contenido" tabIndex={-1}>
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
            decoding="sync"
            className="hero__image"
          />
        </picture>
        <div className="hero__veil" />
        <div className="hero__content">
          <p className="hero__kicker">Colección 01 · Sur de Chile</p>
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
          <span>53° S</span>
          <span>CL / 01</span>
        </div>
      </section>

      <section className="principles" aria-label="Principios de la colección">
        <div>
          <Compass aria-hidden="true" />
          <span>Diseñado en Chile</span>
        </div>
        <div>
          <Layers3 aria-hidden="true" />
          <span>Sistema de capas</span>
        </div>
        <div>
          <ShieldCheck aria-hidden="true" />
          <span>Compra protegida</span>
        </div>
        <div>
          <MoveUpRight aria-hidden="true" />
          <span>Cambios simples</span>
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
          {featuredProducts.map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
      </section>

      <section id="manifiesto" className="manifesto">
        <div className="manifesto__media">
          <Image
            src="/images/pudu-hero-concept.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
          />
          <div className="manifesto__seal">
            <Image
              src="/images/pudu-logo-master.webp"
              alt="PUDU — Explore and protect"
              width={220}
              height={220}
            />
          </div>
        </div>
        <div className="manifesto__content">
          <p className="eyebrow">PUDU / Manifiesto</p>
          <h2>No hacemos ruido para demostrar resistencia.</h2>
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
            <span>01</span>
            <h3>Movimiento primero</h3>
            <p>
              Cortes articulados y volumen donde importa, sin agregar ruido a la
              silueta.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Capas que conversan</h3>
            <p>
              Proporciones pensadas para combinar base, abrigo y protección
              exterior.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Ficha abierta</h3>
            <p>
              Composición, cuidado y origen visibles antes de que cada producto
              salga a venta.
            </p>
          </article>
        </div>
      </section>

      <section className="closing-cta">
        <p className="eyebrow">Prepararse también es avanzar</p>
        <h2>Construye tu sistema.</h2>
        <Link className="button button--dark" href="/coleccion">
          Ver colección completa
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>
    </main>
  );
}
