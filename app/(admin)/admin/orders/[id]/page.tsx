import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { AdminOrderDetail } from "@/components/admin/orders/AdminOrderDetail";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { ROUTES } from "@/constants/routes";

export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: AdminOrderDetailPageProps): Promise<Metadata> {
  const order = await db.order.findUnique({ where: { id: params.id }, select: { orderNumber: true } });
  return { title: order ? `Đơn #${order.orderNumber}` : "Đơn hàng không tồn tại" };
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      address: true,
      items: {
        include: {
          product: { select: { id: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } } },
        },
      },
      coupon: { select: { code: true, type: true, value: true } },
    },
  });

  if (!order) notFound();

  // Cast to access Phase 7 fields (deliverySlot, referralPhone) that may not
  // appear in IDE types until `prisma generate` output is reloaded
  const o = order as typeof order & { deliverySlot?: string | null; referralPhone?: string | null };

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={ROUTES.ADMIN_ORDERS}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#22c55e] transition-colors mb-2"
        >
          <ChevronLeft className="h-4 w-4" /> Danh sách đơn hàng
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Đơn #{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <AdminOrderDetail
        order={{
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          subtotal: Number(order.subtotal),
          shippingFee: Number(order.shippingFee),
          discount: Number(order.discount),
          total: Number(order.total),
          note: order.note ?? null,
          deliverySlot: o.deliverySlot ?? null,
          referralPhone: o.referralPhone ?? null,
          createdAt: order.createdAt.toISOString(),
          shippedAt: order.shippedAt?.toISOString() ?? null,
          deliveredAt: order.deliveredAt?.toISOString() ?? null,
          cancelledAt: order.cancelledAt?.toISOString() ?? null,
          user: order.user,
          address: order.address,
          items: order.items.map((item) => ({
            id: item.id,
            productName: item.productName,
            productImage: item.productImage ?? null,
            price: Number(item.price),
            quantity: item.quantity,
            subtotal: Number(item.subtotal),
            product: item.product
              ? { id: item.product.id, images: item.product.images }
              : null,
          })),
          coupon: order.coupon
            ? { code: order.coupon.code, type: order.coupon.type, value: Number(order.coupon.value) }
            : null,
        }}
      />
    </div>
  );
}
