"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DeliveryCard } from "./DeliveryCard";
import { DeliveryActionModal, type DeliveryAction, type DeliveryActionPayload } from "./DeliveryActionModal";

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  total: number;
  note: string | null;
  deliverySlot: string | null;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  user: { name: string | null; phone: string | null } | null;
  address: {
    fullName: string;
    phone: string;
    street: string;
    ward: string;
    district: string;
    province: string;
  } | null;
  items: { productName: string; quantity: number; price: number }[];
}

interface BoardData {
  pending: DeliveryOrder[];
  shipping: DeliveryOrder[];
  delivered: DeliveryOrder[];
  failed: DeliveryOrder[];
}

type TabKey = "pending" | "shipping" | "delivered" | "failed";

const TABS: { key: TabKey; label: string; emptyText: string }[] = [
  { key: "pending", label: "Chờ giao", emptyText: "Không có đơn chờ giao" },
  { key: "shipping", label: "Đang giao", emptyText: "Không có đơn đang giao" },
  { key: "delivered", label: "Đã giao", emptyText: "Chưa có đơn nào được giao" },
  { key: "failed", label: "Thất bại", emptyText: "Không có đơn thất bại" },
];

export function DeliveryBoard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [modalState, setModalState] = useState<{
    open: boolean;
    order: DeliveryOrder | null;
    action: DeliveryAction | null;
  }>({ open: false, order: null, action: null });

  const { data, isLoading, isFetching, refetch } = useQuery<BoardData>({
    queryKey: ["delivery-board"],
    queryFn: () => axios.get("/api/delivery").then((r) => r.data),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: DeliveryActionPayload }) =>
      axios.patch(`/api/delivery/${orderId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-board"] });
      toast({ title: "Cập nhật trạng thái thành công", variant: "success" });
      setModalState({ open: false, order: null, action: null });
      // After marking as delivered/failed, switch to that tab
      if (modalState.action === "delivered") setActiveTab("delivered");
      if (modalState.action === "failed") setActiveTab("failed");
      if (modalState.action === "pickup") setActiveTab("shipping");
    },
    onError: (err: unknown) => {
      const msg =
        axios.isAxiosError(err) ? err.response?.data?.error ?? "Lỗi cập nhật" : "Lỗi cập nhật";
      toast({ title: msg, variant: "destructive" });
    },
  });

  const handleAction = useCallback((order: DeliveryOrder, action: DeliveryAction) => {
    setModalState({ open: true, order, action });
  }, []);

  const handleConfirm = useCallback(
    (payload: DeliveryActionPayload) => {
      if (!modalState.order) return;
      updateMutation.mutate({ orderId: modalState.order.id, payload });
    },
    [modalState.order, updateMutation]
  );

  const orders = data?.[activeTab] ?? [];
  const counts = {
    pending: data?.pending.length ?? 0,
    shipping: data?.shipping.length ?? 0,
    delivered: data?.delivered.length ?? 0,
    failed: data?.failed.length ?? 0,
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Đang cập nhật...
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-xl gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`
              relative flex flex-col items-center py-2.5 px-1 rounded-lg text-xs font-medium transition-all
              ${activeTab === key
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"}
            `}
          >
            <span className="leading-none">{label}</span>
            {counts[key] > 0 && (
              <span
                className={`
                  mt-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1
                  ${key === "pending" ? "bg-blue-100 text-blue-600" :
                    key === "shipping" ? "bg-purple-100 text-purple-600" :
                    key === "delivered" ? "bg-green-100 text-green-600" :
                    "bg-red-100 text-red-500"}
                `}
              >
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-gray-300 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-gray-500 text-sm">
            {TABS.find((t) => t.key === activeTab)?.emptyText}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => (
            <DeliveryCard key={order.id} order={order} onAction={handleAction} />
          ))}
        </div>
      )}

      {/* Action modal */}
      <DeliveryActionModal
        open={modalState.open}
        action={modalState.action}
        orderNumber={modalState.order?.orderNumber ?? ""}
        paymentMethod={modalState.order?.paymentMethod ?? ""}
        onClose={() => setModalState({ open: false, order: null, action: null })}
        onConfirm={handleConfirm}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
