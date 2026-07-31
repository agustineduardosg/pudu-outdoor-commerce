"use client";

import { useState } from "react";
import { Expand, Layers3, ScanSearch } from "lucide-react";
import type { Product } from "@/data/products";
import { ProductArtwork } from "./product-artwork";

const views = [
  { id: "front", label: "Vista frontal", icon: Expand },
  { id: "detail", label: "Detalle de construcción", icon: ScanSearch },
  { id: "system", label: "Vista de sistema", icon: Layers3 },
] as const;

type ViewId = (typeof views)[number]["id"];

export function ProductGallery({ product }: { product: Product }) {
  const [activeView, setActiveView] = useState<ViewId>("front");
  const active = views.find((view) => view.id === activeView) ?? views[0];

  return (
    <div className="product-gallery">
      <div className="product-gallery__rail" aria-label="Vistas del producto">
        {views.map((view, index) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              type="button"
              className={activeView === view.id ? "is-selected" : ""}
              aria-label={view.label}
              aria-pressed={activeView === view.id}
              onClick={() => setActiveView(view.id)}
            >
              <span aria-hidden="true" className={`gallery-thumb gallery-thumb--${view.id}`}>
                {index === 0 ? (
                  <ProductArtwork product={product} />
                ) : (
                  <Icon size={18} strokeWidth={1.5} />
                )}
              </span>
              <span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>

      <div
        className={`product-gallery__stage product-gallery__stage--${activeView}`}
        aria-live="polite"
      >
        <ProductArtwork
          product={product}
          className="product-gallery__art"
          priority
        />
        {activeView === "system" ? (
          <div className="gallery-system-note" aria-hidden="true">
            <span>Colección 01</span>
            <strong>Sistema de capas</strong>
          </div>
        ) : null}
      </div>

      <div className="product-gallery__caption">
        <span>Imagen conceptual</span>
        <span>{active.label}</span>
      </div>
    </div>
  );
}
