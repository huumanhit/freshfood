"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Loader2, Tag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  parent: { id: string; name: string } | null;
  _count: { products: number };
}

const categoryFormSchema = z.object({
  name: z.string().min(1, "Tên danh mục không được trống").max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function CategoryManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await axios.get<{ data: Category[] }>("/api/admin/categories");
      return data.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", description: "", sortOrder: 0, isActive: true },
  });

  const isActive = watch("isActive");

  function openCreate() {
    setEditTarget(null);
    reset({ name: "", description: "", sortOrder: 0, isActive: true });
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditTarget(cat);
    reset({
      name: cat.name,
      description: cat.description ?? "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      if (editTarget) {
        await axios.patch(`/api/admin/categories/${editTarget.id}`, values);
      } else {
        await axios.post("/api/admin/categories", values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setDialogOpen(false);
      toast({ title: editTarget ? "Đã cập nhật danh mục" : "Đã tạo danh mục", variant: "success" });
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Có lỗi xảy ra";
      toast({ title: msg ?? "Có lỗi xảy ra", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setDeleteTarget(null);
      toast({ title: "Đã xóa danh mục", variant: "success" });
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Không thể xóa";
      toast({ title: msg ?? "Không thể xóa", variant: "destructive" });
    },
  });

  const categories: Category[] = data ?? [];

  const DEFAULT_CATEGORIES = ["Rau củ", "Thịt", "Hải sản", "Trứng", "Gia vị", "Khác"];
  const hasDefaults = categories.some((c) => DEFAULT_CATEGORIES.includes(c.name));

  return (
    <div className="space-y-4">
      {/* Seed hint */}
      {!isLoading && categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center space-y-3">
          <Tag className="h-10 w-10 text-gray-300 mx-auto" />
          <div>
            <p className="font-medium text-gray-600">Chưa có danh mục nào</p>
            <p className="text-sm text-gray-400 mt-1">Tạo danh mục để phân loại sản phẩm</p>
          </div>
          <Button onClick={openCreate} className="rounded-xl bg-[#16a34a] hover:bg-[#16a34a]">
            <Plus className="h-4 w-4 mr-1.5" /> Tạo danh mục đầu tiên
          </Button>
        </div>
      )}

      {categories.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{categories.length} danh mục</p>
            <Button onClick={openCreate} className="rounded-xl bg-[#16a34a] hover:bg-[#16a34a]">
              <Plus className="h-4 w-4 mr-1.5" /> Thêm danh mục
            </Button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Sản phẩm</TableHead>
                  <TableHead className="text-center">Thứ tự</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : categories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-[#16a34a]/10 flex items-center justify-center shrink-0">
                              <Tag className="h-3.5 w-3.5 text-[#22c55e]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                              {cat.description && (
                                <p className="text-xs text-gray-400 truncate max-w-[160px]">{cat.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-400">{cat.slug}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                            <Package className="h-3.5 w-3.5 text-gray-400" />
                            {cat._count.products}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">{cat.sortOrder}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cat.isActive ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                            {cat.isActive ? "Hoạt động" : "Ẩn"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(cat)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50"
                              onClick={() => setDeleteTarget(cat)}
                              disabled={cat._count.products > 0}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Tên danh mục *</label>
              <Input {...register("name")} placeholder="Rau củ" className="rounded-xl" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Mô tả</label>
              <Textarea {...register("description")} placeholder="Mô tả ngắn..." className="rounded-xl resize-none" rows={2} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Thứ tự hiển thị</label>
              <Input {...register("sortOrder")} type="number" min="0" className="rounded-xl" />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-800">Hiển thị</p>
                <p className="text-xs text-gray-400">Danh mục xuất hiện trong cửa hàng</p>
              </div>
              <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saveMutation.isPending} className="rounded-xl bg-[#16a34a] hover:bg-[#16a34a]">
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editTarget ? "Lưu thay đổi" : "Tạo danh mục"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
