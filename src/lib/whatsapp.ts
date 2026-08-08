import { formatPrice } from "@/lib/format";
import { getDeliveryTypeLabel } from "@/lib/orders";

export function buildWhatsAppLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

type OrderForMessage = {
  id: string;
  customerName: string;
  phone: string;
  deliveryType: string;
  address: string | null;
  notes: string | null;
  total: number;
  items: { name: string; unitPrice: number; quantity: number }[];
};

// Mensaje que recibe el negocio (vía la Cloud API o, si falla, como respaldo el
// botón manual del cliente). Distinto del que arma OrderTracker para el cliente:
// acá sí interesa el teléfono, porque el dueño necesita poder llamar de vuelta.
export function buildBusinessOrderMessage(order: OrderForMessage) {
  const lines = [
    "🍔 Nuevo pedido en Bart's",
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
  lines.push("", `Cliente: ${order.customerName} — ${order.phone}`);
  return lines.join("\n");
}
