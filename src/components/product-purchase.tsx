"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Check,
  ChevronDown,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type { Product } from "@/data/products";
import { formatCLP } from "@/data/products";
import { useCart } from "./cart-provider";
import { ProductArtwork } from "./product-artwork";

export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const { addItem } = useCart();

  function addToCart() {
    if (!size) {
      setMessage("Elige una talla para continuar.");
      return;
    }
    const variantSize = size === "Única" ? "UNICA" : size;
    addItem({
      slug: product.slug,
      sku: `${product.sku}-${variantSize}`,
      name: product.name,
      price: product.price,
      size,
      color: product.color,
      quantity,
      spriteIndex: product.spriteIndex,
    });
    setMessage(
      `${quantity} × ${product.name}, talla ${size}, se agregó al carrito.`,
    );
  }

  return (
    <div className="purchase-panel">
      <div className="purchase-panel__heading">
        <p className="eyebrow">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="product-price">{formatCLP(product.price)}</p>
      </div>
      <p className="purchase-description">{product.description}</p>
      <div className="variant-block">
        <div className="variant-block__heading">
          <span>Color</span>
          <strong>{product.color}</strong>
        </div>
        <button
          className="color-option is-selected"
          type="button"
          aria-label={`${product.color}, seleccionado`}
          aria-pressed="true"
        >
          <ProductArtwork product={product} />
          <Check aria-hidden="true" size={14} />
        </button>
      </div>
      <fieldset className="size-picker">
        <legend className="sr-only">Elige tu talla</legend>
        <div className="size-picker__label">
          <span>Elige tu talla</span>
          <Link href="/guia-de-tallas">
            <Ruler aria-hidden="true" size={15} />
            Ver guía
          </Link>
        </div>
        <div className="size-grid">
          {product.sizes.map((option) => (
            <button
              type="button"
              key={option}
              className={size === option ? "is-selected" : ""}
              aria-pressed={size === option}
              onClick={() => {
                setSize(option);
                setMessage("");
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="purchase-actions">
        <div className="quantity-picker" aria-label="Cantidad">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            disabled={quantity === 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            <Minus aria-hidden="true" size={16} />
          </button>
          <output aria-label={`${quantity} unidades`}>{quantity}</output>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            disabled={quantity === 5}
            onClick={() => setQuantity((value) => Math.min(5, value + 1))}
          >
            <Plus aria-hidden="true" size={16} />
          </button>
        </div>
        <button
          className="button button--dark purchase-button"
          onClick={addToCart}
        >
          <ShoppingBag aria-hidden="true" size={18} />
          Agregar al carrito
        </button>
      </div>
      <p className="purchase-message" aria-live="polite">
        {message}
      </p>
      <div className="purchase-assurances">
        <span>
          <ShieldCheck aria-hidden="true" size={17} />
          Pago protegido con Mercado Pago
        </span>
        <span>
          <Truck aria-hidden="true" size={17} />
          Despacho calculado según tu zona
        </span>
      </div>
      <div className="product-accordions">
        <details open>
          <summary>
            Detalles de la prenda
            <ChevronDown aria-hidden="true" size={17} />
          </summary>
          <ul className="product-details">
            {product.details.map((detail) => (
              <li key={detail}>
                <Check aria-hidden="true" size={16} />
                {detail}
              </li>
            ))}
          </ul>
        </details>
        <details>
          <summary>
            Despacho y cambios
            <ChevronDown aria-hidden="true" size={17} />
          </summary>
          <p>
            La tarifa y el plazo se confirman antes de pagar. Las condiciones
            finales se publicarán previo al lanzamiento.
          </p>
        </details>
        <details>
          <summary>
            Materiales y cuidado
            <ChevronDown aria-hidden="true" size={17} />
          </summary>
          <p>
            Composición y cuidados permanecen pendientes de validación con la
            prenda definitiva.
          </p>
        </details>
      </div>
      <div className="concept-note">
        <strong>Producto conceptual</strong>
        <p>
          La composición, disponibilidad y ficha técnica final deben validarse
          antes del lanzamiento comercial.
        </p>
      </div>
    </div>
  );
}
