"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { ProductStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/constants/routes";

const STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Đang bán",
  INACTIVE: "Tạm ẩn",
  OUT_OF_STOCK: "Hết hàng",
  DISCONTINUED: "Ngừng bán",
};

const STATUS_COLORS: Record<ProductStatus, string> = {
  ACTIVE: "bg-green-50 text-green-600 border-green-200",
  INACTIVE: "bg-gray-50 text-gray-500 border-gray-200",
  OUT_OF_STOCK: "bg-orange-50 text-orange-500 border-orange-200",
  DISCONTINUED: "bg-red-50 text-red-500 border-red-200",
};

interface ProductRow {
  id: string;
  name: string;
  status: ProductStatus;
  price: number | string;
  salePrice: number | string | null;
  stock: number;
  soldCount: number;
  category: { name: string } | null;
  images: { url: string }[];
  _count: { reviews: number; orderItems: number };
}

export function AdminProductsTable() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = new URLSearchParams({
    page: String(page),
    limit: "15",
    ...(search && { search }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, search, statusFilter],
    queryFn: async () => {
      const { data } = await axios.get(`/api/admin/products?${params}`);
      return data;
    },
    staleTime: 30_000,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProductStatus }) => {
      await axios.patch(`/api/admin/products/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Đã cập nhật trạng thái sản phẩm", variant: "success" });
    },
    onError: () => toast({ title: "Lỗi cập nhật", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setDeleteId(null);
      toast({ title: "Đã ngừng bán sản phẩm", variant: "success" });
    },
    onError: () => toast({ title: "Lỗi xóa sản phẩm", variant: "destructive" }),
  });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const products: ProductRow[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm tên, SKU..."
              value={search}
              onChange={handleSearchChange}
              className="pl-9 rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36 rounded-xl">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button asChild className="rounded-xl bg-[#16a34a] hover:bg-[#16a34a] shrink-0">
          <Link href={ROUTES.ADMIN_PRODUCT_NEW}>
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead className="text-center">Kho</TableHead>
              <TableHead className="text-center">Đã bán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                  Không tìm thấy sản phẩm nào
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, i) => {
                const img = product.images[0];
                const hasDiscount = product.salePrice != null && Number(product.salePrice) < Number(product.price);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="text-xs text-gray-400 font-mono">
                      {(page - 1) * 15 + i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {img ? (
                            <Image src={img.url} alt={product.name} fill sizes="40px" className="object-cover" unoptimized />
                          ) : <div className="h-full w-full bg-gray-100" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-gray-400">{product._count.reviews} đánh giá</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {product.category?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatCurrency(hasDiscount ? Number(product.salePrice) : Number(product.price))}
                        </p>
                        {hasDiscount && (
                          <p className="text-xs text-gray-400 line-through">{formatCurrency(Number(product.price))}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-orange-500" : "text-gray-700"}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">{product.soldCount}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[product.status]}`}>
                        {STATUS_LABELS[product.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(ROUTES.ADMIN_PRODUCT_EDIT(product.id))}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleStatusMutation.mutate({
                              id: product.id,
                              status: product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                            })}
                          >
                            {product.status === "ACTIVE"
                              ? <><EyeOff className="h-3.5 w-3.5 mr-2" /> Tạm ẩn</>
                              : <><Eye className="h-3.5 w-3.5 mr-2" /> Hiện thị</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => setDeleteId(product.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Ngừng bán
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>
            Hiển thị {products.length} / {pagination.total} sản phẩm
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg h-8"
              disabled={!pagination.hasPrev}
              onClick={() => setPage(page - 1)}
            >
              Trước
            </Button>
            <span className="flex items-center px-3 text-sm font-medium">
              {page}/{pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg h-8"
              disabled={!pagination.hasNext}
              onClick={() => setPage(page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ngừng bán sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Sản phẩm sẽ bị ẩn khỏi cửa hàng và đánh dấu là ngừng bán. Bạn có thể khôi phục sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
