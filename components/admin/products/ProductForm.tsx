"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { Loader2, Save, UploadCloud, X } from "lucide-react";
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
  isCore: z.boolean(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  imageUrl: z.string().url("URL ảnh không hợp lệ").optional().or(z.literal("")),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// ── Image upload widget ──────────────────────────────────────────────────────
interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const { toast } = useToast();

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Chỉ chấp nhận file ảnh", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File quá lớn, tối đa 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await axios.post("/api/upload", fd);
      onChange(data.data.url);
    } catch {
      toast({ title: "Upload thất bại — thử nhập URL trực tiếp", variant: "destructive" });
      setShowUrlInput(true);
    } finally {
      setUploading(false);
    }
  }, [onChange, toast]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  if (value) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group" style={{ height: 180 }}>
        <Image src={value} alt="Product image" fill className="object-contain p-2" unoptimized />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition-colors"
          >
            Đổi ảnh
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-red-600 transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Xóa
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    );
  }

  if (showUrlInput) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
          />
          <button
            type="button"
            onClick={() => { if (urlDraft) { onChange(urlDraft); setShowUrlInput(false); setUrlDraft(""); } }}
            className="px-4 py-2 bg-[#16a34a] text-white text-sm font-semibold rounded-xl hover:bg-[#15803d]"
          >
            Dùng URL
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="px-3 py-2 border border-gray-200 text-sm rounded-xl hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400">Hoặc <button type="button" className="text-[#16a34a] underline" onClick={() => { setShowUrlInput(false); inputRef.current?.click(); }}>thử upload lại</button></p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors select-none ${
          dragOver ? "border-[#16a34a] bg-green-50" : "border-gray-200 bg-gray-50 hover:border-[#16a34a] hover:bg-green-50"
        }`}
        style={{ height: 160 }}
      >
        {uploading ? (
          <><Loader2 className="h-8 w-8 text-[#16a34a] animate-spin" /><p className="text-sm text-gray-500">Đang tải lên...</p></>
        ) : (
          <><UploadCloud className="h-8 w-8 text-gray-400" /><p className="text-sm font-medium text-gray-600">Kéo thả hoặc click để chọn ảnh</p><p className="text-xs text-gray-400">JPG, PNG, WebP — tối đa 5MB</p></>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      <button
        type="button"
        onClick={() => setShowUrlInput(true)}
        className="text-xs text-gray-400 hover:text-[#16a34a] underline"
      >
        Nhập URL trực tiếp
      </button>
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

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
      isCore: defaultValues?.isCore ?? false,
      categoryId: defaultValues?.categoryId ?? "",
      imageUrl: primaryImage?.url ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const { imageUrl, ...rest } = values;
      const payload = {
        ...rest,
        // Always send images: empty array = delete all, non-empty = replace
        images: imageUrl ? [{ url: imageUrl, isPrimary: true, sortOrder: 0 }] : [],
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
                <label className="text-sm font-medium text-gray-700">Ảnh sản phẩm</label>
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => (
                    <ImageUploader value={field.value ?? ""} onChange={field.onChange} />
                  )}
                />
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
              <Separator />
              <Controller
                name="isCore"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Sản phẩm Lõi</p>
                      <p className="text-xs text-gray-400">Luôn hiển thị mọi khung giờ</p>
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
            className="w-full h-11 rounded-xl bg-[#16a34a] hover:bg-[#16a34a] text-white font-semibold"
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
