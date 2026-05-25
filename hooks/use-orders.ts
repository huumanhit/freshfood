"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Order, CreateOrderPayload } from "@/types/order";
import { ApiResponse } from "@/types/api";
import { CACHE_KEYS } from "@/constants/config";
import { API_ENDPOINTS } from "@/constants/api";

export function useOrders() {
  return useQuery({
    queryKey: [CACHE_KEYS.ORDERS],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<Order[]>>(API_ENDPOINTS.ORDERS);
      return data.data ?? [];
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: [CACHE_KEYS.ORDERS, id],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<Order>>(
        API_ENDPOINTS.ORDER(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const { data } = await axios.post<ApiResponse<Order>>(
        API_ENDPOINTS.ORDERS,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART] });
    },
  });
}
