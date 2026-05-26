"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Loader2, AlertTriangle, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const TIER_COLORS: Record<string, string> = {
  BRONZE: "bg-amber-100 text-amber-700",
  SILVER: "bg-gray-100 text-gray-600",
  GOLD: "bg-yellow-100 text-yellow-700",
  PLATINUM: "bg-purple-100 text-purple-700",
};

const TIER_LABELS: Record<string, string> = {
  BRONZE: "Đồng",
  SILVER: "Bạc",
  GOLD: "Vàng",
  PLATINUM: "Bạch kim",
};

interface CustomerScore {
  score: number;
  tier: string;
  totalSpent: number;
  lastOrderAt: string | null;
  riskFlags: string | null;
}

interface Customer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  segment: string;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
  customerScore: CustomerScore | null;
}

export function CustomersTable() {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ customers: Customer[]; total: number; pages: number }>({
    queryKey: ["admin-customers", search, segment, page],
    queryFn: () =>
      axios.get("/api/admin/customers", {
        params: { search, segment: segment || undefined, page },
      }).then((r) => r.data),
  });

  const customers = data?.customers ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Tìm tên, email, SĐT..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={segment} onValueChange={(v) => { setSegment(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-36 rounded-xl">
            <SelectValue placeholder="Phân khúc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(TIER_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-gray-300 animate-spin" /></div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-14 text-gray-400">
            Không tìm thấy khách hàng
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Khách hàng</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Phân khúc</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Đơn hàng</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Chi tiêu</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Điểm</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tham gia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => {
                    const hasRisk = customer.customerScore?.riskFlags && customer.customerScore.riskFlags !== "null";
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/admin/customers/${customer.id}`} className="hover:text-[#22c55e] transition-colors">
                            <p className="font-medium text-gray-800 flex items-center gap-1.5">
                              {customer.name ?? "Ẩn danh"}
                              {hasRisk && <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />}
                            </p>
                            <p className="text-xs text-gray-400">{customer.phone ?? customer.email}</p>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[customer.segment] ?? TIER_COLORS.BRONZE}`}>
                            {TIER_LABELS[customer.segment] ?? customer.segment}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-700">{customer._count.orders}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {customer.customerScore ? formatCurrency(customer.customerScore.totalSpent) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {customer.customerScore ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                              <Star className="h-3.5 w-3.5 text-yellow-400" />
                              {customer.customerScore.score}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(customer.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">{page} / {data.pages}</span>
          <Button variant="outline" size="sm" className="rounded-xl" disabled={page === data.pages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
