"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Order } from "@/types"; // Import Order interface từ file types
import { useAuth } from "./auth-context";

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  // Trong tương lai, bạn có thể thêm các hàm khác ở đây
  // Ví dụ: updateOrderStatus: (orderId: number, status: number) => Promise<boolean>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoading: authLoading, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "/api/Order"; // Đặt base URL cho Order API

  const fetchOrders = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Authorization token not available.");
      setIsLoading(false);
      return;
    }

    setError(null);
    try {
      const response = await fetch(`${API_URL}/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }
      
      const data: Order[] = await response.json();
      // Lọc ra các đơn hàng có sản phẩm (không phải đơn rỗng)
      const validOrders = data.filter(order => order.items && order.items.length > 0);
      setOrders(validOrders);

    } catch (err: any) {
      setError(err.message || "Failed to fetch orders.");
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  // Đồng bộ với AuthContext để chỉ fetch khi đã đăng nhập
  useEffect(() => {
    if (!authLoading && user) {
      setIsLoading(true);
      fetchOrders();
    } else if (!authLoading && !user) {
      setIsLoading(false);
      setError("User not authenticated.");
    }
  }, [authLoading, user, fetchOrders]);

  return (
    <OrderContext.Provider value={{ orders, isLoading, error, fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};