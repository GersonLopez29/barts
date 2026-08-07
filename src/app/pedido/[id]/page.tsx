import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import OrderTracker from "@/components/OrderTracker";

type PedidoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PedidoPage({ params }: PedidoPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <OrderTracker
      initialOrder={{
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
      }}
      whatsappNumber={process.env.WHATSAPP_NUMBER ?? ""}
    />
  );
}
