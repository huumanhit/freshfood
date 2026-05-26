"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { MapPin, Phone, Clock, User, Package, Navigation, Loader2, Printer } from "lucide-react";
import Link from "next/link";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STATUS_TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
  FAILED: [],
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Giao thất bại",
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản / VietQR",
  VNPAY: "VNPay",
  STRIPE: "Stripe",
  MOMO: "MoMo",
};

interface OrderDetailData {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number | string;
  shippingFee: number | string;
  discount: number | string;
  total: number | string;
  note: string | null;
  deliverySlot?: string | null;
  referralPhone?: string | null;
  createdAt: string | Date;
  shippedAt: string | Date | null;
  deliveredAt: string | Date | null;
  cancelledAt: string | Date | null;
  user: { id: string; name: string | null; email: string; phone: string | null } | null;
  address: {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    street: string;
  } | null;
  items: {
    id: string;
    productName: string;
    productImage: string | null;
    price: number | string;
    quantity: number;
    subtotal: number | string;
    product: {
      id: string;
      images: { url: string }[];
    } | null;
  }[];
  coupon: { code: string; type: string; value: number | string } | null;
}

interface AdminOrderDetailProps {
  order: OrderDetailData;
}

export function AdminOrderDetail({ order }: AdminOrderDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState<string>("");

  const allowedTransitions = STATUS_TRANSITIONS[order.status];

  const updateMutation = useMutation({
    mutationFn: async (status: string) => {
      await axios.patch(`/api/admin/orders/${order.id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", order.id] });
      toast({ title: "Đã cập nhật trạng thái đơn hàng", variant: "success" });
      setNextStatus("");
    },
    onError: () => toast({ title: "Lỗi cập nhật trạng thái", variant: "destructive" }),
  });

  const fullAddress = order.address
    ? `${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`
    : null;

  const mapsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: items + totals */}
      <div className="xl:col-span-2 space-y-5">
        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#22c55e]" />
              Sản phẩm đã đặt ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => {
                const img = item.product?.images[0]?.url ?? item.productImage;
                return (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {img ? (
                        <Image src={img} alt={item.productName} fill sizes="48px" className="object-cover" unoptimized />
                      ) : <div className="h-full w-full bg-gray-100" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(Number(item.price))} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 shrink-0">
                      {formatCurrency(Number(item.subtotal))}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-4 bg-gray-50 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển</span>
                {Number(order.shippingFee) === 0
                  ? <span className="text-[#22c55e]">Miễn phí</span>
                  : <span>{formatCurrency(Number(order.shippingFee))}</span>}
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá {order.coupon && `(${order.coupon.code})`}</span>
                  <span>-{formatCurrency(Number(order.discount))}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Tổng cộng</span>
                <span className="text-[#22c55e] text-lg">{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status update */}
        {allowedTransitions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cập nhật trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Select value={nextStatus} onValueChange={setNextStatus}>
                  <SelectTrigger className="flex-1 rounded-xl">
                    <SelectValue placeholder="Chọn trạng thái mới..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedTransitions.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!nextStatus || updateMutation.isPending}
                  onClick={() => nextStatus && updateMutation.mutate(nextStatus)}
                  className="rounded-xl bg-[#22c55e] hover:bg-[#16a34a] shrink-0"
                >
                  {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Cập nhật
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: customer + delivery */}
      <div className="space-y-5">
        {/* Status */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Trạng thái đơn</p>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Thanh toán</p>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Phương thức</p>
              <p className="text-xs text-gray-700">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-gray-400">Đặt lúc</p>
              <p className="text-sm font-medium text-gray-800">{formatDateTime(order.createdAt)}</p>
            </div>
            {order.shippedAt && (
              <div>
                <p className="text-xs text-gray-400">Giao lúc</p>
                <p className="text-sm font-medium text-gray-800">{formatDateTime(order.shippedAt)}</p>
              </div>
            )}
            {order.deliveredAt && (
              <div>
                <p className="text-xs text-gray-400">Nhận lúc</p>
                <p className="text-sm font-medium text-gray-800">{formatDateTime(order.deliveredAt)}</p>
              </div>
            )}
            <Separator />
            <Link
              href={`/admin/orders/${order.id}/packing-slip`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Phiếu đóng gói
            </Link>
          </CardContent>
        </Card>

        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-[#22c55e]" /> Khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold text-gray-800">{order.user?.name ?? order.address?.fullName ?? "Khách hàng"}</p>
            {order.user?.email && <p className="text-gray-500 text-xs">{order.user.email}</p>}
            {(order.user?.phone ?? order.address?.phone) && (
              <a
                href={`tel:${order.user?.phone ?? order.address?.phone}`}
                className="inline-flex items-center gap-1.5 text-[#22c55e] font-medium hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {order.user?.phone ?? order.address?.phone}
              </a>
            )}
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#22c55e]" /> Địa chỉ giao hàng
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Navigation className="h-3 w-3" />
                  Maps
                </a>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {order.address ? (
              <>
                <p className="font-semibold text-gray-800">{order.address.fullName}</p>
                <a href={`tel:${order.address.phone}`} className="text-[#22c55e] font-medium flex items-center gap-1 hover:underline">
                  <Phone className="h-3 w-3" /> {order.address.phone}
                </a>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.province}
                </p>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Mở Google Maps
                  </a>
                )}
              </>
            ) : (
              <p className="text-gray-400">Chưa có địa chỉ</p>
            )}
          </CardContent>
        </Card>

        {/* Delivery info */}
        {(order.deliverySlot || order.note) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-[#22c55e]" /> Thông tin giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              {order.deliverySlot && (
                <div>
                  <p className="text-xs text-gray-400">Khung giờ giao</p>
                  <p className="font-medium text-gray-800">{String(order.deliverySlot).replace("-", " – ")}</p>
                </div>
              )}
              {order.note && (
                <div>
                  <p className="text-xs text-gray-400">Ghi chú</p>
                  <p className="text-gray-700 bg-gray-50 rounded-lg px-3 py-2 text-xs leading-relaxed mt-1">{order.note}</p>
                </div>
              )}
              {order.referralPhone && (
                <div>
                  <p className="text-xs text-gray-400">SĐT giới thiệu</p>
                  <p className="font-medium text-gray-800">{String(order.referralPhone)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
