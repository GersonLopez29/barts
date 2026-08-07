import { prisma } from "@/lib/db";
import OrderQueue from "@/components/admin/OrderQueue";

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <OrderQueue
      initialOrders={orders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        deliveryType: order.deliveryType,
        address: order.address,
        notes: order.notes,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      }))}
    />
  );
}
