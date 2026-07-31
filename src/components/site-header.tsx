"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart-provider";

const links = [
  { href: "/coleccion", label: "Colección" },
  { href: "/#materiales", label: "Diseño" },
  { href: "/guia-de-tallas", label: "Guía de tallas" },
  { href: "/faq", label: "Ayuda" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count, hydrated } = useCart();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header className="site-header">
      <div className="announcement">
        <span>Diseñado en Chile</span>
        <span aria-hidden="true">·</span>
        <span>Colección conceptual 01 · Precios demo en CLP</span>
      </div>
      <nav className="nav-shell" aria-label="Navegación principal">
        <Link
          className="wordmark"
          href="/"
          prefetch={false}
          aria-label="PUDU, inicio"
        >
          <span className="wordmark__symbol" aria-hidden="true">
            <Image
              src="/images/pudu-logo-master.webp"
              alt=""
              width={72}
              height={72}
            />
          </span>
          <span translate="no">PUDU</span>
        </Link>
        <button
          ref={toggleRef}
          className="icon-button nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        </button>
        <div
          id="mobile-navigation"
          className={`nav-links ${open ? "is-open" : ""}`}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link className="cart-link" href="/carrito" prefetch={false}>
          <ShoppingBag aria-hidden="true" size={19} />
          <span>Carrito</span>
          <span className="cart-count" aria-label={`${hydrated ? count : 0} productos`}>
            {hydrated ? count : 0}
          </span>
        </Link>
      </nav>
    </header>
  );
}
