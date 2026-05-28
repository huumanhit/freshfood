import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Package, MapPin, Clock, CreditCard, ChevronRight, MessageCircle } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";
import { db } from "@/lib/db";
import { ROUTES } from "@/constants/routes";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Đặt hàng thành công — FreshFood" };

interface CheckoutSuccessPageProps {
  searchParams: { orderId?: string; phone?: string };
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản / VietQR",
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { orderId } = searchParams;

  let order = null;
  try {
    order = orderId
      ? await db.order.findUnique({
          where: { id: orderId },
          include: { items: true, address: true },
        })
      : null;
  } catch {
    // DB error — still show success since order was placed
  }

  if (!order) {
    return (
      <div className="container py-16 text-center space-y-4 max-w-md mx-auto">
        <Image src="/logo.png" alt="Đặt hàng thành công" width={260} height={210} className="mx-auto object-contain" />
        <h1 className="text-2xl font-bold text-gray-900">Đặt hàng thành công!</h1>
        <p className="text-gray-500">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ xác nhận sớm nhất.</p>
        <Button asChild className="rounded-xl bg-[#22c55e] hover:bg-[#16a34a]">
          <Link href={ROUTES.HOME}>Về trang chủ</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#f7fdf8] min-h-screen py-10">
      <div className="container max-w-2xl space-y-6">
        {/* Success header */}
        <div className="rounded-2xl bg-white border border-gray-100 pt-6 pb-8 px-8 text-center space-y-3 shadow-sm">
          <div className="flex justify-center">
            <Image src="/logo.png" alt="Đặt hàng thành công" width={220} height={176} className="object-contain" />
          </div>
          <div className="flex justify-center -mt-2">
            <div className="flex items-center gap-2 text-[#22c55e]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Đặt hàng thành công!</h1>
          <p className="text-gray-500 text-sm">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận và sẽ sớm được xử lý.
          </p>
          <div className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e]/5 border border-[#22c55e]/20 px-4 py-2">
            <Package className="h-4 w-4 text-[#22c55e]" />
            <span className="text-sm font-semibold text-[#22c55e]">#{order.orderNumber}</span>
          </div>
        </div>

        {/* Order details */}
        <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4 shadow-sm">
          <h2 className="font-bold text-gray-900">Chi tiết đơn hàng</h2>

          {/* Items */}
          <div className="space-y-2.5">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 flex-1 min-w-0 pr-4 truncate">
                  {item.productName}{" "}
                  <span className="text-gray-400">×{item.quantity}</span>
                </span>
                <span className="font-medium text-gray-800 shrink-0">
                  {formatCurrency(Number(item.subtotal))}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
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
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Tổng cộng</span>
              <span className="text-[#22c55e] text-lg">{formatCurrency(Number(order.total))}</span>
            </div>
          </div>
        </div>

        {/* Delivery & payment info */}
        <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4 shadow-sm">
          <h2 className="font-bold text-gray-900">Thông tin giao hàng</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {order.address && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="font-medium text-gray-700">Địa chỉ nhận hàng</span>
                </div>
                <p className="text-gray-800 font-medium">{order.address.fullName}</p>
                <p className="text-gray-600">{order.address.phone}</p>
                <p className="text-gray-600 text-xs">
                  {order.address.street}, {order.address.ward}, {order.address.district},{" "}
                  {order.address.province}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {(order as { deliverySlot?: string | null }).deliverySlot && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-medium text-gray-700">Khung giờ giao</span>
                  </div>
                  <p className="text-gray-800">
                    {(order as { deliverySlot?: string | null }).deliverySlot!.replace("-", " – ")}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span className="font-medium text-gray-700">Thanh toán</span>
                </div>
                <p className="text-gray-800">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                </p>
              </div>

              <div className="text-xs text-gray-400">
                Đặt lúc {formatDateTime(order.createdAt)}
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

        {/* Zalo feedback */}
        <a
          href={`https://zalo.me/${APP_CONFIG.phone}?text=${encodeURIComponent(`Phản hồi đơn hàng #${order.orderNumber}: `)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          Phản hồi / Báo món chưa ưng qua Zalo
        </a>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-xl border-[#22c55e] text-[#22c55e] hover:bg-green-50"
          >
            <Link href={ROUTES.LOGIN}>
              Đăng nhập xem đơn hàng
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            className="flex-1 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white"
          >
            <Link href={ROUTES.PRODUCTS}>Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
