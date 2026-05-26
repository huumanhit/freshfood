"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Search, Filter, ExternalLink } from "lucide-react";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

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
  user: { name: string | null; email: string } | null;
  address: { phone: string; fullName: string; province: string } | null;
  items: { id: string }[];
}

export function AdminOrdersTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({
    page: String(page),
    limit: "20",
    ...(search && { search }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, search, statusFilter],
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
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <TableHead>Thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : orders.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-400">
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
