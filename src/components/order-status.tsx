"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, ShieldAlert } from "lucide-react";
import { formatCLP } from "@/data/products";
import type { OrderStatus, PaymentStatus } from "@/types/commerce";

type OrderData = {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalClp: number;
  currency: "CLP";
  createdAt: string;
  updatedAt: string;
};

const copy: Record<OrderStatus, { title: string; description: string }> = {
  PENDING_PAYMENT: {
    title: "Estamos verificando tu pago.",
    description:
      "La confirmación llega directamente desde Mercado Pago. Esta página se actualizará automáticamente.",
  },
  PAID: {
    title: "Pago confirmado.",
    description: "Tu pedido fue recibido y pasará a preparación.",
  },
  PREPARING: {
    title: "Preparando tu pedido.",
    description: "Estamos reuniendo y revisando tus prendas.",
  },
  SHIPPED: {
    title: "Tu pedido está en camino.",
    description: "El seguimiento será informado por el canal de contacto.",
  },
  COMPLETED: {
    title: "Pedido entregado.",
    description: "Gracias por elegir PUDU.",
  },
  CANCELLED: {
    title: "El pedido fue cancelado.",
    description: "La reserva venció o el pago no pudo completarse.",
  },
  REVIEW: {
    title: "Necesitamos revisar el pago.",
    description:
      "No repitas la compra. El equipo PUDU verificará la operación antes de modificar el stock.",
  },
};

export function OrderStatusView({
  orderId,
  token,
}: {
  orderId: string;
  token: string;
}) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(true);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setRefreshing(true);
    try {
      const response = await fetch(
        `/api/v1/orders/${encodeURIComponent(orderId)}/status?token=${encodeURIComponent(token)}`,
        { cache: "no-store", signal },
      );
      if (!response.ok) throw new Error();
      const payload = (await response.json()) as { data: OrderData };
      setOrder(payload.data);
      setError("");
    } catch (requestError) {
      if (
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
      ) {
        return;
      }
      setError("No pudimos verificar el pedido con este enlace.");
    } finally {
      setRefreshing(false);
    }
  }, [orderId, token]);

  useEffect(() => {
    const controller = new AbortController();
    const initialRefresh = window.setTimeout(() => {
      void refresh(controller.signal);
    }, 0);
    const interval = window.setInterval(() => {
      void refresh(controller.signal);
    }, 5_000);
    return () => {
      controller.abort();
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const stateCopy = order ? copy[order.status] : null;
  const Icon =
    order?.status === "PAID" ||
    order?.status === "PREPARING" ||
    order?.status === "SHIPPED" ||
    order?.status === "COMPLETED"
      ? CheckCircle2
      : order?.status === "REVIEW" || order?.status === "CANCELLED"
        ? ShieldAlert
        : Clock3;

  return (
    <section className="order-status-card" aria-live="polite">
      <Icon aria-hidden="true" size={34} strokeWidth={1.5} />
      <p className="eyebrow">Pedido {orderId.slice(0, 8).toUpperCase()}</p>
      <h1>{stateCopy?.title ?? "Consultando tu pedido…"}</h1>
      <p>{error || stateCopy?.description}</p>
      {order ? (
        <dl>
          <div>
            <dt>Estado</dt>
            <dd>{order.status.replaceAll("_", " ")}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatCLP(order.totalClp)}</dd>
          </div>
          <div>
            <dt>Última actualización</dt>
            <dd>
              {new Intl.DateTimeFormat("es-CL", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(order.updatedAt))}
            </dd>
          </div>
        </dl>
      ) : null}
      <div className="order-status-actions">
        <button
          className="button button--dark"
          type="button"
          disabled={refreshing}
          onClick={() => void refresh()}
        >
          <RefreshCw aria-hidden="true" size={17} />
          {refreshing ? "Verificando…" : "Actualizar estado"}
        </button>
        <Link className="text-link" href="/contacto">
          Necesito ayuda
        </Link>
      </div>
      <p className="order-security-note">
        El regreso desde Mercado Pago no confirma el pago por sí solo. PUDU
        muestra únicamente el estado verificado por el servidor.
      </p>
    </section>
  );
}
