import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";

export const metadata: Metadata = {
  title: `Liên hệ — ${APP_CONFIG.name}`,
  description: `Liên hệ với cửa hàng thực phẩm tươi sạch ${APP_CONFIG.name} qua Hotline/Zalo 0932 133 139 hoặc địa chỉ email.`,
};

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-green-50 rounded-2xl text-[#16a34a]">
            <MessageCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Hỗ trợ 24/7 qua Hotline và Zalo OA
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Card Hotline / Zalo */}
          <a
            href="https://zalo.me/0932133139"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-5 rounded-2xl bg-green-50/50 border border-green-100 hover:bg-green-50 transition-colors"
          >
            <div className="p-2.5 bg-green-100 text-[#16a34a] rounded-xl shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Hotline / Zalo OA</p>
              <p className="text-lg font-bold text-gray-900 mt-1">0932 133 139</p>
              <p className="text-xs text-[#16a34a] font-medium mt-1">Nhấp để nhắn tin Zalo ngay 💬</p>
            </div>
          </a>

          {/* Card Email */}
          <a
            href={`mailto:${APP_CONFIG.email}`}
            className="flex items-start gap-4 p-5 rounded-2xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition-colors"
          >
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Địa chỉ Email</p>
              <p className="text-lg font-bold text-gray-900 mt-1 break-all">{APP_CONFIG.email}</p>
              <p className="text-xs text-blue-600 font-medium mt-1">Gửi thư phản hồi, đóng góp ý kiến</p>
            </div>
          </a>

          {/* Card Địa chỉ */}
          <div className="sm:col-span-2 flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="p-2.5 bg-gray-200 text-gray-600 rounded-xl shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Địa chỉ cửa hàng</p>
              <p className="text-sm font-medium text-gray-800 mt-1.5 leading-relaxed">{APP_CONFIG.address}</p>
            </div>
          </div>
        </div>

        {/* Map Placeholder or note */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 text-center">
            {APP_CONFIG.name} — Hân hạnh được chăm sóc bữa ăn gia đình Việt.
          </p>
        </div>
      </div>
    </div>
  );
}
