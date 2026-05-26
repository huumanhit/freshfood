import { ShoppingBag, TrendingUp, Package, Users, BadgeDollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    orders: { total: number; pending: number; today: number };
    revenue: { total: number; thisMonth: number; lastMonth: number };
    profit: { total: number; thisMonth: number };
    products: number;
    customers: { total: number; newThisMonth: number };
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const revenueGrowth =
    stats.revenue.lastMonth > 0
      ? ((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100
      : 0;

  const cards = [
    {
      label: "Tổng đơn hàng",
      value: stats.orders.total.toLocaleString("vi-VN"),
      sub: `${stats.orders.pending} chờ xác nhận · ${stats.orders.today} hôm nay`,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Doanh thu tháng này",
      value: formatCurrency(stats.revenue.thisMonth),
      sub:
        revenueGrowth !== 0
          ? `${revenueGrowth > 0 ? "+" : ""}${revenueGrowth.toFixed(1)}% so với tháng trước`
          : "Chưa có dữ liệu so sánh",
      icon: TrendingUp,
      color: "bg-green-50 text-[#22c55e]",
    },
    {
      label: "Lợi nhuận tháng này",
      value: formatCurrency(stats.profit.thisMonth),
      sub: `Tổng tích lũy: ${formatCurrency(stats.profit.total)}`,
      icon: BadgeDollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Sản phẩm đang bán",
      value: stats.products.toLocaleString("vi-VN"),
      sub: "Sản phẩm đang hoạt động",
      icon: Package,
      color: "bg-orange-50 text-orange-500",
    },
    {
      label: "Khách hàng",
      value: stats.customers.total.toLocaleString("vi-VN"),
      sub: `+${stats.customers.newThisMonth} mới tháng này`,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
