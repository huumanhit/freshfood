"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Gift, ChevronLeft, ChevronRight, Loader2, CheckCircle2, XCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ xét", color: "bg-yellow-100 text-yellow-600" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-600" },
  APPLIED: { label: "Đã áp dụng", color: "bg-green-100 text-green-600" },
  EXPIRED: { label: "Hết hạn", color: "bg-gray-100 text-gray-500" },
  CANCELLED: { label: "Đã huỷ", color: "bg-red-100 text-red-500" },
};

interface Referral {
  id: string;
  refereePhone: string;
  rewardAmount: number;
  status: string;
  createdAt: string;
  appliedAt: string | null;
  referrer: { id: string; name: string | null; phone: string | null; email: string };
  referee: { id: string; name: string | null; phone: string | null } | null;
  order: { id: string; orderNumber: string; total: number } | null;
}

export function ReferralsTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ rewards: Referral[]; total: number; pages: number }>({
    queryKey: ["admin-referrals", status, page],
    queryFn: () =>
      axios.get("/api/admin/referrals", { params: { status: status || undefined, page } }).then((r) => r.data),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      axios.patch(`/api/admin/referrals/${id}`, { action }),
    onSuccess: (res, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-referrals"] });
      if (action === "apply" && res.data.couponCode) {
        toast({
          title: `Đã tạo mã giảm giá: ${res.data.couponCode}`,
          variant: "success",
        });
      } else {
        toast({ title: "Cập nhật thành công", variant: "success" });
      }
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Lỗi thao tác";
      toast({ title: msg, variant: "destructive" });
    },
  });

  const rewards = data?.rewards ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={status} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-44 rounded-xl">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">Tổng: {data?.total ?? 0} phần thưởng</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-gray-300 animate-spin" /></div>
      ) : rewards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 gap-3 text-center">
            <Gift className="h-10 w-10 text-gray-300" />
            <p className="text-gray-400">Không có phần thưởng giới thiệu</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Người giới thiệu</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Được giới thiệu</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Đơn hàng</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Thưởng</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Trạng thái</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rewards.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{r.referrer.name ?? "Ẩn danh"}</p>
                        <p className="text-xs text-gray-400">{r.referrer.phone ?? r.referrer.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{r.referee?.name ?? "Khách mới"}</p>
                        <p className="text-xs text-gray-400">{r.refereePhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        {r.order ? (
                          <span className="text-xs font-medium text-gray-700">#{r.order.orderNumber}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#22c55e]">
                        {formatCurrency(r.rewardAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[r.status]?.color ?? "bg-gray-100 text-gray-500"}`}>
                          {STATUS_CONFIG[r.status]?.label ?? r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {r.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="outline" className="h-7 rounded-lg text-xs gap-1 text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => actionMutation.mutate({ id: r.id, action: "confirm" })}
                                disabled={actionMutation.isPending}>
                                <CheckCircle2 className="h-3 w-3" /> Xác nhận
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 rounded-lg text-xs gap-1 text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => actionMutation.mutate({ id: r.id, action: "cancel" })}
                                disabled={actionMutation.isPending}>
                                <XCircle className="h-3 w-3" /> Huỷ
                              </Button>
                            </>
                          )}
                          {r.status === "CONFIRMED" && (
                            <Button size="sm" className="h-7 rounded-lg text-xs gap-1 bg-[#16a34a] hover:bg-[#16a34a] text-white"
                              onClick={() => actionMutation.mutate({ id: r.id, action: "apply" })}
                              disabled={actionMutation.isPending}>
                              <Tag className="h-3 w-3" /> Phát thưởng
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">{page} / {data.pages}</span>
          <Button variant="outline" size="sm" className="rounded-xl" disabled={page === data.pages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
