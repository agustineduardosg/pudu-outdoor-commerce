import "server-only";

import { ConfigurationError } from "./errors";

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function demoModeAllowed(): boolean {
  if (isProduction()) return false;
  return (
    process.env.PUDU_DEMO_MODE === "true" ||
    process.env.DATABASE_URL === undefined
  );
}

export function canonicalAppOrigin(): string {
  const configured = process.env.APP_ORIGIN;
  if (!configured) {
    if (isProduction()) {
      throw new ConfigurationError("APP_ORIGIN es obligatorio en producción.");
    }
    return "http://localhost:3000";
  }

  try {
    const url = new URL(configured);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(
      url.hostname,
    );
    if (isProduction() && url.protocol !== "https:" && !isLoopback) {
      throw new Error();
    }
    return url.origin;
  } catch {
    throw new ConfigurationError("APP_ORIGIN no es un origen válido.");
  }
}

export function mercadoPagoMode(): "sandbox" {
  const mode = process.env.MERCADO_PAGO_MODE ?? "sandbox";
  if (mode !== "sandbox") {
    throw new ConfigurationError(
      "Esta versión solo admite el adaptador Mercado Pago sandbox.",
    );
  }
  return mode;
}
