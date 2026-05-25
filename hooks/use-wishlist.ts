"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse } from "@/types/api";
import { useAuth } from "@/hooks/use-auth";

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    images: { url: string; isPrimary: boolean }[];
  };
}

const WISHLIST_KEY = "wishlist";

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [WISHLIST_KEY],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<WishlistItem[]>>("/api/wishlist");
      return data.data ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const addMutation = useMutation({
    mutationFn: (productId: string) =>
      axios.post("/api/wishlist", { productId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [WISHLIST_KEY] }),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) =>
      axios.delete(`/api/wishlist/${productId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [WISHLIST_KEY] }),
  });

  function isInWishlist(productId: string): boolean {
    return query.data?.some((item) => item.productId === productId) ?? false;
  }

  function toggle(productId: string) {
    if (isInWishlist(productId)) {
      removeMutation.mutate(productId);
    } else {
      addMutation.mutate(productId);
    }
  }

  return {
    wishlist: query.data ?? [],
    isLoading: query.isLoading,
    isInWishlist,
    toggle,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}
