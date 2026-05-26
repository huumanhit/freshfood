"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { MapPin, RefreshCw, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

interface DriverLocation {
  userId: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  orderId: string | null;
  recordedAt: string;
  user: { name: string | null; email: string; phone: string | null };
  order: { orderNumber: string } | null;
}

export function DriverLocationsPanel() {
  const { data, isLoading, refetch, dataUpdatedAt } = useQuery<{ drivers: DriverLocation[] }>({
    queryKey: ["driver-locations"],
    queryFn: () => axios.get("/api/admin/delivery/drivers").then((r) => r.data),
    refetchInterval: 30_000,
  });

  const drivers = data?.drivers ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Navigation className="h-4 w-4 text-[#22c55e]" />
            Vị trí tài xế ({drivers.length})
          </CardTitle>
          <div className="flex items-center gap-3">
            {dataUpdatedAt > 0 && (
              <span className="text-xs text-gray-400">
                Cập nhật: {new Date(dataUpdatedAt).toLocaleTimeString("vi-VN")}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl gap-1.5"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 text-gray-300 animate-spin" />
          </div>
        ) : drivers.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 text-center">
            <MapPin className="h-10 w-10 text-gray-200" />
            <p className="text-gray-400 text-sm">Không có tài xế nào đang hoạt động</p>
            <p className="text-xs text-gray-300">Vị trí được cập nhật trong vòng 4 giờ gần nhất</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drivers.map((driver) => (
              <div
                key={driver.userId}
                className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-[#22c55e]/10 flex items-center justify-center shrink-0">
                  <Navigation className="h-4 w-4 text-[#22c55e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-800">
                      {driver.user.name ?? driver.user.email}
                    </p>
                    {driver.order && (
                      <span className="text-xs font-medium text-[#22c55e] bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                        #{driver.order.orderNumber}
                      </span>
                    )}
                  </div>
                  {driver.user.phone && (
                    <a
                      href={`tel:${driver.user.phone}`}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {driver.user.phone}
                    </a>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {driver.lat.toFixed(5)}, {driver.lng.toFixed(5)}
                      {driver.accuracy && ` (±${Math.round(driver.accuracy)}m)`}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${driver.lat},${driver.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Xem bản đồ
                    </a>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(driver.recordedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-300 text-center mt-4">Tự động làm mới mỗi 30 giây</p>
      </CardContent>
    </Card>
  );
}
