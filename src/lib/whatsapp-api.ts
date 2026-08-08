const GRAPH_API_VERSION = "v22.0";

// Notificación automática por la WhatsApp Cloud API (Meta) — best-effort:
// nunca lanza, porque un fallo acá (token vencido, número sin verificar,
// ventana de 24h cerrada) no debe tumbar la creación del pedido del cliente.
export async function sendWhatsAppNotification(message: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_NUMBER;

  if (!token || !phoneNumberId || !to) {
    console.error(
      "WhatsApp Cloud API no configurada (faltan WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_NUMBER)"
    );
    return;
  }

  const digits = to.replace(/\D/g, "");

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: digits,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      console.error("Error enviando notificación de WhatsApp:", res.status, errorBody);
    }
  } catch (err) {
    console.error("Error enviando notificación de WhatsApp:", err);
  }
}
