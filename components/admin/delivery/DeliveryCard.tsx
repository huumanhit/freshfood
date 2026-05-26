"use client";

import { MapPin, Phone, Clock, Navigation, Package, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { DeliveryOrder } from "./DeliveryBoard";
import type { DeliveryAction } from "./DeliveryActionModal";

interface DeliveryCardProps {
  order: DeliveryOrder;
  onAction: (order: DeliveryOrder, action: DeliveryAction) => void;
}

export function DeliveryCard({ order, onAction }: DeliveryCardProps) {
  const address = order.address;
  const fullAddress = address
    ? `${address.street}, ${address.ward}, ${address.district}, ${address.province}`
    : null;
  const mapsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;

  const customerName = order.user?.name ?? address?.fullName ?? "Khách hàng";
  const phone = order.user?.phone ?? address?.phone ?? null;
  const isCod = order.paymentMethod === "COD";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-sm">#{order.orderNumber}</span>
          <OrderStatusBadge status={order.status as never} />
        </div>
        <span className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Customer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">{customerName}</p>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-1 text-[#22c55e] text-sm font-medium mt-0.5 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {phone}
              </a>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 text-base">{formatCurrency(order.total)}</p>
            {isCod && (
              <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full mt-0.5">
                <Banknote className="h-3 w-3" />
                Thu COD
              </span>
            )}
          </div>
        </div>

        {/* Address */}
        {address && (
          <div className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 leading-relaxed">{fullAddress}</p>
              {address.fullName && address.fullName !== customerName && (
                <p className="text-xs text-gray-500 mt-0.5">Giao cho: {address.fullName}</p>
              )}
            </div>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 text-xs text-blue-500 font-medium hover:text-blue-600"
              >
                <Navigation className="h-3.5 w-3.5" />
                Maps
              </a>
            )}
          </div>
        )}

        {/* Items summary */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Package className="h-3.5 w-3.5" />
          <span>
            {order.items.slice(0, 2).map((it) => `${it.productName} ×${it.quantity}`).join(", ")}
            {order.items.length > 2 && ` +${order.items.length - 2} món`}
          </span>
        </div>

        {/* Delivery slot / note */}
        {(order.deliverySlot || order.note) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {order.deliverySlot && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 rounded-full px-2.5 py-1 font-medium">
                <Clock className="h-3 w-3" />
                {String(order.deliverySlot).replace("-", " – ")}
              </span>
            )}
            {order.note && (
              <span className="text-gray-500 italic">"{order.note}"</span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="pt-1">
          {(order.status === "CONFIRMED" || order.status === "PROCESSING") && (
            <Button
              className="w-full h-12 text-base font-semibold rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => onAction(order, "pickup")}
            >
              Bắt đầu giao
            </Button>
          )}

          {order.status === "SHIPPED" && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="h-12 text-sm font-semibold rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white"
                onClick={() => onAction(order, "delivered")}
              >
                Đã giao
              </Button>
              <Button
                variant="outline"
                className="h-12 text-sm font-semibold rounded-xl border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => onAction(order, "failed")}
              >
                Thất bại
              </Button>
            </div>
          )}

          {order.status === "DELIVERED" && order.deliveredAt && (
            <p className="text-center text-xs text-gray-400">
              Đã giao lúc {formatDateTime(order.deliveredAt)}
            </p>
          )}

          {order.status === "FAILED" && order.failedAt && (
            <p className="text-center text-xs text-red-400">
              Thất bại lúc {formatDateTime(order.failedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
