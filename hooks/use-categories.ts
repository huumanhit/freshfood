"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Category } from "@/types/product";
import { ApiResponse } from "@/types/api";
import { CACHE_KEYS } from "@/constants/config";

export function useCategories() {
  return useQuery({
    queryKey: [CACHE_KEYS.CATEGORIES],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<Category[]>>("/api/categories");
      return data.data ?? [];
    },
    staleTime: 1000 * 60 * 60,
  });
}
