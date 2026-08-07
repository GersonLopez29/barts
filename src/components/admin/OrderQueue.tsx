"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  ORDER_STATUSES,
  getDeliveryTypeLabel,
  getNextOrderStatus,
  getOrderStatusIcon,
  getOrderStatusLabel,
} from "@/lib/orders";
import type { OrderData } from "@/components/OrderTracker";

const POLL_INTERVAL_MS = 6000;

const FILTERS = ["todos", ...ORDER_STATUSES] as const;

function statusBadgeClass(status: string) {
  switch (status) {
    case "pendiente":
      return "bg-amber-100 text-amber-700";
    case "preparando":
      return "bg-blue-100 text-blue-700";
    case "listo":
      return "bg-green-100 text-green-700";
    case "entregado":
      return "bg-zinc-100 text-zinc-600";
    case "cancelado":
      return "bg-red-100 text-red-700";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
}

export default function OrderQueue({ initialOrders }: { initialOrders: OrderData[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("todos");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) return;
      const data: OrderData[] = await res.json();
      setOrders(data);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    if (!res.ok) return;
    const updated: OrderData = await res.json();
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  const filteredOrders = orders.filter((o) => filter === "todos" || o.status === filter);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f
                ? "bg-red-600 text-white"
                : "border border-zinc-300 text-zinc-600 hover:border-red-300"
            }`}
          >
            {f === "todos" ? "Todos" : `${getOrderStatusIcon(f)} ${getOrderStatusLabel(f)}`}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-400">No hay pedidos en este filtro.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {filteredOrders.map((order) => {
            const nextStatus = getNextOrderStatus(order.status);
            const isFinal = order.status === "entregado" || order.status === "cancelado";
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      #{order.id.slice(-6).toUpperCase()} — {order.customerName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {order.phone} · {getDeliveryTypeLabel(order.deliveryType)}
                      {order.address ? ` — ${order.address}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(
                      order.status
                    )}`}
                  >
                    {getOrderStatusIcon(order.status)} {getOrderStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-3 space-y-0.5 border-t border-zinc-100 pt-3 text-sm text-zinc-700">
                  {order.items.map((item) => (
                    <p key={item.id}>
                      {item.quantity}× {item.name}
                    </p>
                  ))}
                  {order.notes && (
                    <p className="mt-1 text-xs italic text-zinc-500">Notas: {order.notes}</p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                  <span className="text-base font-extrabold text-red-600">
                    {formatPrice(order.total)}
                  </span>
                  {!isFinal && (
                    <div className="flex gap-2">
                      {nextStatus && (
                        <button
                          type="button"
                          disabled={updatingId === order.id}
                          onClick={() => updateStatus(order.id, nextStatus)}
                          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                          {updatingId === order.id
                            ? "Guardando..."
                            : `Marcar ${getOrderStatusLabel(nextStatus)}`}
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() => updateStatus(order.id, "cancelado")}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
