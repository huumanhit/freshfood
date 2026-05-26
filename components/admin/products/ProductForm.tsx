"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Save } from "lucide-react";
import { ProductStatus } from "@prisma/client";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/constants/routes";

const productFormSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(255),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive("Giá phải lớn hơn 0"),
  salePrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().max(100).optional(),
  stock: z.coerce.number().int().min(0),
  unit: z.string().min(1).max(50),
  weight: z.coerce.number().positive().optional().nullable(),
  origin: z.string().max(100).optional(),
  status: z.nativeEnum(ProductStatus),
  isFeatured: z.boolean(),
  isOrganic: z.boolean(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  imageUrl: z.string().url("URL ảnh không hợp lệ").optional().or(z.literal("")),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  productId?: string;
  defaultValues?: Partial<ProductFormValues> & {
    images?: { url: string; isPrimary: boolean }[];
  };
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang bán" },
  { value: "INACTIVE", label: "Tạm ẩn" },
  { value: "OUT_OF_STOCK", label: "Hết hàng" },
  { value: "DISCONTINUED", label: "Ngừng bán" },
];

export function ProductForm({ productId, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!productId;

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/categories");
      return data.data as { id: string; name: string; isActive: boolean }[];
    },
  });

  const primaryImage = defaultValues?.images?.find((i) => i.isPrimary) ?? defaultValues?.images?.[0];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      shortDescription: defaultValues?.shortDescription ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ?? undefined,
      salePrice: defaultValues?.salePrice ?? null,
      sku: defaultValues?.sku ?? "",
      stock: defaultValues?.stock ?? 0,
      unit: defaultValues?.unit ?? "kg",
      weight: defaultValues?.weight ?? null,
      origin: defaultValues?.origin ?? "",
      status: defaultValues?.status ?? ProductStatus.ACTIVE,
      isFeatured: defaultValues?.isFeatured ?? false,
      isOrganic: defaultValues?.isOrganic ?? false,
      categoryId: defaultValues?.categoryId ?? "",
      imageUrl: primaryImage?.url ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const { imageUrl, ...rest } = values;
      const payload = {
        ...rest,
        images: imageUrl ? [{ url: imageUrl, isPrimary: true, sortOrder: 0 }] : undefined,
      };
      if (isEdit) {
        await axios.patch(`/api/admin/products/${productId}`, payload);
      } else {
        await axios.post("/api/admin/products", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Sản phẩm đã được cập nhật" : "Sản phẩm đã được tạo",
        variant: "success",
      });
      router.push(ROUTES.ADMIN_PRODUCTS);
      router.refresh();
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Có lỗi xảy ra";
      toast({ title: msg ?? "Có lỗi xảy ra", variant: "destructive" });
    },
  });

  const categories = categoriesData ?? [];

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Tên sản phẩm *</label>
                <Input {...register("name")} placeholder="Rau cải xanh hữu cơ" className="rounded-xl" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Mô tả ngắn</label>
                <Textarea {...register("shortDescription")} placeholder="Mô tả ngắn gọn..." className="rounded-xl resize-none" rows={2} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Mô tả chi tiết</label>
                <Textarea {...register("description")} placeholder="Mô tả đầy đủ về sản phẩm..." className="rounded-xl resize-none" rows={5} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">URL ảnh đại diện</label>
                <Input {...register("imageUrl")} placeholder="https://..." className="rounded-xl" />
                {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Giá & Kho hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Giá bán (VND) *</label>
                  <Input {...register("price")} type="number" placeholder="50000" className="rounded-xl" />
                  {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Giá khuyến mãi</label>
                  <Input {...register("salePrice")} type="number" placeholder="45000" className="rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Tồn kho *</label>
                  <Input {...register("stock")} type="number" min="0" className="rounded-xl" />
                  {errors.stock && <p className="text-xs text-red-500">{errors.stock.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Đơn vị *</label>
                  <Input {...register("unit")} placeholder="kg" className="rounded-xl" />
                  {errors.unit && <p className="text-xs text-red-500">{errors.unit.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">SKU</label>
                  <Input {...register("sku")} placeholder="SKU-001" className="rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Khối lượng (kg)</label>
                  <Input {...register("weight")} type="number" step="0.001" placeholder="0.500" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Xuất xứ</label>
                  <Input {...register("origin")} placeholder="Đà Lạt" className="rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân loại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Danh mục *</label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Chọn danh mục..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nhãn sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Sản phẩm nổi bật</p>
                      <p className="text-xs text-gray-400">Hiển thị trên trang chủ</p>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />
              <Separator />
              <Controller
                name="isOrganic"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Sản phẩm Organic</p>
                      <p className="text-xs text-gray-400">Gắn nhãn "Organic"</p>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-11 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold"
          >
            {mutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> {isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}</>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
