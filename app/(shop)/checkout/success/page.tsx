import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt hàng thành công",
};

interface CheckoutSuccessPageProps {
  searchParams: { orderId?: string };
}

export default function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  return (
    <div className="container py-16 text-center">
      {/* OrderSuccessContent — Phase 2 */}
    </div>
  );
}
