"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { MapPin, Phone, Clock, User, Package, Navigation, Loader2, Printer, StickyNote, AlertTriangle, CreditCard } from "lucide-react";
import Link from "next/link";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "FAILED", label: "Thanh toán thất bại" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

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
  adminNote?: string | null;
  deliverySlot?: string | null;
  referralPhone?: string | null;
  hasAddressAnomaly?: boolean;
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
    lat?: number | null;
    lng?: number | null;
    mapLink?: string | null;
  } | null;
  items: {
    id: string;
    productName: string;
    productImage: string | null;
    price: number | string;
    quantity: number;
    subtotal: number | string;
    product: { id: string; images: { url: string }[] } | null;
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
  const [nextPaymentStatus, setNextPaymentStatus] = useState<string>("");
  const [adminNoteText, setAdminNoteText] = useState(order.adminNote ?? "");
  const [savingNote, setSavingNote] = useState(false);

  const allowedTransitions = STATUS_TRANSITIONS[order.status];

  const updateMutation = useMutation({
    mutationFn: async (data: { status?: string; paymentStatus?: string; adminNote?: string }) => {
      await axios.patch(`/api/admin/orders/${order.id}`, data);
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", order.id] });
      if (vars.status) {
        toast({ title: "Đã cập nhật trạng thái đơn hàng", variant: "success" });
        setNextStatus("");
      }
      if (vars.paymentStatus) {
        toast({ title: "Đã cập nhật trạng thái thanh toán", variant: "success" });
        setNextPaymentStatus("");
      }
      if (vars.adminNote !== undefined) {
        toast({ title: "Đã lưu ghi chú nội bộ", variant: "success" });
      }
    },
    onError: () => toast({ title: "Lỗi cập nhật", variant: "destructive" }),
  });

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await axios.patch(`/api/admin/orders/${order.id}`, { adminNote: adminNoteText });
      toast({ title: "Đã lưu ghi chú nội bộ", variant: "success" });
    } catch {
      toast({ title: "Lỗi lưu ghi chú", variant: "destructive" });
    } finally {
      setSavingNote(false);
    }
  };

  // Prefer stored mapLink, fall back to text-based Google Maps search
  const mapsUrl =
    order.address?.mapLink ||
    (order.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`
        )}`
      : null);

  const coordsMapsUrl =
    order.address?.lat && order.address?.lng
      ? `https://maps.google.com/?q=${order.address.lat},${order.address.lng}`
      : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: items + totals + status actions */}
      <div className="xl:col-span-2 space-y-5">
        {/* Address anomaly warning */}
        {order.hasAddressAnomaly && (
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-semibold">Cảnh báo địa chỉ bất thường</p>
              <p className="text-xs mt-0.5">Số điện thoại này đã đặt hàng với nhiều địa chỉ khác nhau. Vui lòng xác nhận trước khi giao.</p>
            </div>
          </div>
        )}

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
              <CardTitle>Cập nhật trạng thái đơn</CardTitle>
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
                  onClick={() => nextStatus && updateMutation.mutate({ status: nextStatus })}
                  className="rounded-xl bg-[#16a34a] hover:bg-[#16a34a] shrink-0"
                >
                  {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Cập nhật
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment status update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-[#22c55e]" />
              Cập nhật thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Quick mark-as-paid button for pending bank transfers */}
            {order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus === "PENDING" && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-amber-800">Chưa xác nhận thanh toán</p>
                  <p className="text-xs text-amber-600 mt-0.5">Khách báo đã chuyển khoản nhưng hệ thống chưa nhận?</p>
                </div>
                <Button
                  size="sm"
                  disabled={updateMutation.isPending}
                  onClick={() => updateMutation.mutate({ paymentStatus: "PAID" })}
                  className="rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white shrink-0 whitespace-nowrap"
                >
                  {updateMutation.isPending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : "Đánh dấu đã thanh toán"
                  }
                </Button>
              </div>
            )}
            <div className="flex gap-3">
              <Select
                value={nextPaymentStatus || order.paymentStatus}
                onValueChange={setNextPaymentStatus}
              >
                <SelectTrigger className="flex-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!nextPaymentStatus || nextPaymentStatus === order.paymentStatus || updateMutation.isPending}
                onClick={() => nextPaymentStatus && updateMutation.mutate({ paymentStatus: nextPaymentStatus })}
                variant="outline"
                className="rounded-xl shrink-0"
              >
                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Lưu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin note (internal) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <StickyNote className="h-4 w-4 text-amber-500" />
              Ghi chú nội bộ
              <span className="text-xs font-normal text-gray-400">(chỉ admin thấy)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={adminNoteText}
              onChange={(e) => setAdminNoteText(e.target.value)}
              placeholder="Ghi chú nội bộ về đơn hàng này..."
              className="rounded-xl resize-none text-sm"
              rows={3}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={savingNote}
              onClick={handleSaveNote}
              className="rounded-lg"
            >
              {savingNote && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Lưu ghi chú
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right: customer + delivery */}
      <div className="space-y-5">
        {/* Status overview */}
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
              {coordsMapsUrl && (
                <a
                  href={coordsMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600"
                >
                  <Navigation className="h-3 w-3" />
                  GPS
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
        {(order.deliverySlot || order.note || order.referralPhone) && (
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
                  <p className="text-xs text-gray-400">Ghi chú khách</p>
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
