import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <main id="contenido" tabIndex={-1} className="page-shell cart-page">
      <header className="cart-heading">
        <p className="eyebrow">Colección 01</p>
        <h1>Tu sistema.</h1>
      </header>
      <CartView />
    </main>
  );
}
