import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

interface TopProduct {
  id: string;
  name: string;
  soldCount: number;
  price: number | string;
  images: { url: string }[];
}

interface TopProductsTableProps {
  products: TopProduct[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Sản phẩm bán chạy</CardTitle>
        <Link
          href={ROUTES.ADMIN_PRODUCTS}
          className="text-xs font-medium text-[#22c55e] hover:text-[#16a34a] flex items-center gap-1"
        >
          Xem tất cả <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        {products.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">Chưa có dữ liệu</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xs font-bold text-gray-400 w-5 shrink-0">{i + 1}</span>
                <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={ROUTES.ADMIN_PRODUCT_EDIT(product.id)}
                    className="text-sm font-medium text-gray-800 hover:text-[#22c55e] truncate block"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-gray-400">{formatCurrency(Number(product.price))}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-800">{product.soldCount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">đã bán</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
