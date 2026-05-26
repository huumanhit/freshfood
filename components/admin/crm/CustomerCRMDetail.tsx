"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Star, AlertTriangle, MessageSquare, Plus, Trash2, Flag, ShoppingBag, Loader2, Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const TIER_CONFIG = {
  BRONZE: { label: "Đồng", color: "bg-amber-700", ring: "ring-amber-300" },
  SILVER: { label: "Bạc", color: "bg-gray-400", ring: "ring-gray-300" },
  GOLD: { label: "Vàng", color: "bg-yellow-400", ring: "ring-yellow-300" },
  PLATINUM: { label: "Bạch kim", color: "bg-purple-500", ring: "ring-purple-300" },
};

const RISK_FLAG_LABELS: Record<string, string> = {
  REPEATED_NO_SHOW: "Không nhận hàng nhiều lần",
  HIGH_CANCEL_RATE: "Huỷ đơn nhiều",
  CANCEL_EXCEEDS_ORDERS: "Huỷ > Hoàn thành",
};

const NOTE_CATEGORIES = [
  { value: "GENERAL", label: "Chung" },
  { value: "COMPLAINT", label: "Khiếu nại" },
  { value: "PREFERENCE", label: "Sở thích" },
  { value: "RISK", label: "Rủi ro" },
  { value: "SPECIAL", label: "Đặc biệt" },
];

const NOTE_CATEGORY_COLORS: Record<string, string> = {
  GENERAL: "bg-gray-100 text-gray-600",
  COMPLAINT: "bg-red-100 text-red-600",
  PREFERENCE: "bg-blue-100 text-blue-600",
  RISK: "bg-orange-100 text-orange-600",
  SPECIAL: "bg-purple-100 text-purple-600",
};

interface CustomerScore {
  score: number;
  tier: keyof typeof TIER_CONFIG;
  orderCount: number;
  totalSpent: number;
  noShowCount: number;
  cancelCount: number;
  riskFlags: string[] | null;
  lastOrderAt: string | null;
}

interface Note {
  id: string;
  content: string;
  category: string;
  isImportant: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

interface CustomerDetail {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  segment: string;
  isActive: boolean;
  createdAt: string;
  customerScore: CustomerScore | null;
  customerNotes: Note[];
  orders: Order[];
}

interface CustomerCRMDetailProps {
  customerId: string;
}

export function CustomerCRMDetail({ customerId }: CustomerCRMDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("GENERAL");
  const [showNoteForm, setShowNoteForm] = useState(false);

  const { data, isLoading } = useQuery<{ customer: CustomerDetail }>({
    queryKey: ["customer-crm", customerId],
    queryFn: () => axios.get(`/api/admin/customers/${customerId}`).then((r) => r.data),
  });

  const { data: scoreData } = useQuery<{ score: CustomerScore }>({
    queryKey: ["customer-score", customerId],
    queryFn: () => axios.get(`/api/admin/customers/${customerId}/score`).then((r) => r.data),
  });

  const addNoteMutation = useMutation({
    mutationFn: () =>
      axios.post(`/api/admin/customers/${customerId}/notes`, { content: noteContent, category: noteCategory }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-crm", customerId] });
      setNoteContent("");
      setShowNoteForm(false);
      toast({ title: "Đã thêm ghi chú", variant: "success" });
    },
    onError: () => toast({ title: "Lỗi thêm ghi chú", variant: "destructive" }),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) =>
      axios.delete(`/api/admin/customers/${customerId}/notes/${noteId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer-crm", customerId] }),
    onError: () => toast({ title: "Lỗi xoá ghi chú", variant: "destructive" }),
  });

  const pinNoteMutation = useMutation({
    mutationFn: ({ noteId, isImportant }: { noteId: string; isImportant: boolean }) =>
      axios.patch(`/api/admin/customers/${customerId}/notes/${noteId}`, { isImportant }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer-crm", customerId] }),
  });

  const segmentMutation = useMutation({
    mutationFn: (segment: string) =>
      axios.patch(`/api/admin/customers/${customerId}/score`, { segment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-crm", customerId] });
      toast({ title: "Đã cập nhật phân khúc", variant: "success" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-gray-300 animate-spin" /></div>;

  const customer = data?.customer;
  const score = scoreData?.score ?? customer?.customerScore;
  if (!customer) return <p className="text-gray-400 text-center py-10">Không tìm thấy khách hàng</p>;

  const tier = TIER_CONFIG[score?.tier ?? "BRONZE"];
  const riskFlags = score?.riskFlags ? (Array.isArray(score.riskFlags) ? score.riskFlags : JSON.parse(score.riskFlags as string)) : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: score + notes */}
      <div className="xl:col-span-2 space-y-5">
        {/* Score card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Điểm khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className={`h-16 w-16 rounded-full ${tier.color} ring-4 ${tier.ring} flex items-center justify-center shrink-0`}>
                <span className="text-white font-bold text-xl">{score?.score ?? 50}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full text-white ${tier.color}`}>
                    {tier.label}
                  </span>
                  <span className="text-xs text-gray-400">/ 100 điểm</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full max-w-xs">
                  <div
                    className={`h-full rounded-full ${tier.color} transition-all`}
                    style={{ width: `${score?.score ?? 50}%` }}
                  />
                </div>
              </div>
              <Select value={customer.segment} onValueChange={(v) => segmentMutation.mutate(v)}>
                <SelectTrigger className="w-36 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIER_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: "Đơn thành công", value: score?.orderCount ?? 0 },
                { label: "Tổng chi tiêu", value: formatCurrency(score?.totalSpent ?? 0) },
                { label: "Đơn huỷ", value: score?.cancelCount ?? 0 },
                { label: "Thất bại/không nhận", value: score?.noShowCount ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="font-bold text-gray-800">{value}</p>
                </div>
              ))}
            </div>

            {riskFlags.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 space-y-1">
                <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Cảnh báo rủi ro
                </p>
                {riskFlags.map((flag: string) => (
                  <p key={flag} className="text-xs text-red-500 flex items-center gap-1.5">
                    <Flag className="h-3 w-3" />
                    {RISK_FLAG_LABELS[flag] ?? flag}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#22c55e]" />
                Ghi chú CRM ({customer.customerNotes.length})
              </CardTitle>
              <Button size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => setShowNoteForm(!showNoteForm)}>
                <Plus className="h-3.5 w-3.5" /> Thêm ghi chú
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showNoteForm && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                <div className="flex gap-2">
                  <Select value={noteCategory} onValueChange={setNoteCategory}>
                    <SelectTrigger className="w-40 rounded-xl h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  rows={3}
                  className="rounded-xl resize-none text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setShowNoteForm(false)}>Huỷ</Button>
                  <Button
                    size="sm"
                    className="rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white"
                    onClick={() => addNoteMutation.mutate()}
                    disabled={!noteContent.trim() || addNoteMutation.isPending}
                  >
                    {addNoteMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                    Lưu
                  </Button>
                </div>
              </div>
            )}

            {customer.customerNotes.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">Chưa có ghi chú</p>
            ) : (
              customer.customerNotes.map((note) => (
                <div key={note.id} className={`rounded-xl border p-3 space-y-1.5 ${note.isImportant ? "border-orange-200 bg-orange-50/50" : "border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${NOTE_CATEGORY_COLORS[note.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {NOTE_CATEGORIES.find((c) => c.value === note.category)?.label}
                      </span>
                      {note.isImportant && <span className="text-xs text-orange-500 font-medium flex items-center gap-0.5"><Pin className="h-3 w-3" />Quan trọng</span>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => pinNoteMutation.mutate({ noteId: note.id, isImportant: !note.isImportant })}
                        className="p-1 hover:text-orange-500 text-gray-300 transition-colors">
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteNoteMutation.mutate(note.id)}
                        className="p-1 hover:text-red-500 text-gray-300 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(note.createdAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: recent orders */}
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShoppingBag className="h-4 w-4 text-[#22c55e]" />
              Đơn hàng gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {customer.orders.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-6">Chưa có đơn hàng</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {customer.orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-700">{formatCurrency(order.total)}</p>
                      <p className="text-[10px] text-gray-400">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3 text-sm">
            <p className="font-semibold text-gray-800">{customer.name ?? "Khách hàng"}</p>
            {customer.email && <p className="text-gray-500 text-xs">{customer.email}</p>}
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="text-[#22c55e] font-medium hover:underline text-xs">{customer.phone}</a>
            )}
            <Separator />
            <p className="text-xs text-gray-400">Tham gia: {formatDateTime(customer.createdAt)}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Trạng thái</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${customer.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                {customer.isActive ? "Hoạt động" : "Đã khoá"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
