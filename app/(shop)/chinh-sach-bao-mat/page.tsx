import type { Metadata } from "next";
import { Shield, Lock, Eye } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";

export const metadata: Metadata = {
  title: `Chính sách bảo mật — ${APP_CONFIG.name}`,
  description: "Chính sách bảo mật thông tin cá nhân và tài khoản người dùng tại cửa hàng thực phẩm sạch.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-50 rounded-2xl text-[#16a34a]">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900">
              Chính sách bảo mật
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Bảo vệ thông tin cá nhân của khách hàng là cam kết hàng đầu của chúng tôi
            </p>
          </div>
        </div>

        <div className="prose prose-green max-w-none text-gray-600 space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-950 flex items-start gap-2">
              <Eye className="h-5 w-5 text-[#16a34a] shrink-0 mt-0.5" /> 1. Mục đích thu thập thông tin
            </h2>
            <p className="leading-relaxed text-sm">
              Chúng tôi thu thập thông tin cá nhân bao gồm Họ tên, Số điện thoại, Email và Địa chỉ giao hàng của khách hàng với mục đích duy nhất:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-sm">
              <li>Xử lý và vận chuyển đơn hàng chính xác nhất.</li>
              <li>Liên hệ hỗ trợ, xác nhận trạng thái đơn hàng và giải quyết các khiếu nại phát sinh.</li>
              <li>Thông báo các chương trình ưu đãi, khuyến mãi đặc biệt (chỉ thực hiện khi được khách hàng đồng ý).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-950 flex items-start gap-2">
              <Lock className="h-5 w-5 text-[#16a34a] shrink-0 mt-0.5" /> 2. Cam kết bảo mật an toàn thông tin
            </h2>
            <p className="leading-relaxed text-sm">
              Mọi dữ liệu cá nhân của quý khách được mã hóa và lưu trữ an toàn tuyệt đối trên hệ thống máy chủ của chúng tôi. Chúng tôi cam kết:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2 text-sm">
              <li>Không bán, chia sẻ hoặc trao đổi thông tin khách hàng cho bên thứ ba vì bất kỳ mục đích thương mại nào.</li>
              <li>Chỉ cung cấp thông tin cần thiết (tên, số điện thoại, địa chỉ) cho đối tác vận chuyển nội bộ để hoàn tất việc giao hàng.</li>
              <li>Sử dụng các công nghệ bảo mật hiện đại nhất để phòng ngừa các hành vi truy cập trái phép.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-950 flex items-start gap-2">
              <Shield className="h-5 w-5 text-[#16a34a] shrink-0 mt-0.5" /> 3. Quyền lợi của khách hàng
            </h2>
            <p className="leading-relaxed text-sm">
              Quý khách có toàn quyền truy cập, chỉnh sửa hoặc yêu cầu hệ thống xóa vĩnh viễn thông tin tài khoản cá nhân bất kỳ lúc nào bằng cách đăng nhập vào website hoặc liên hệ trực tiếp với bộ phận chăm sóc khách hàng qua Hotline/Zalo.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
