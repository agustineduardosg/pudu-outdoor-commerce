"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { formatCLP, getProduct } from "@/data/products";
import { ProductArtwork } from "./product-artwork";
import { getCartItemKey, useCart } from "./cart-provider";

export function CartView() {
  const { items, subtotal, hydrated, removeItem, updateQuantity } = useCart();

  if (!hydrated) {
    return <div className="cart-loading" aria-live="polite">Cargando carrito…</div>;
  }

  if (items.length === 0) {
    return (
      <section className="empty-cart">
        <p className="eyebrow">Tu sistema comienza aquí</p>
        <h1>El carrito está vacío.</h1>
        <p>Explora la Colección 01 y elige las capas que quieras combinar.</p>
        <Link className="button button--dark" href="/coleccion">
          Ver colección
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>
    );
  }

  return (
    <div className="cart-layout">
      <section aria-label="Productos del carrito">
        <div className="cart-list">
          {items.map((item) => {
            const product = getProduct(item.slug);
            if (!product) return null;
            const key = getCartItemKey(item);
            return (
              <article className="cart-item" key={key}>
                <Link href={`/producto/${item.slug}`} className="cart-item__image">
                  <ProductArtwork product={product} />
                </Link>
                <div className="cart-item__info">
                  <div>
                    <p className="eyebrow">{product.category}</p>
                    <h2>
                      <Link href={`/producto/${item.slug}`}>{item.name}</Link>
                    </h2>
                    <p>{item.color} · Talla {item.size}</p>
                  </div>
                  <div className="quantity-control" aria-label={`Cantidad de ${item.name}`}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(key, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Reducir cantidad"
                    >
                      <Minus aria-hidden="true" size={15} />
                    </button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(key, item.quantity + 1)}
                      disabled={item.quantity >= 5}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus aria-hidden="true" size={15} />
                    </button>
                  </div>
                </div>
                <div className="cart-item__price">
                  <strong>{formatCLP(item.price * item.quantity)}</strong>
                  <button
                    type="button"
                    onClick={() => removeItem(key)}
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <Trash2 aria-hidden="true" size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <aside className="cart-summary">
        <p className="eyebrow">Resumen</p>
        <h2>Tu selección</h2>
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatCLP(subtotal)}</dd>
          </div>
          <div>
            <dt>Despacho</dt>
            <dd>Calculado al pagar</dd>
          </div>
          <div className="cart-summary__total">
            <dt>Total estimado</dt>
            <dd>{formatCLP(subtotal)}</dd>
          </div>
        </dl>
        <Link className="button button--dark" href="/checkout">
          Continuar al checkout
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
        <p className="cart-summary__note">
          Los precios y el stock se volverán a validar de forma segura antes de
          crear el pago.
        </p>
      </aside>
    </div>
  );
}
