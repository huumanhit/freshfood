import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUTES } from "@/constants/routes";
import { OrderCard } from "@/components/orders/OrderCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Đơn hàng của tôi — FreshFood" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect(ROUTES.LOGIN);

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          subtotal: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-[#f7fdf8] min-h-screen">
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-[#22c55e]" />
          <h1 className="text-2xl font-bold font-display text-gray-900">Đơn hàng của tôi</h1>
          {orders.length > 0 && (
            <span className="text-sm text-gray-400">({orders.length} đơn hàng)</span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-700">Chưa có đơn hàng nào</h2>
              <p className="text-sm text-gray-400">
                Bạn chưa đặt hàng. Hãy khám phá các sản phẩm tươi ngon!
              </p>
            </div>
            <Link
              href={ROUTES.PRODUCTS}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#22c55e] text-white text-sm font-medium hover:bg-[#16a34a] transition-colors"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={{
                  ...order,
                  total: Number(order.total),
                  itemCount: order.items.length,
                  items: order.items.map((item) => ({
                    ...item,
                    subtotal: Number(item.subtotal),
                  })),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
