"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState, useCallback, useEffect } from "react";
import { Loader2, MapPin, User, Phone, FileText, Users, Navigation, AlertCircle, ShieldCheck } from "lucide-react";
import { checkoutSchema, CheckoutFormValues } from "@/lib/validations/order";
import { getCutoffNotice } from "@/lib/business/ordering";
import { useCart } from "@/hooks/use-cart";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeliverySlotPicker } from "@/components/checkout/DeliverySlotPicker";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";


export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const [cutoffNotice, setCutoffNotice] = useState<string | null>(null);
  // Only compute server-time-dependent value on client to avoid hydration mismatch
  useEffect(() => { setCutoffNotice(getCutoffNotice()); }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "COD",
      deliverySlot: "",
      note: "",
      referralPhone: "",
      consentGiven: false,
    },
  });

  const paymentMethod = watch("paymentMethod");
  const deliverySlot = watch("deliverySlot");
  const consentGiven = watch("consentGiven");

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const link = `https://maps.google.com/?q=${lat},${lng}`;
        setValue("lat", lat);
        setValue("lng", lng);
        setValue("mapLink", link);
        setLocationLabel(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setLocating(false);
      },
      () => {
        setLocating(false);
      }
    );
  }, [setValue]);

  async function onSubmit(values: CheckoutFormValues) {
    setSubmitError(null);
    try {
      const cartItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const { data } = await axios.post("/api/checkout", { ...values, cartItems });

      if (data.success) {
        clearCart();
        const { orderId, orderNumber, phone, total, paymentMethod } = data.data;
        if (paymentMethod === "BANK_TRANSFER") {
          router.push(
            `/checkout/payment?orderId=${orderId}&orderNumber=${encodeURIComponent(orderNumber)}&amount=${total}&phone=${encodeURIComponent(phone)}`
          );
        } else {
          router.push(`${ROUTES.CHECKOUT_SUCCESS}?orderId=${orderId}&phone=${encodeURIComponent(phone)}`);
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
      } else {
        setSubmitError("Có lỗi xảy ra, vui lòng thử lại.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Cutoff notice */}
      {cutoffNotice && (
        <div className="flex items-start gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {cutoffNotice}
        </div>
      )}

      {/* Recipient info */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <User className="h-4 w-4 text-[#22c55e]" />
          Thông tin người nhận
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("fullName")}
              placeholder="Nguyễn Văn A"
              className="rounded-xl"
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("phone")}
              placeholder="0912 345 678"
              inputMode="tel"
              className="rounded-xl"
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Delivery address */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#22c55e]" />
            Địa chỉ giao hàng
          </h2>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locating}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
          >
            {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
            {locating ? "Đang lấy vị trí..." : "Lấy vị trí của tôi"}
          </button>
        </div>

        {locationLabel && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            Đã ghim vị trí: {locationLabel}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Tỉnh / Thành phố <span className="text-red-500">*</span>
            </label>
            <Input {...register("province")} placeholder="TP. Hồ Chí Minh" className="rounded-xl" />
            {errors.province && (
              <p className="text-xs text-red-500">{errors.province.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Quận / Huyện <span className="text-red-500">*</span>
            </label>
            <Input {...register("district")} placeholder="Quận 1" className="rounded-xl" />
            {errors.district && (
              <p className="text-xs text-red-500">{errors.district.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Phường / Xã <span className="text-red-500">*</span>
            </label>
            <Input {...register("ward")} placeholder="Phường Bến Nghé" className="rounded-xl" />
            {errors.ward && (
              <p className="text-xs text-red-500">{errors.ward.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Số nhà, tên đường <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("street")}
            placeholder="123 Nguyễn Huệ"
            className="rounded-xl"
          />
          {errors.street && (
            <p className="text-xs text-red-500">{errors.street.message}</p>
          )}
        </div>
      </section>

      {/* Delivery slot */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <DeliverySlotPicker
          value={deliverySlot}
          onChange={(v) => setValue("deliverySlot", v, { shouldValidate: true })}
          error={errors.deliverySlot?.message}
        />
      </section>

      {/* Payment method */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <PaymentMethodSelector
          value={paymentMethod}
          onChange={(v) => setValue("paymentMethod", v as "COD" | "BANK_TRANSFER", { shouldValidate: true })}
          error={errors.paymentMethod?.message}
        />

      </section>

      {/* Note + referral */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#22c55e]" />
          Ghi chú & thông tin thêm
        </h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Ghi chú đơn hàng (tùy chọn)</label>
          <Textarea
            {...register("note")}
            placeholder="Giao trước cổng, gọi trước 30 phút..."
            className="rounded-xl resize-none"
            rows={3}
          />
          {errors.note && <p className="text-xs text-red-500">{errors.note.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            Số điện thoại giới thiệu (tùy chọn)
          </label>
          <Input
            {...register("referralPhone")}
            placeholder="0912 345 678"
            inputMode="tel"
            className="rounded-xl"
          />
          {errors.referralPhone && (
            <p className="text-xs text-red-500">{errors.referralPhone.message}</p>
          )}
        </div>
      </section>

      {/* Privacy consent */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("consentGiven")}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#22c55e] accent-[#22c55e]"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            <ShieldCheck className="inline h-3.5 w-3.5 text-[#22c55e] mr-1" />
            Tôi đồng ý với{" "}
            <a href="/privacy" target="_blank" className="text-[#22c55e] underline underline-offset-2 hover:text-[#16a34a]">
              Chính sách quyền riêng tư
            </a>{" "}
            và cho phép FreshFood lưu trữ thông tin để xử lý đơn hàng.
            <span className="text-red-500 ml-1">*</span>
          </span>
        </label>
        {errors.consentGiven && (
          <p className="mt-2 text-xs text-red-500">{errors.consentGiven.message}</p>
        )}
      </section>

      {/* Error */}
      {submitError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting || items.length === 0 || !consentGiven}
        className="w-full h-12 rounded-xl bg-[#16a34a] hover:bg-[#16a34a] text-white font-semibold text-base disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang đặt hàng...
          </>
        ) : (
          "Đặt hàng ngay"
        )}
      </Button>
    </form>
  );
}
