"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDebounce } from "./use-debounce";
import { Product, ProductFilter } from "@/types/product";
import { ApiResponse } from "@/types/api";
import { buildSearchParams } from "@/lib/utils";
import { CACHE_KEYS } from "@/constants/config";

export function useProducts(filter: ProductFilter = {}) {
  const debouncedSearch = useDebounce(filter.search, 400);

  return useQuery({
    queryKey: [CACHE_KEYS.PRODUCTS, { ...filter, search: debouncedSearch }],
    queryFn: async () => {
      const params = buildSearchParams({
        ...filter,
        search: debouncedSearch,
      } as Record<string, string | number | boolean | undefined>);
      const { data } = await axios.get<ApiResponse<Product[]>>(
        `/api/products?${params}`
      );
      return data;
    },
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
