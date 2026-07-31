"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { formatCLP } from "@/data/products";
import { useCart } from "./cart-provider";

type CheckoutResponse = {
  data?: {
    orderId: string;
    orderToken: string;
    checkoutUrl: string;
  };
  detail?: string;
  title?: string;
};

function isAllowedCheckoutUrl(value: string) {
  try {
    const url = new URL(value, window.location.origin);
    return (
      url.origin === window.location.origin ||
      url.hostname === "www.mercadopago.cl" ||
      url.hostname.endsWith(".mercadopago.cl") ||
      url.hostname === "www.mercadopago.com" ||
      url.hostname.endsWith(".mercadopago.com")
    );
  } catch {
    return false;
  }
}

export function CheckoutForm() {
  const { items, subtotal, hydrated } = useCart();
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setStatus("Validando tu selección…");

    const payload = {
      items: items.map((item) => ({ sku: item.sku, quantity: item.quantity })),
      customer: {
        email: String(form.get("email") ?? ""),
        firstName: String(form.get("firstName") ?? ""),
        lastName: String(form.get("lastName") ?? ""),
        phone: String(form.get("phone") ?? ""),
      },
      shipping: {
        zoneCode: String(form.get("zoneCode") ?? ""),
        addressLine1: String(form.get("addressLine1") ?? ""),
        addressLine2: String(form.get("addressLine2") ?? ""),
        commune: String(form.get("commune") ?? ""),
        region: String(form.get("region") ?? ""),
        postalCode: String(form.get("postalCode") ?? ""),
        instructions: String(form.get("instructions") ?? ""),
      },
    };

    try {
      const response = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as CheckoutResponse;
      if (!response.ok || !result.data) {
        throw new Error(result.detail ?? result.title ?? "No fue posible iniciar el pago.");
      }
      if (!isAllowedCheckoutUrl(result.data.checkoutUrl)) {
        throw new Error("El proveedor devolvió una dirección de pago no permitida.");
      }
      setStatus("Selección validada. Abriendo el entorno seguro de pago…");
      window.location.assign(result.data.checkoutUrl);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar el pago. Intenta nuevamente.",
      );
      setPending(false);
    }
  }

  if (!hydrated) return <div className="cart-loading">Preparando checkout…</div>;
  if (!items.length) {
    return (
      <div className="empty-checkout">
        <h2>Tu carrito está vacío.</h2>
        <Link className="button button--dark" href="/coleccion">
          Volver a la colección
        </Link>
      </div>
    );
  }

  return (
    <form className="checkout-layout" onSubmit={submit}>
      <div className="checkout-form">
        <section>
          <p className="form-step">01 / Contacto</p>
          <div className="field-grid field-grid--two">
            <label>
              Nombre
              <input name="firstName" autoComplete="given-name" maxLength={80} required />
            </label>
            <label>
              Apellido
              <input name="lastName" autoComplete="family-name" maxLength={80} required />
            </label>
            <label>
              Correo
              <input name="email" type="email" autoComplete="email" spellCheck={false} maxLength={254} required />
            </label>
            <label>
              Teléfono
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} required />
            </label>
          </div>
        </section>
        <section>
          <p className="form-step">02 / Despacho</p>
          <div className="field-grid field-grid--two">
            <label>
              Zona
              <select name="zoneCode" required defaultValue="">
                <option value="" disabled>Selecciona una zona</option>
                <option value="RM">Región Metropolitana</option>
                <option value="CENTRO">Zona Centro</option>
                <option value="SUR">Zona Sur</option>
              </select>
            </label>
            <label>
              Región
              <input name="region" autoComplete="address-level1" maxLength={120} required />
            </label>
            <label>
              Comuna
              <input name="commune" autoComplete="address-level2" maxLength={120} required />
            </label>
            <label>
              Código postal
              <input name="postalCode" inputMode="numeric" autoComplete="postal-code" maxLength={12} />
            </label>
            <label className="field-span">
              Dirección
              <input name="addressLine1" autoComplete="address-line1" maxLength={120} required />
            </label>
            <label className="field-span">
              Departamento, oficina u otro
              <input name="addressLine2" autoComplete="address-line2" maxLength={120} />
            </label>
            <label className="field-span">
              Indicaciones de entrega
              <textarea name="instructions" autoComplete="off" maxLength={300} rows={3} />
            </label>
          </div>
        </section>
        <label className="terms-check">
          <input name="acceptTerms" type="checkbox" required />
          <span>
            Acepto los <Link href="/terminos">términos</Link> y la{" "}
            <Link href="/privacidad">política de privacidad</Link>.
          </span>
        </label>
      </div>
      <aside className="checkout-summary">
        <p className="eyebrow">Resumen seguro</p>
        <h2>{items.length} {items.length === 1 ? "pieza" : "piezas"}</h2>
        <ul>
          {items.map((item) => (
            <li key={`${item.sku}:${item.size}`}>
              <span>{item.name} · {item.size} × {item.quantity}</span>
              <strong>{formatCLP(item.price * item.quantity)}</strong>
            </li>
          ))}
        </ul>
        <div className="checkout-total">
          <span>Subtotal</span>
          <strong>{formatCLP(subtotal)}</strong>
        </div>
        <button className="button button--dark" type="submit" disabled={pending}>
          {pending ? "Validando…" : "Ir al pago seguro"}
          {!pending && <ArrowRight aria-hidden="true" size={18} />}
        </button>
        <div className="secure-note">
          <LockKeyhole aria-hidden="true" size={17} />
          <span>Los datos de tarjeta se ingresan en Mercado Pago.</span>
        </div>
        <p className="form-status" aria-live="polite">{status}</p>
      </aside>
    </form>
  );
}
