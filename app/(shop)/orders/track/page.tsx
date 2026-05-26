"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Search, Package, MapPin, ChevronRight, Loader2, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";


interface OrderItem { productName: string; quantity: number; price: number; subtotal: number }
interface TrackOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  createdAt: string;
  deliveredAt: string | null;
  address: { fullName: string; phone: string; street: string; district: string; province: string } | null;
  items: OrderItem[];
}

export default function OrderTrackPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<TrackOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = phone.trim();
    if (!cleaned) return;
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const { data } = await axios.get(`/api/orders/track?phone=${encodeURIComponent(cleaned)}`);
      setOrders(data.data ?? []);
      setSearched(true);
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#f7fdf8] min-h-screen py-10">
      <div className="container max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#22c55e]/10 mx-auto">
            <Package className="h-7 w-7 text-[#22c55e]" />
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Tra cứu đơn hàng</h1>
          <p className="text-sm text-gray-500">Nhập số điện thoại đã đặt hàng để xem tất cả đơn hàng</p>
        </div>

        {/* Search box */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              inputMode="tel"
              className="pl-10 h-12 rounded-xl text-base"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !phone.trim()}
            className="h-12 px-6 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Tra cứu</span>
          </Button>
        </form>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {searched && orders !== null && (
          orders.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center space-y-2 shadow-sm">
              <Package className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-700">Không tìm thấy đơn hàng</p>
              <p className="text-sm text-gray-400">Số điện thoại <strong>{phone}</strong> chưa có đơn hàng nào.</p>
              <Button asChild variant="outline" className="mt-2 rounded-xl">
                <Link href={ROUTES.PRODUCTS}>Mua sắm ngay</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Tìm thấy <strong className="text-gray-800">{orders.length}</strong> đơn hàng cho SĐT <strong className="text-gray-800">{phone}</strong>
              </p>
              {orders.map((order) => (
                <div key={order.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  {/* Order header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900 flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#22c55e]" />
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <OrderStatusBadge status={order.status as never} />
                      <PaymentStatusBadge status={order.paymentStatus as never} />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-3 space-y-1.5 border-b border-gray-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate flex-1 pr-3">
                          {item.productName}
                          <span className="text-gray-400 ml-1">×{item.quantity}</span>
                        </span>
                        <span className="text-gray-800 font-medium shrink-0">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 flex items-center justify-between">
                    {order.address && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 truncate flex-1 pr-3">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {order.address.street}, {order.address.district}
                      </p>
                    )}
                    <p className="font-bold text-[#22c55e] shrink-0">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Back link */}
        <div className="text-center">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#22c55e] transition-colors"
          >
            Về trang chủ <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
