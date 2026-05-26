"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product, ProductFilter } from "@/types/product";
import { ApiResponse } from "@/types/api";
import { buildSearchParams } from "@/lib/utils";
import { CACHE_KEYS } from "@/constants/config";

export function useProducts(filter: ProductFilter = {}) {
  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, filter],
    queryFn: async () => {
      const params = buildSearchParams(filter as Record<string, string | number | boolean | undefined>);
      const { data } = await axios.get<ApiResponse<Product[]>>(`/api/products?${params}`);
      return data;
    },
    staleTime: 30 * 1000,
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
