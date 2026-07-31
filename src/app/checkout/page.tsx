import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main id="contenido" tabIndex={-1} className="page-shell checkout-page">
      <header className="cart-heading">
        <p className="eyebrow">Compra como invitado</p>
        <h1>Último tramo.</h1>
      </header>
      <CheckoutForm />
    </main>
  );
}
