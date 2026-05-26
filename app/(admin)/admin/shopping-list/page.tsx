import type { Metadata } from "next";
import { ShoppingListManager } from "@/components/admin/shopping-list/ShoppingListManager";

export const metadata: Metadata = { title: "Danh sách mua hàng" };
export const dynamic = "force-dynamic";

export default function AdminShoppingListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Danh sách mua hàng</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tổng hợp nguyên liệu cần mua theo ngày, phân nhóm theo nhà cung cấp
        </p>
      </div>
      <ShoppingListManager />
    </div>
  );
}
