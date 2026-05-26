/**
 * Zalo ZNS Integration
 * Requires in .env.local:
 *   ZALO_OA_ACCESS_TOKEN=...
 *   ZALO_ZNS_TEMPLATE_CONFIRMED=...
 *   ZALO_ZNS_TEMPLATE_SHIPPED=...
 *   ZALO_ZNS_TEMPLATE_DELIVERED=...
 *   ZALO_ZNS_TEMPLATE_FAILED=...
 */

const ZALO_ZNS_URL = "https://business.openapi.zalo.me/message/template";

interface ZaloSendParams {
  phone: string;
  templateId: string;
  templateData: Record<string, string>;
  trackingId?: string;
}

interface ZaloResponse {
  error: number;
  message: string;
  data?: { msg_id: string };
}

export async function sendZaloZNS(params: ZaloSendParams): Promise<ZaloResponse | null> {
  const token = process.env.ZALO_OA_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(ZALO_ZNS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: token,
      },
      body: JSON.stringify({
        phone: params.phone,
        template_id: params.templateId,
        template_data: params.templateData,
        tracking_id: params.trackingId,
      }),
    });
    return (await res.json()) as ZaloResponse;
  } catch {
    return null;
  }
}

export const ZALO_TEMPLATES = {
  ORDER_CONFIRMED: process.env.ZALO_ZNS_TEMPLATE_CONFIRMED ?? "",
  ORDER_SHIPPED: process.env.ZALO_ZNS_TEMPLATE_SHIPPED ?? "",
  ORDER_DELIVERED: process.env.ZALO_ZNS_TEMPLATE_DELIVERED ?? "",
  ORDER_FAILED: process.env.ZALO_ZNS_TEMPLATE_FAILED ?? "",
  ORDER_CANCELLED: process.env.ZALO_ZNS_TEMPLATE_CANCELLED ?? "",
};

export async function notifyOrderStatus(
  phone: string | null | undefined,
  status: string,
  orderNumber: string,
  orderId: string
): Promise<void> {
  if (!phone || !process.env.ZALO_OA_ACCESS_TOKEN) return;

  const template = ZALO_TEMPLATES[status as keyof typeof ZALO_TEMPLATES];
  if (!template) return;

  const templateData: Record<string, string> = {
    order_number: orderNumber,
    order_id: orderId,
  };

  const result = await sendZaloZNS({
    phone,
    templateId: template,
    templateData,
    trackingId: `${orderId}-${status}`,
  });

  // Fire-and-forget: log to DB via a background process
  // Import is lazy to avoid circular deps in API routes
  if (result !== null) {
    const { db } = await import("@/lib/db");
    await db.zaloNotification.create({
      data: {
        phone,
        templateId: template,
        orderId,
        payload: JSON.stringify(templateData),
        status: result.error === 0 ? "SENT" : "FAILED",
        sentAt: result.error === 0 ? new Date() : null,
        error: result.error !== 0 ? result.message : null,
      },
    }).catch(() => {});
  }
}
