import { z } from "zod";
import { ProductStatus } from "@prisma/client";

export const createProductSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm tối thiểu 2 ký tự").max(255),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  price: z.number().positive("Giá phải lớn hơn 0"),
  salePrice: z.number().positive().optional().nullable(),
  sku: z.string().max(100).optional(),
  stock: z.number().int().min(0, "Tồn kho không được âm"),
  unit: z.string().min(1).max(50),
  weight: z.number().positive().optional().nullable(),
  origin: z.string().max(100).optional(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  isFeatured: z.boolean().default(false),
  isOrganic: z.boolean().default(false),
  isCore: z.boolean().default(false),
  categoryId: z.string().cuid("Category ID không hợp lệ"),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  tags: z.string().max(1000).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        isPrimary: z.boolean().default(false),
        sortOrder: z.number().int().default(0),
      })
    )
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  categorySlug: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  isOrganic: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  sortBy: z
    .enum(["price", "name", "createdAt", "soldCount", "rating"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
