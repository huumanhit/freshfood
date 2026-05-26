"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package, Plus, ChevronRight, Loader2, Layers, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";

const BATCH_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Đang dùng", color: "bg-green-100 text-green-600" },
  DEPLETED: { label: "Đã dùng hết", color: "bg-gray-100 text-gray-500" },
  EXPIRED_BATCH: { label: "Hết hạn", color: "bg-orange-100 text-orange-600" },
  RECALLED: { label: "Thu hồi", color: "bg-red-100 text-red-600" },
};

const TRACE_EVENTS = [
  { value: "INSPECTED", label: "Kiểm định" },
  { value: "STORED", label: "Nhập kho" },
  { value: "PICKED", label: "Lấy hàng" },
  { value: "PACKED", label: "Đóng gói" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "RETURNED", label: "Trả hàng" },
  { value: "RECALLED", label: "Thu hồi" },
];

const createBatchSchema = z.object({
  batchCode: z.string().min(1, "Bắt buộc"),
  productId: z.string().min(1, "Chọn sản phẩm"),
  supplierId: z.string().optional(),
  quantity: z.coerce.number().positive("Phải > 0"),
  unit: z.string().min(1, "Bắt buộc"),
  purchaseDate: z.string().min(1, "Bắt buộc"),
  expiryDate: z.string().optional(),
});

type CreateBatchForm = z.infer<typeof createBatchSchema>;

interface Batch {
  id: string;
  batchCode: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string | null;
  status: string;
  product: { name: string; unit: string };
  supplier: { name: string } | null;
  _count: { traceabilityLogs: number };
}

interface TraceLog {
  id: string;
  event: string;
  notes: string | null;
  performedBy: string | null;
  createdAt: string;
}

interface BatchDetail extends Batch {
  traceabilityLogs: TraceLog[];
}

const EVENT_LABELS: Record<string, string> = {
  RECEIVED: "Nhập hàng", INSPECTED: "Kiểm định", STORED: "Nhập kho",
  PICKED: "Lấy hàng", PACKED: "Đóng gói", DELIVERED: "Đã giao",
  RETURNED: "Trả hàng", RECALLED: "Thu hồi",
};

export function TraceabilityManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [logEvent, setLogEvent] = useState("");

  const { data: batchesData, isLoading } = useQuery<{ batches: Batch[] }>({
    queryKey: ["traceability-batches"],
    queryFn: () => axios.get("/api/admin/traceability/batches").then((r) => r.data),
  });

  const { data: batchDetail } = useQuery<{ batch: BatchDetail }>({
    queryKey: ["batch-detail", selectedBatch],
    queryFn: () => axios.get(`/api/admin/traceability/batches/${selectedBatch}`).then((r) => r.data),
    enabled: !!selectedBatch,
  });

  const { data: productsData } = useQuery<{ products: { id: string; name: string }[] }>({
    queryKey: ["products-simple"],
    queryFn: () =>
      axios.get("/api/admin/products?limit=200").then((r) =>
        ({ products: r.data.products?.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })) ?? [] })
      ),
  });

  const { data: suppliersData } = useQuery<{ suppliers: { id: string; name: string }[] }>({
    queryKey: ["suppliers"],
    queryFn: () => axios.get("/api/admin/suppliers").then((r) => r.data),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateBatchForm>({
    resolver: zodResolver(createBatchSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBatchForm) => axios.post("/api/admin/traceability/batches", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["traceability-batches"] });
      toast({ title: "Đã tạo lô hàng", variant: "success" });
      setShowCreate(false);
      reset();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Lỗi tạo lô hàng";
      toast({ title: msg, variant: "destructive" });
    },
  });

  const logMutation = useMutation({
    mutationFn: ({ batchId, event }: { batchId: string; event: string }) =>
      axios.patch(`/api/admin/traceability/batches/${batchId}`, { event }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch-detail", selectedBatch] });
      setLogEvent("");
      toast({ title: "Đã ghi nhật ký", variant: "success" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ batchId, status }: { batchId: string; status: string }) =>
      axios.patch(`/api/admin/traceability/batches/${batchId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["traceability-batches"] });
      queryClient.invalidateQueries({ queryKey: ["batch-detail", selectedBatch] });
      toast({ title: "Đã cập nhật trạng thái", variant: "success" });
    },
  });

  const batches = batchesData?.batches ?? [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* List */}
      <div className="xl:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#22c55e]" /> Lô hàng ({batches.length})
          </h2>
          <Button size="sm" className="rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white gap-1"
            onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" /> Thêm lô
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-gray-300 animate-spin" /></div>
        ) : batches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-10 gap-2 text-center">
              <Package className="h-8 w-8 text-gray-300" />
              <p className="text-gray-400 text-sm">Chưa có lô hàng nào</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => (
              <button
                key={batch.id}
                onClick={() => setSelectedBatch(batch.id)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  selectedBatch === batch.id
                    ? "border-[#22c55e] bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-800">{batch.batchCode}</p>
                    <p className="text-xs text-gray-500 truncate">{batch.product.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${BATCH_STATUS_CONFIG[batch.status]?.color}`}>
                      {BATCH_STATUS_CONFIG[batch.status]?.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {Number(batch.quantity).toLocaleString()} {batch.unit} · {batch.purchaseDate}
                  {batch._count.traceabilityLogs > 0 && ` · ${batch._count.traceabilityLogs} sự kiện`}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail */}
      <div className="xl:col-span-3">
        {!selectedBatch ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 gap-3 text-center">
              <History className="h-10 w-10 text-gray-300" />
              <p className="text-gray-400">Chọn lô hàng để xem nhật ký truy xuất</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {batchDetail?.batch.batchCode ?? "..."}
                </CardTitle>
                {batchDetail && (
                  <Select value={batchDetail.batch.status}
                    onValueChange={(v) => statusMutation.mutate({ batchId: selectedBatch, status: v })}>
                    <SelectTrigger className="w-36 rounded-xl h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BATCH_STATUS_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Log new event */}
              <div className="flex gap-2">
                <Select value={logEvent} onValueChange={setLogEvent}>
                  <SelectTrigger className="rounded-xl flex-1 text-sm">
                    <SelectValue placeholder="Ghi sự kiện..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TRACE_EVENTS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white"
                  onClick={() => logMutation.mutate({ batchId: selectedBatch, event: logEvent })}
                  disabled={!logEvent || logMutation.isPending}
                >
                  {logMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>

              {/* Timeline */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {batchDetail?.batch.traceabilityLogs.map((log, i) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#22c55e] mt-1 shrink-0" />
                      {i < (batchDetail.batch.traceabilityLogs.length - 1) && (
                        <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="pb-3 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{EVENT_LABELS[log.event] ?? log.event}</p>
                      {log.notes && <p className="text-xs text-gray-500">{log.notes}</p>}
                      <p className="text-xs text-gray-400">{formatDateTime(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create batch dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Tạo lô hàng mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Mã lô *</Label>
                <Input {...register("batchCode")} placeholder="LOT-2024-001" className="rounded-xl" />
                {errors.batchCode && <p className="text-xs text-red-500">{errors.batchCode.message}</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Đơn vị *</Label>
                <Input {...register("unit")} placeholder="kg" className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Sản phẩm *</Label>
              <Select onValueChange={(v) => setValue("productId", v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Chọn sản phẩm..." />
                </SelectTrigger>
                <SelectContent>
                  {productsData?.products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && <p className="text-xs text-red-500">{errors.productId.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Nhà cung cấp</Label>
              <Select onValueChange={(v) => setValue("supplierId", v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Chọn nhà cung cấp..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliersData?.suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Số lượng *</Label>
                <Input type="number" step="0.001" {...register("quantity")} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ngày nhập *</Label>
                <Input type="date" {...register("purchaseDate")} className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Hạn sử dụng</Label>
              <Input type="date" {...register("expiryDate")} className="rounded-xl" />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowCreate(false)}>Huỷ</Button>
              <Button type="submit" className="flex-1 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white"
                disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Tạo lô hàng
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
