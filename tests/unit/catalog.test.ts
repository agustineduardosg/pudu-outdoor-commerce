import { describe, expect, it } from "vitest";
import { formatCLP, products } from "@/data/products";

describe("catálogo conceptual", () => {
  it("mantiene ocho productos con identidad única", () => {
    expect(products).toHaveLength(8);
    expect(new Set(products.map((product) => product.slug)).size).toBe(8);
    expect(new Set(products.map((product) => product.sku)).size).toBe(8);
  });

  it("usa precios CLP enteros y positivos", () => {
    for (const product of products) {
      expect(Number.isInteger(product.price)).toBe(true);
      expect(product.price).toBeGreaterThan(0);
      expect(formatCLP(product.price)).toMatch(/^\$\d/);
    }
  });
});
