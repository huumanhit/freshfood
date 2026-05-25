import { OrderStatus, PaymentStatus, PaymentMethod } from "@prisma/client";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode: string | null;
  note: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  address?: {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    street: string;
  };
}

export interface CreateOrderPayload {
  addressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  note?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    stock: number;
    unit: string;
    images: { url: string; isPrimary: boolean }[];
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
