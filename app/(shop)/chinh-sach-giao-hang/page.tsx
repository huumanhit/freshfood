import type { Metadata } from "next";
import { Truck, MapPin, Clock } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";

export const metadata: Metadata = {
  title: `Chính sách giao hàng — ${APP_CONFIG.name}`,
  description: "Thông tin chi tiết về phạm vi giao hàng, thời gian nhận đơn và phí vận chuyển thực phẩm.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-50 rounded-2xl text-[#16a34a]">
            <Truck className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900">
              Chính sách giao hàng
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Giao hàng nhanh chóng, đúng hẹn, đảm bảo thực phẩm tươi ngon
            </p>
          </div>
        </div>

        <div className="prose prose-green max-w-none text-gray-600 space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-950 flex items-start gap-2">
              <MapPin className="h-5 w-5 text-[#16a34a] shrink-0 mt-0.5" /> 1. Phạm vi phục vụ
            </h2>
            <p className="leading-relaxed text-sm">
              Chúng tôi thực hiện dịch vụ giao hàng tận nơi trên toàn bộ các quận, huyện thuộc khu vực nội thành **TP. Hồ Chí Minh** nhằm đảm bảo thời gian vận chuyển nhanh nhất, giữ cho thực phẩm tươi mới và không bị biến chất.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-950 flex items-start gap-2">
              <Clock className="h-5 w-5 text-[#16a34a] shrink-0 mt-0.5" /> 2. Thời gian và khung giờ giao nhận đơn
            </h2>
            <p className="leading-relaxed text-sm">
              Quy trình chốt đơn và chuẩn bị hàng của chúng tôi được thiết kế tối ưu nhất:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-sm">
              <li><strong>Chốt đơn trước 22h tối hàng ngày:</strong> Đơn hàng sẽ được đóng gói và giao ngay trong ngày hôm sau theo khung giờ quý khách đã chọn.</li>
              <li><strong>Đặt hàng sau 22h:</strong> Đơn hàng sẽ được chuyển sang giao vào ngày kia (ngày mốt) để đảm bảo thời gian thu hoạch thực phẩm tươi sạch vào sáng sớm từ nông trại.</li>
              <li><strong>Khung giờ giao hàng cố định:</strong>
                <ul className="list-disc list-inside pl-6 mt-1 space-y-1">
                  <li><strong>Sáng:</strong> 08:00 – 12:00</li>
                  <li><strong>Chiều:</strong> 15:00 – 19:00</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-950 flex items-start gap-2">
              <Truck className="h-5 w-5 text-[#16a34a] shrink-0 mt-0.5" /> 3. Biểu phí vận chuyển
            </h2>
            <ul className="list-disc list-inside pl-4 space-y-2 text-sm">
              <li>Miễn phí vận chuyển (Freeship) cho mọi đơn hàng có giá trị thanh toán từ <strong>80.000đ</strong> trở lên.</li>
              <li>Với đơn hàng dưới 80.000đ, phí vận chuyển tiêu chuẩn là <strong>15.000đ</strong> cho mỗi đơn hàng trong khu vực nội thành.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
