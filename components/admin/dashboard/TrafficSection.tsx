"use client";

import { useState } from "react";
import { Eye, Users, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TrafficData {
  todayViews: number;
  todayVisitors: number;
  thisMonthViews: number;
  thisMonthVisitors: number;
  totalViews: number;
  totalVisitors: number;
  last7Days: {
    date: string;
    label: string;
    dayName: string;
    views: number;
    visitors: number;
  }[];
}

interface TrafficSectionProps {
  traffic?: TrafficData;
}

export function TrafficSection({ traffic }: TrafficSectionProps) {
  const [metric, setMetric] = useState<"views" | "visitors">("views");

  if (!traffic) return null;

  const data = traffic.last7Days ?? [];
  const maxVal = Math.max(...data.map((d) => (metric === "views" ? d.views : d.visitors)), 10);
  const total7Days = data.reduce((sum, d) => sum + (metric === "views" ? d.views : d.visitors), 0);

  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
      <CardHeader className="pb-3 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#16a34a]">
              <TrendingUp className="h-4 w-4" />
            </span>
            Lượng truy cập của người dùng
          </CardTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Theo dõi lưu lượng khách xem và ghé thăm website
          </p>
        </div>

        {/* Metric Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetric("views")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              metric === "views"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-[#16a34a]" />
            Lượt xem trang
          </button>
          <button
            type="button"
            onClick={() => setMetric("visitors")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              metric === "visitors"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Users className="h-3.5 w-3.5 text-blue-600" />
            Khách truy cập
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Quick summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100">
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
              <Eye className="h-3 w-3 text-[#16a34a]" /> Hôm nay
            </span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {(metric === "views" ? traffic.todayViews : traffic.todayVisitors).toLocaleString("vi-VN")}
            </p>
            <p className="text-[10px] text-gray-400">
              {metric === "views" ? `${traffic.todayVisitors} khách` : `${traffic.todayViews} lượt xem`}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100">
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-emerald-600" /> 7 ngày qua
            </span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {total7Days.toLocaleString("vi-VN")}
            </p>
            <p className="text-[10px] text-gray-400">
              {metric === "views" ? "Tổng lượt xem tuần" : "Tổng khách ghé thăm"}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100">
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-blue-600" /> Tháng này
            </span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {(metric === "views" ? traffic.thisMonthViews : traffic.thisMonthVisitors).toLocaleString("vi-VN")}
            </p>
            <p className="text-[10px] text-gray-400">
              {metric === "views" ? `${traffic.thisMonthVisitors} khách` : `${traffic.thisMonthViews} lượt xem`}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100">
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
              <Users className="h-3 w-3 text-purple-600" /> Tổng tích lũy
            </span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {(metric === "views" ? traffic.totalViews : traffic.totalVisitors).toLocaleString("vi-VN")}
            </p>
            <p className="text-[10px] text-gray-400">Từ khi mở hệ thống</p>
          </div>
        </div>

        {/* 7-Day Chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-600">
              Biểu đồ lưu lượng 7 ngày gần nhất ({metric === "views" ? "Lượt xem trang" : "Số khách truy cập"}):
            </p>
            <span className="text-[11px] text-gray-400">Cập nhật tự động</span>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 bg-gradient-to-b from-gray-50/50 to-white rounded-xl border border-gray-100/80">
            {data.map((item) => {
              const val = metric === "views" ? item.views : item.visitors;
              const heightPct = Math.max(8, Math.round((val / maxVal) * 100));

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip value on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-700 mb-1 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200 pointer-events-none whitespace-nowrap">
                    {val} {metric === "views" ? "lượt" : "khách"}
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[36px] bg-gray-100 rounded-t-lg relative flex items-end overflow-hidden h-28">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        metric === "views"
                          ? "bg-gradient-to-t from-[#16a34a] to-[#22c55e] group-hover:brightness-110"
                          : "bg-gradient-to-t from-blue-600 to-sky-400 group-hover:brightness-110"
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <div className="mt-2 text-center">
                    <p className="text-[11px] font-semibold text-gray-700">{item.dayName}</p>
                    <p className="text-[9px] text-gray-400">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
