import type { Metadata } from "next";
import { REVALIDATE } from "@/constants/config";

export const revalidate = REVALIDATE.PRODUCTS;

export const metadata: Metadata = {
  title: "Tất cả sản phẩm",
  description: "Khám phá hàng nghìn sản phẩm thực phẩm sạch, tươi ngon",
};

interface ProductsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    categorySlug?: string;
    minPrice?: string;
    maxPrice?: string;
    isOrganic?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="container py-8">
      {/* ProductFilter sidebar — Phase 2 */}
      {/* ProductGrid — Phase 2 */}
      {/* Pagination — Phase 2 */}
    </div>
  );
}
