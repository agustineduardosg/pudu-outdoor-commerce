"use client";

import Image from "next/image";
import { useState } from "react";
import { Expand, Layers3, ScanSearch } from "lucide-react";
import type { Product } from "@/data/products";
import { ProductArtwork } from "./product-artwork";

const views = [
  { id: "front", label: "Vista de producto", icon: Expand },
  { id: "detail", label: "Diseño y construcción", icon: ScanSearch },
  { id: "system", label: "Maite usa la pieza", icon: Layers3 },
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
          const thumbnail =
            view.id === "detail" ? product.designBoard : view.id === "system" ? product.campaign : null;

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
                ) : thumbnail ? (
                  <Image
                    src={thumbnail.image}
                    alt=""
                    fill
                    quality={55}
                    sizes="68px"
                  />
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
        {activeView === "detail" && product.designBoard ? (
          <Image
            className="product-gallery__photo product-gallery__photo--board"
            src={product.designBoard.image}
            alt={product.designBoard.alt}
            fill
            quality={55}
            sizes="(max-width: 820px) 100vw, 66vw"
          />
        ) : activeView === "system" && product.campaign ? (
          <Image
            className="product-gallery__photo product-gallery__photo--campaign"
            src={product.campaign.image}
            alt={product.campaign.alt}
            fill
            loading="eager"
            quality={55}
            sizes="(max-width: 820px) 100vw, 66vw"
          />
        ) : (
          <ProductArtwork
            product={product}
            className="product-gallery__art"
            priority
          />
        )}

        {activeView === "system" ? (
          <div className="gallery-system-note" aria-hidden="true">
            <span>{product.campaign?.scene ?? "Colección Mujer"}</span>
            <strong>{product.campaign ? "Con Maite" : "Sistema de capas"}</strong>
          </div>
        ) : null}
      </div>

      <div className="product-gallery__caption">
        <span>Concepto visual</span>
        <span>{active.label}</span>
      </div>
    </div>
  );
}
