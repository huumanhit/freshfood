"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GitMerge, Users, Package, RefreshCw, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface MergeOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  items: { productName: string; quantity: number }[];
  customerName: string;
}

interface MergeCandidate {
  key: string;
  phone: string;
  date: string;
  slot: string | null;
  orderCount: number;
  totalItems: number;
  combinedTotal: number;
  orders: MergeOrder[];
}

export function MergeOrdersBoard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery<{ candidates: MergeCandidate[] }>({
    queryKey: ["merge-candidates"],
    queryFn: () => axios.get("/api/admin/merge-orders").then((r) => r.data),
    refetchInterval: 60_000,
  });

  const createGroupMutation = useMutation({
    mutationFn: (candidate: MergeCandidate) =>
      axios.post("/api/admin/merge-orders", {
        orderIds: candidate.orders.map((o) => o.id),
        phone: candidate.phone,
        date: candidate.date,
        slot: candidate.slot,
      }),
    onSuccess: (res, candidate) => {
      setConfirming(res.data.group.id);
      queryClient.invalidateQueries({ queryKey: ["merge-candidates"] });
    },
    onError: () => toast({ title: "Lỗi tạo nhóm gộp", variant: "destructive" }),
  });

  const actionMutation = useMutation({
    mutationFn: ({ groupId, action }: { groupId: string; action: "confirm" | "reject" }) =>
      axios.patch(`/api/admin/merge-orders/${groupId}`, { action }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["merge-candidates"] });
      setConfirming(null);
      toast({
        title: vars.action === "confirm" ? "Đã gộp đơn hàng thành công" : "Đã từ chối gộp",
        variant: vars.action === "confirm" ? "success" : "default",
      });
    },
    onError: () => toast({ title: "Lỗi thực hiện thao tác", variant: "destructive" }),
  });

  const candidates = data?.candidates ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gộp đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tự động phát hiện đơn hàng trùng SĐT + khung giờ — gộp để tiết kiệm phí vận chuyển
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="rounded-xl gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-gray-300 animate-spin" /></div>
      ) : candidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
            <p className="text-gray-600 font-medium">Không có đơn hàng nào cần gộp</p>
            <p className="text-gray-400 text-sm">Tất cả đơn hàng đã được xử lý riêng lẻ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {candidates.map((candidate) => (
            <Card key={candidate.key} className="border-orange-200 bg-orange-50/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <GitMerge className="h-5 w-5 text-orange-500 shrink-0" />
                    <div>
                      <CardTitle className="text-base text-gray-800">
                        {candidate.orderCount} đơn hàng có thể gộp
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <Users className="h-3 w-3" /> {candidate.phone}
                        {candidate.slot && <> · <span className="text-blue-600">{candidate.slot.replace("-", " – ")}</span></>}
                        · {candidate.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">{formatCurrency(candidate.combinedTotal)}</p>
                    <p className="text-xs text-green-600 font-medium">Tiết kiệm 15.000đ phí ship</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Order list */}
                <div className="grid gap-2">
                  {candidate.orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-gray-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <Package className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-gray-800">#{order.orderNumber}</span>
                          <p className="text-xs text-gray-400 truncate">
                            {order.items.slice(0, 2).map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                            {order.items.length > 2 && ` +${order.items.length - 2}`}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-gray-700">{formatCurrency(order.total)}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {confirming === null || !candidate.orders.some(() => true) ? (
                  <Button
                    className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => createGroupMutation.mutate(candidate)}
                    disabled={createGroupMutation.isPending}
                  >
                    {createGroupMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <GitMerge className="h-4 w-4 mr-2" />
                    Gộp {candidate.orderCount} đơn hàng này
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GitMerge className="h-5 w-5 text-orange-500" />
                Xác nhận gộp đơn?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Các đơn phụ sẽ bị huỷ và item được chuyển vào đơn chính.
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => actionMutation.mutate({ groupId: confirming, action: "reject" })}
                  disabled={actionMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Huỷ
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => actionMutation.mutate({ groupId: confirming, action: "confirm" })}
                  disabled={actionMutation.isPending}
                >
                  {actionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Xác nhận gộp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
