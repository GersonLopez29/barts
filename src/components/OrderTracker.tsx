"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  ORDER_STATUS_FLOW,
  getDeliveryTypeLabel,
  getOrderStatusIcon,
  getOrderStatusLabel,
} from "@/lib/orders";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export type OrderItemData = {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type OrderData = {
  id: string;
  customerName: string;
  phone: string;
  deliveryType: string;
  address: string | null;
  notes: string | null;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItemData[];
};

const POLL_INTERVAL_MS = 5000;

function buildOrderMessage(order: OrderData) {
  const lines = [
    "¡Hola! Hice un pedido en Bart's 🍔",
    `Pedido #${order.id.slice(-6).toUpperCase()}`,
    "",
    ...order.items.map(
      (i) => `${i.quantity}x ${i.name} — ${formatPrice(i.unitPrice * i.quantity)}`
    ),
    "",
    `Total: ${formatPrice(order.total)}`,
    `Entrega: ${getDeliveryTypeLabel(order.deliveryType)}${
      order.address ? ` (${order.address})` : ""
    }`,
  ];
  if (order.notes) lines.push(`Notas: ${order.notes}`);
  lines.push("", `Nombre: ${order.customerName}`);
  return lines.join("\n");
}

export default function OrderTracker({
  initialOrder,
  whatsappNumber,
}: {
  initialOrder: OrderData;
  whatsappNumber: string;
}) {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/orders/${initialOrder.id}`);
      if (!res.ok) return;
      const data: OrderData = await res.json();
      setOrder(data);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [initialOrder.id]);

  const stepIndex = ORDER_STATUS_FLOW.indexOf(
    order.status as (typeof ORDER_STATUS_FLOW)[number]
  );
  const isCancelled = order.status === "cancelado";
  const whatsappLink = buildWhatsAppLink(whatsappNumber, buildOrderMessage(order));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">¡Gracias por tu pedido!</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Pedido #{order.id.slice(-6).toUpperCase()}
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
        {isCancelled ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            ✕ Este pedido fue cancelado
          </p>
        ) : (
          <div className="flex items-center justify-between">
            {ORDER_STATUS_FLOW.map((status, i) => (
              <div key={status} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
                    i <= stepIndex ? "bg-red-600 text-white" : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {getOrderStatusIcon(status)}
                </span>
                <span
                  className={`text-center text-[11px] font-medium ${
                    i <= stepIndex ? "text-red-700" : "text-zinc-400"
                  }`}
                >
                  {getOrderStatusLabel(status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Detalle del pedido</h2>
        <div className="mt-3 divide-y divide-zinc-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-zinc-700">
                {item.quantity}× {item.name}
              </span>
              <span className="font-medium text-zinc-900">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-3">
          <span className="text-sm font-medium text-zinc-600">Total</span>
          <span className="text-lg font-extrabold text-red-600">
            {formatPrice(order.total)}
          </span>
        </div>
        <div className="mt-4 space-y-1 text-xs text-zinc-500">
          <p>
            {getDeliveryTypeLabel(order.deliveryType)}
            {order.address ? ` — ${order.address}` : ""}
          </p>
          {order.notes && <p>Notas: {order.notes}</p>}
        </div>
      </div>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-lg"
      >
        <span aria-hidden="true">💬</span> Avisar por WhatsApp
      </a>
    </div>
  );
}
