import type { Metadata } from "next";
import { RefreshCcw, ShieldCheck, CheckCircle2 } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";

export const metadata: Metadata = {
  title: `Chính sách đổi trả — ${APP_CONFIG.name}`,
  description: "Chính sách đổi trả hàng linh hoạt và nhanh chóng trong vòng 24h đối với sản phẩm không đạt chất lượng.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-50 rounded-2xl text-[#16a34a]">
            <RefreshCcw className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900">
              Chính sách đổi trả
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Cam kết chất lượng thực phẩm luôn tươi ngon nhất
            </p>
          </div>
        </div>

        <div className="prose prose-green max-w-none text-gray-600 space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-950 flex items-start gap-2">
              <ShieldCheck className="h-5 w-5 text-[#16a34a] shrink-0 mt-0.5" /> 1. Cam kết chất lượng dịch vụ
            </h2>
            <p className="leading-relaxed text-sm">
              Tại <strong>{APP_CONFIG.name}</strong>, chúng tôi luôn ưu tiên hàng đầu chất lượng vệ sinh an toàn thực phẩm. Tất cả các mặt hàng rau củ quả, thịt cá, hải sản tươi sống đều được tuyển chọn kỹ lưỡng, bảo quản ở điều kiện tối ưu và đóng gói cẩn thận trước khi giao đến quý khách.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-950 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#16a34a] shrink-0 mt-0.5" /> 2. Trường hợp được áp dụng đổi trả
            </h2>
            <p className="leading-relaxed text-sm">
              Quý khách có quyền yêu cầu đổi mới sản phẩm hoặc hoàn tiền trong các trường hợp sau:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-sm">
              <li>Sản phẩm bị dập nát, hư hỏng do quá trình vận chuyển.</li>
              <li>Sản phẩm bị ôi thiu, héo úa hoặc không đảm bảo độ tươi ngon khi vừa nhận.</li>
              <li>Giao sai chủng loại sản phẩm, sai quy cách hoặc thiếu trọng lượng so với đơn đặt hàng.</li>
              <li>Sản phẩm đã quá hạn sử dụng (nếu có ghi trên bao bì).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-950 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#16a34a] shrink-0 mt-0.5" /> 3. Thời gian và phương thức đổi trả
            </h2>
            <ul className="list-disc list-inside pl-4 space-y-2 text-sm">
              <li><strong>Thời gian tiếp nhận:</strong> Trong vòng <strong>24 giờ</strong> kể từ thời điểm nhận hàng thành công.</li>
              <li><strong>Cách thức gửi yêu cầu:</strong> Chụp ảnh sản phẩm bị lỗi và gửi thông tin qua Hotline/Zalo: <strong>{APP_CONFIG.phone}</strong> kèm mã đơn hàng.</li>
              <li><strong>Phương thức xử lý:</strong> Chúng tôi sẽ xác nhận thông tin và tiến hành giao bổ sung sản phẩm mới miễn phí hoặc hoàn tiền vào tài khoản ngân hàng của quý khách trong vòng 24 giờ làm việc.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
