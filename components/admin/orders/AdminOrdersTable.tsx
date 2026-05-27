"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Search, Filter, ExternalLink, TriangleAlert, Calendar, Clock, Download } from "lucide-react";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { DELIVERY_SLOTS } from "@/lib/validations/order";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  COD: "COD",
  BANK_TRANSFER: "Chuyển khoản",
  VNPAY: "VNPay",
  STRIPE: "Stripe",
  MOMO: "MoMo",
};

interface OrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: PaymentMethod;
  total: number | string;
  createdAt: string;
  deliveryDate: string | null;
  deliverySlot: string | null;
  isNewAddress: boolean;
  user: { name: string | null; email: string } | null;
  address: { phone: string; fullName: string; province: string } | null;
  items: { id: string }[];
}

export function AdminOrdersTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [slotFilter, setSlotFilter] = useState("all");
  const [newAddressOnly, setNewAddressOnly] = useState(false);
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({
    page: String(page),
    limit: "20",
    ...(search && { search }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(dateFilter && { date: dateFilter }),
    ...(slotFilter !== "all" && { slot: slotFilter }),
    ...(newAddressOnly && { newAddress: "true" }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, search, statusFilter, dateFilter, slotFilter, newAddressOnly],
    queryFn: async () => {
      const { data } = await axios.get(`/api/admin/orders?${params}`);
      return data;
    },
    staleTime: 20_000,
  });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const orders: OrderRow[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm mã đơn, tên, email, SĐT..."
              value={search}
              onChange={handleSearchChange}
              className="pl-9 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-40 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => { setNewAddressOnly((v) => !v); setPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                newAddressOnly
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-white border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              <TriangleAlert className="h-3.5 w-3.5" />
              Địa chỉ mới
            </button>
          </div>
        </div>
        {/* Date + slot filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 h-9">
            <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="text-sm text-gray-700 bg-transparent outline-none w-36"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => { setDateFilter(""); setPage(1); }}
                className="text-gray-400 hover:text-gray-600 ml-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <Select value={slotFilter} onValueChange={(v) => { setSlotFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40 rounded-xl">
              <Clock className="h-3.5 w-3.5 text-gray-400 mr-1.5 shrink-0" />
              <SelectValue placeholder="Khung giờ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giờ</SelectItem>
              {DELIVERY_SLOTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(dateFilter || slotFilter !== "all") && (
            <button
              type="button"
              onClick={() => { setDateFilter(""); setSlotFilter("all"); setPage(1); }}
              className="text-xs text-gray-400 hover:text-gray-700 underline"
            >
              Xóa bộ lọc
            </button>
          )}
          <div className="ml-auto">
            <a
              href={`/api/admin/orders/export?${new URLSearchParams({
                ...(statusFilter !== "all" && { status: statusFilter }),
                ...(dateFilter && { date: dateFilter }),
                ...(slotFilter !== "all" && { slot: slotFilter }),
              })}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Xuất CSV
            </a>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead className="text-center">Số SP</TableHead>
              <TableHead>Giao hàng</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead>Đặt lúc</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : orders.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-gray-400">
                    Không tìm thấy đơn hàng nào
                  </TableCell>
                </TableRow>
              )
              : orders.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell>
                      <Link
                        href={ROUTES.ADMIN_ORDER_DETAIL(order.id)}
                        className="font-mono text-xs font-semibold text-[#22c55e] hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                      {order.isNewAddress && (
                        <div className="flex items-center gap-1 mt-1 text-amber-600">
                          <TriangleAlert className="h-3 w-3 shrink-0" />
                          <span className="text-[10px] font-medium">Địa chỉ mới</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{order.user?.name ?? order.address?.fullName ?? "—"}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[160px]">{order.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {order.address?.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      {order.items.length}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {order.deliveryDate ? (
                        <div className="space-y-0.5">
                          <p className="font-medium text-gray-700">
                            {order.deliveryDate.split("-").reverse().slice(0, 2).join("/")}
                          </p>
                          {order.deliverySlot && (
                            <p className="text-gray-400">{order.deliverySlot}</p>
                          )}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      <div className="space-y-0.5">
                        <p>{PAYMENT_LABELS[order.paymentMethod]}</p>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-800 text-sm">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                    <TableCell className="text-xs text-gray-400">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={ROUTES.ADMIN_ORDER_DETAIL(order.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>Hiển thị {orders.length} / {pagination.total} đơn hàng</p>
          <div className="flex gap-1 items-center">
            <Button variant="outline" size="sm" className="rounded-lg h-8" disabled={!pagination.hasPrev} onClick={() => setPage(page - 1)}>Trước</Button>
            <span className="px-3 text-sm font-medium">{page}/{pagination.totalPages}</span>
            <Button variant="outline" size="sm" className="rounded-lg h-8" disabled={!pagination.hasNext} onClick={() => setPage(page + 1)}>Sau</Button>
          </div>
        </div>
      )}
    </div>
  );
}
