export const ORDER_STATUSES = [
  "pendiente",
  "preparando",
  "listo",
  "entregado",
  "cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  preparando: "Preparando",
  listo: "Listo",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_ICONS: Record<OrderStatus, string> = {
  pendiente: "🕒",
  preparando: "👨‍🍳",
  listo: "✅",
  entregado: "📦",
  cancelado: "✕",
};

// Orden en el que avanza un pedido normalmente (sin contar cancelado).
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pendiente",
  "preparando",
  "listo",
  "entregado",
];

export function isValidOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function getOrderStatusLabel(status: string) {
  return isValidOrderStatus(status) ? ORDER_STATUS_LABELS[status] : status;
}

export function getOrderStatusIcon(status: string) {
  return isValidOrderStatus(status) ? ORDER_STATUS_ICONS[status] : "🕒";
}

export function getNextOrderStatus(status: string): OrderStatus | null {
  const index = ORDER_STATUS_FLOW.indexOf(status as OrderStatus);
  if (index === -1 || index === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[index + 1];
}

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  delivery: "Delivery",
  pickup: "Recojo en tienda",
};

export function getDeliveryTypeLabel(deliveryType: string) {
  return DELIVERY_TYPE_LABELS[deliveryType] ?? deliveryType;
}
