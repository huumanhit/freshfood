"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { StatsCards } from "./StatsCards";
import { RecentOrdersTable } from "./RecentOrdersTable";
import { TopProductsTable } from "./TopProductsTable";

interface DashboardStats {
  orders: { total: number; pending: number; today: number };
  revenue: { total: number; thisMonth: number; lastMonth: number };
  products: number;
  customers: { total: number; newThisMonth: number };
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  user: { name: string | null; email: string } | null;
}

interface TopProduct {
  id: string;
  name: string;
  soldCount: number;
  price: number;
  images: { url: string }[];
}

const EMPTY_STATS: DashboardStats = {
  orders: { total: 0, pending: 0, today: 0 },
  revenue: { total: 0, thisMonth: 0, lastMonth: 0 },
  products: 0,
  customers: { total: 0, newThisMonth: 0 },
};

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("/api/admin/dashboard")
      .then(({ data }) => {
        if (data.success) {
          setStats(data.data.stats ?? EMPTY_STATS);
          setRecentOrders(data.data.recentOrders ?? []);
          setTopProducts(data.data.topProducts ?? []);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.error ?? "Không thể tải dữ liệu dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 w-40 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white p-5 h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tổng quan hoạt động cửa hàng</p>
      </div>

      {error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          {error} — Vui lòng gọi <code className="font-mono">/api/admin/db-sync</code> để đồng bộ cơ sở dữ liệu.
        </div>
      )}

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentOrdersTable orders={recentOrders} />
        </div>
        <div>
          <TopProductsTable products={topProducts} />
        </div>
      </div>
    </div>
  );
}
