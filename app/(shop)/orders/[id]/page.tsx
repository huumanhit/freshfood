import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, Clock, CreditCard, ChevronLeft, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUTES } from "@/constants/routes";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Chi tiết đơn hàng — FreshFood" };

interface OrderDetailPageProps {
  params: { id: string };
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản / VietQR",
  VNPAY: "VNPay",
  STRIPE: "Stripe",
  MOMO: "MoMo",
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect(ROUTES.LOGIN);

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      address: true,
    },
  });

  if (!order || order.userId !== session.user.id) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderAny = order as any;

  return (
    <div className="bg-[#f7fdf8] min-h-screen">
      <div className="container py-8 max-w-3xl space-y-6">
        {/* Back + header */}
        <div className="space-y-3">
          <Link
            href={ROUTES.ORDERS}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#22c55e] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Đơn hàng của tôi
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#22c55e]" />
              <h1 className="text-xl font-bold text-gray-900">#{order.orderNumber}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            Đặt lúc {formatDateTime(order.createdAt)}
          </div>
        </div>

        {/* Items */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
          <h2 className="font-bold text-gray-900">Sản phẩm đã đặt</h2>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatCurrency(Number(item.price))} × {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-gray-800">
                  {formatCurrency(Number(item.subtotal))}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Tạm tính</span>
              <span>{formatCurrency(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Phí vận chuyển</span>
              {Number(order.shippingFee) === 0 ? (
                <span className="text-[#22c55e]">Miễn phí</span>
              ) : (
                <span>{formatCurrency(Number(order.shippingFee))}</span>
              )}
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span>-{formatCurrency(Number(order.discount))}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Tổng cộng</span>
              <span className="text-[#22c55e] text-lg">{formatCurrency(Number(order.total))}</span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
          <h2 className="font-bold text-gray-900">Thông tin giao hàng</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            {order.address && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="font-medium text-gray-700 text-xs uppercase tracking-wide">Địa chỉ</span>
                </div>
                <p className="font-semibold text-gray-800">{order.address.fullName}</p>
                <p className="text-gray-600">{order.address.phone}</p>
                <p className="text-gray-500 text-xs">
                  {order.address.street}, {order.address.ward},{" "}
                  {order.address.district}, {order.address.province}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {orderAny.deliverySlot && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-medium text-gray-700 text-xs uppercase tracking-wide">
                      Khung giờ giao
                    </span>
                  </div>
                  <p className="text-gray-800">{String(orderAny.deliverySlot).replace("-", " – ")}</p>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span className="font-medium text-gray-700 text-xs uppercase tracking-wide">
                    Thanh toán
                  </span>
                </div>
                <p className="text-gray-800">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          {order.note && (
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Ghi chú: </span>
              {order.note}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Trạng thái đơn hàng</h2>
          <div className="space-y-3">
            <TimelineItem
              label="Đặt hàng"
              time={formatDateTime(order.createdAt)}
              done
            />
            <TimelineItem
              label="Xác nhận"
              time={order.status !== "PENDING" ? "Đã xác nhận" : undefined}
              done={order.status !== "PENDING"}
            />
            <TimelineItem
              label="Đang giao"
              time={order.shippedAt ? formatDateTime(order.shippedAt) : undefined}
              done={!!order.shippedAt}
            />
            <TimelineItem
              label="Đã giao"
              time={order.deliveredAt ? formatDateTime(order.deliveredAt) : undefined}
              done={!!order.deliveredAt}
              last
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  label,
  time,
  done,
  last = false,
}: {
  label: string;
  time?: string;
  done: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full border-2 mt-0.5 ${
            done ? "border-[#22c55e] bg-[#22c55e]" : "border-gray-300 bg-white"
          }`}
        />
        {!last && <div className={`w-0.5 flex-1 mt-1 ${done ? "bg-[#22c55e]" : "bg-gray-200"}`} />}
      </div>
      <div className="pb-3 flex-1">
        <p className={`text-sm font-medium ${done ? "text-gray-800" : "text-gray-400"}`}>{label}</p>
        {time && <p className="text-xs text-gray-400 mt-0.5">{time}</p>}
      </div>
    </div>
  );
}
