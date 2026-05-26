import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Separator } from "@/components/ui/separator";

interface OrderCardItem {
  id: string;
  productName: string;
  quantity: number;
  subtotal: number | string;
}

interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    total: number | string;
    itemCount: number;
    createdAt: Date | string;
    items?: OrderCardItem[];
  };
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  COD: "COD",
  BANK_TRANSFER: "Chuyển khoản",
  VNPAY: "VNPay",
  STRIPE: "Stripe",
  MOMO: "MoMo",
};

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      href={ROUTES.ORDER_DETAIL(order.id)}
      className="block rounded-2xl border border-gray-200 bg-white hover:border-[#22c55e]/50 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-[#22c55e]" />
          <span className="text-sm font-semibold text-gray-700">#{order.orderNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Items preview */}
      <div className="px-5 py-3 space-y-1.5">
        {order.items?.slice(0, 2).map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-600 truncate flex-1 pr-4">
              {item.productName}
              <span className="text-gray-400 ml-1">×{item.quantity}</span>
            </span>
            <span className="shrink-0 text-gray-700 font-medium">
              {formatCurrency(Number(item.subtotal))}
            </span>
          </div>
        ))}
        {(order.items?.length ?? 0) > 2 && (
          <p className="text-xs text-gray-400">
            +{(order.items?.length ?? 0) - 2} sản phẩm khác
          </p>
        )}
      </div>

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 text-sm">
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
          <p className="text-xs text-gray-400">{PAYMENT_LABELS[order.paymentMethod]}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Tổng cộng</p>
          <p className="font-bold text-[#22c55e]">{formatCurrency(Number(order.total))}</p>
        </div>
      </div>
    </Link>
  );
}
