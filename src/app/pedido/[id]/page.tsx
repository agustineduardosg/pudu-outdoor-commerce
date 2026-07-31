import type { Metadata } from "next";
import { OrderStatusView } from "@/components/order-status";

export const metadata: Metadata = {
  title: "Estado del pedido",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token = "" } = await searchParams;

  return (
    <main id="contenido" tabIndex={-1} className="order-page page-shell">
      <OrderStatusView orderId={id} token={token} />
    </main>
  );
}
