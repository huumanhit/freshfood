"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product, ProductFilter } from "@/types/product";
import { ApiResponse } from "@/types/api";
import { buildSearchParams } from "@/lib/utils";
import { CACHE_KEYS } from "@/constants/config";

export function useProducts(
  filter: ProductFilter = {},
  initialData?: ApiResponse<Product[]>
) {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, filter],
    queryFn: async () => {
      const params = buildSearchParams(filter as Record<string, string | number | boolean | undefined>);
      const { data } = await axios.get<ApiResponse<Product[]>>(`/api/products?${params}`);
      return data;
    },
    staleTime: 30 * 1000,
    // initialData shows immediately without loading state; gcTime keeps it
    // alive so the first filter change doesn't flash an empty skeleton
    ...(initialData ? { initialData, initialDataUpdatedAt: Date.now() } : {}),
  });
}

export function useProduct(idOrSlug: string) {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, idOrSlug],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<Product>>(
        `/api/products/${idOrSlug}`
      );
      return data.data;
    },
    enabled: !!idOrSlug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, "featured"],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<Product[]>>(
        "/api/products?isFeatured=true&limit=8"
      );
      return data.data ?? [];
    },
  });
}
