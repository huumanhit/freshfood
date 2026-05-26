"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ShoppingCart, Plus, Printer, Check, RefreshCw, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ShoppingListItem {
  id: string;
  productName: string;
  unit: string;
  quantity: number;
  isPurchased: boolean;
  supplier?: { name: string } | null;
  notes?: string | null;
}

interface ShoppingList {
  id: string;
  date: string;
  status: string;
  items: ShoppingListItem[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Nháp", color: "bg-gray-100 text-gray-600" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-600" },
  PURCHASED: { label: "Đã mua", color: "bg-green-100 text-green-600" },
};

export function ShoppingListManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const { data: listData, isLoading } = useQuery<{ list: ShoppingList | null }>({
    queryKey: ["shopping-list", selectedDate],
    queryFn: () => axios.get(`/api/admin/shopping-list?date=${selectedDate}`).then((r) => r.data),
  });

  const generateMutation = useMutation({
    mutationFn: () => axios.post("/api/admin/shopping-list", { date: selectedDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list", selectedDate] });
      toast({ title: "Đã tạo danh sách mua hàng", variant: "success" });
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Lỗi tạo danh sách";
      toast({ title: msg, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { itemId?: string; isPurchased?: boolean; status?: string }) =>
      axios.patch(`/api/admin/shopping-list/${selectedDate}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shopping-list", selectedDate] }),
    onError: () => toast({ title: "Lỗi cập nhật", variant: "destructive" }),
  });

  const list = listData?.list;
  const purchasedCount = list?.items.filter((i) => i.isPurchased).length ?? 0;
  const totalCount = list?.items.length ?? 0;

  const grouped = list?.items.reduce((acc, item) => {
    const supplier = item.supplier?.name ?? "Chưa có nhà cung cấp";
    if (!acc[supplier]) acc[supplier] = [];
    acc[supplier].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách mua hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tổng hợp sản phẩm cần mua theo ngày đặt hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 rounded-xl w-[160px]"
            />
          </div>
          {list && (
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> In
            </Button>
          )}
          <Button
            size="sm"
            className="rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white gap-1.5"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {list ? "Tạo lại" : "Tạo danh sách"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-gray-300 animate-spin" /></div>
      ) : !list ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 gap-3 text-center">
            <ShoppingCart className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500">Chưa có danh sách cho ngày {selectedDate}</p>
            <Button
              className="rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white mt-2"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Tạo danh sách từ đơn hàng
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Progress bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Tiến độ: {purchasedCount}/{totalCount} sản phẩm
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_LABELS[list.status]?.color}`}>
                    {STATUS_LABELS[list.status]?.label}
                  </span>
                  {list.status !== "PURCHASED" && purchasedCount === totalCount && (
                    <Button size="sm" className="rounded-xl h-7 text-xs bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => updateMutation.mutate({ status: "PURCHASED" })}>
                      <Check className="h-3 w-3 mr-1" /> Hoàn tất
                    </Button>
                  )}
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#22c55e] rounded-full transition-all"
                  style={{ width: totalCount > 0 ? `${(purchasedCount / totalCount) * 100}%` : "0%" }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items by supplier */}
          {Object.entries(grouped ?? {}).map(([supplier, items]) => (
            <Card key={supplier}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600 font-semibold">{supplier}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-3 ${item.isPurchased ? "opacity-60" : ""}`}
                    >
                      <button
                        onClick={() => updateMutation.mutate({ itemId: item.id, isPurchased: !item.isPurchased })}
                        className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          item.isPurchased ? "bg-[#22c55e] border-[#22c55e]" : "border-gray-300 hover:border-[#22c55e]"
                        }`}
                      >
                        {item.isPurchased && <Check className="h-3 w-3 text-white" />}
                      </button>
                      <span className={`flex-1 text-sm font-medium ${item.isPurchased ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {item.productName}
                      </span>
                      <span className="text-sm font-bold text-gray-700 shrink-0">
                        {Number(item.quantity).toLocaleString("vi-VN")} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
