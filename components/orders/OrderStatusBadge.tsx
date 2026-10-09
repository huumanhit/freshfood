import { OrderStatus, PaymentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const ORDER_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Chờ xác nhận",   className: "bg-amber-50 text-amber-700 border-amber-200" },
  CONFIRMED:  { label: "Đã xác nhận",     className: "bg-blue-50 text-blue-700 border-blue-200" },
  PROCESSING: { label: "Đang soạn hàng", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  SHIPPED:    { label: "Đang giao hàng", className: "bg-purple-50 text-purple-700 border-purple-200" },
  DELIVERED:  { label: "Đã giao hàng",   className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED:  { label: "Đã huỷ",         className: "bg-rose-50 text-rose-700 border-rose-200" },
  REFUNDED:   { label: "Đã hoàn tiền",   className: "bg-gray-50 text-gray-700 border-gray-200" },
  FAILED:     { label: "Giao thất bại",  className: "bg-red-50 text-red-700 border-red-200" },
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Chờ thanh toán", className: "bg-orange-50 text-orange-500 border-orange-200" },
  PAID: { label: "Đã thanh toán", className: "bg-green-50 text-green-600 border-green-200" },
  FAILED: { label: "Thanh toán lỗi", className: "bg-red-50 text-red-500 border-red-200" },
  REFUNDED: { label: "Đã hoàn tiền", className: "bg-gray-50 text-gray-500 border-gray-200" },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const config = PAYMENT_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
