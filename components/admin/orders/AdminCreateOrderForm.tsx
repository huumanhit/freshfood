"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search, Plus, Trash2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DELIVERY_SLOTS } from "@/lib/validations/order";
import { SHIPPING } from "@/constants/config";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/constants/routes";

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export function AdminCreateOrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill customer info from phone
  function handlePhoneChange(val: string) {
    setPhone(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const digits = val.replace(/\D/g, "");
    if (digits.length < 9) return;
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/checkout/prefill?phone=${digits}`);
        if (res.data.found) {
          const a = res.data.address;
          setFullName(a.fullName);
          setProvince(a.province);
          setDistrict(a.district);
          setWard(a.ward);
          setStreet(a.street);
        }
      } catch { /* ignore */ }
    }, 500);
  }

  // Product search
  const { data: productData } = useQuery({
    queryKey: ["admin-product-search", productSearch],
    queryFn: async () => {
      if (!productSearch.trim()) return [];
      const { data } = await axios.get(`/api/products?search=${encodeURIComponent(productSearch)}&limit=8&status=ACTIVE`);
      return data.data ?? [];
    },
    enabled: productSearch.length > 0,
    staleTime: 10_000,
  });

  function addItem(product: { id: string; name: string; price: number; salePrice: number | null }) {
    const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, productName: product.name, price, quantity: 1 }];
    });
    setProductSearch("");
  }

  function updateQty(productId: string, qty: number) {
    if (qty < 1) return removeItem(productId);
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: qty } : i));
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = subtotal >= SHIPPING.FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING.DEFAULT_FEE;
  const total = subtotal + shippingFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !fullName || !street || items.length === 0) {
      toast({ title: "Vui lòng điền đủ thông tin và thêm ít nhất 1 sản phẩm", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post("/api/admin/orders", {
        phone, fullName, province, district, ward, street,
        deliverySlot: deliverySlot || undefined,
        deliveryDate: deliveryDate || undefined,
        paymentMethod, paymentStatus, note, items,
      });
      toast({ title: `Tạo đơn thành công — #${data.data.orderNumber}`, variant: "success" });
      router.push(ROUTES.ADMIN_ORDER_DETAIL(data.data.orderId));
    } catch {
      toast({ title: "Lỗi tạo đơn", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Customer */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Thông tin khách hàng</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Số điện thoại *</label>
              <Input value={phone} onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="0912345678" inputMode="tel" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Họ tên *</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A" className="rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Tỉnh/TP</label>
              <Input value={province} onChange={(e) => setProvince(e.target.value)}
                placeholder="TP.HCM" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Quận/Huyện</label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)}
                placeholder="Quận 12" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Phường/Xã</label>
              <Input value={ward} onChange={(e) => setWard(e.target.value)}
                placeholder="P. Thạnh Lộc" className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Số nhà, tên đường *</label>
            <Input value={street} onChange={(e) => setStreet(e.target.value)}
              placeholder="123 Nguyễn Văn Quá" className="rounded-xl" />
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Sản phẩm *</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Tìm tên sản phẩm..." className="pl-9 rounded-xl" />
            {productSearch && productData && productData.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                {productData.map((p: { id: string; name: string; price: number; salePrice: number | null; unit: string }) => (
                  <button key={p.id} type="button"
                    onClick={() => addItem(p)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <span className="text-[#22c55e] font-semibold shrink-0 ml-3">
                      {formatCurrency(p.salePrice && p.salePrice < p.price ? p.salePrice : p.price)}/{p.unit}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items list */}
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Chưa có sản phẩm — tìm và chọn bên trên</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(item.price)}/đơn vị</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="h-7 w-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center text-sm font-bold">−</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item.productId, item.quantity + 1)}
                      className="h-7 w-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center text-sm font-bold">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 w-24 text-right shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button type="button" onClick={() => removeItem(item.productId)}
                    className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          {items.length > 0 && (
            <div className="rounded-xl bg-gray-50 px-4 py-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí ship</span>
                <span className={shippingFee === 0 ? "text-[#22c55e]" : ""}>
                  {shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-1.5">
                <span>Tổng</span><span className="text-[#22c55e]">{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery + Payment */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Giao hàng & Thanh toán</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Ngày giao</label>
              <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Khung giờ</label>
              <Select value={deliverySlot} onValueChange={setDeliverySlot}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Chọn khung giờ" /></SelectTrigger>
                <SelectContent>
                  {DELIVERY_SLOTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Phương thức TT</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COD">Tiền mặt (COD)</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Trạng thái TT</label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Chưa thanh toán</SelectItem>
                  <SelectItem value="PAID">Đã thanh toán</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Ghi chú</label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú đơn hàng..." className="rounded-xl resize-none" rows={2} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={submitting || items.length === 0}
        className="w-full h-12 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-base">
        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang tạo đơn...</> : "Tạo đơn hàng"}
      </Button>
    </form>
  );
}
