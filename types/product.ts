import { ProductStatus } from "@prisma/client";

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  sku: string | null;
  stock: number;
  unit: string;
  weight: number | null;
  origin: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  isOrganic: boolean;
  isCore: boolean;
  categoryId: string;
  soldCount?: number;
  viewCount?: number;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  images?: ProductImage[];
  averageRating?: number;
  reviewCount?: number;
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  isFeatured?: boolean;
  status?: ProductStatus;
  search?: string;
  origin?: string;
  sortBy?: "price" | "name" | "createdAt" | "soldCount" | "rating";
  sortOrder?: "asc" | "desc";
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku?: string;
  stock: number;
  unit: string;
  weight?: number;
  origin?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  isOrganic?: boolean;
  isCore?: boolean;
  categoryId: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string;
  images?: { url: string; alt?: string; isPrimary?: boolean }[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;
