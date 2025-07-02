"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Payment } from "@/types";
import { useAuth } from "./auth-context"; // Đã có sẵn

interface PaymentContextType {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  fetchPayments: () => void;
  confirmPremiumPayment: (orderCode: number) => Promise<boolean>;
  checkLivePaymentStatus: (orderCode: number) => Promise<string | null>;
  cancelPayment: (orderCode: number, cancellationReason: string) => Promise<boolean>; // THÊM: Hàm cancelPayment
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  // THAY ĐỔI 1: Lấy thêm isLoading và user từ useAuth.
  // Đổi tên isLoading thành authLoading để tránh trùng lặp.
  const { getToken, isLoading: authLoading, user } = useAuth();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "/api"; // Sử dụng base URL để dễ quản lý

  const fetchPayments = useCallback(async () => {
    // Không cần gọi setIsLoading(true) ở đây nữa vì useEffect sẽ quản lý
    const token = getToken();
    if (!token) {
        // Lỗi này sẽ được xử lý bởi useEffect, không nên throw ở đây
        setError("Authorization token not available.");
        setIsLoading(false);
        return;
    }
    
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/Payment/getpayment`, { // Thêm /Payment
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setPayments(data);

    } catch (err: any) {
      setError(err.message || "Failed to fetch payments.");
    } finally {
      setIsLoading(false); // Chỉ tắt loading khi fetch xong
    }
  }, [getToken]); // SỬA LỖI: Thêm getToken vào dependency array

  // THAY ĐỔI 2: Cập nhật useEffect để chờ AuthContext
  useEffect(() => {
    // Chỉ fetch payments khi auth không còn loading VÀ user đã tồn tại (đã đăng nhập)
    if (!authLoading && user) {
      setIsLoading(true); // Bật loading của PaymentContext trước khi fetch
      fetchPayments();
    } else if (!authLoading && !user) {
      // Nếu auth xong mà không có user, dừng loading và không làm gì cả
      setIsLoading(false);
      setError("User not authenticated.");
    }
    // Nếu authLoading là true, chúng ta chỉ cần đợi.
  }, [authLoading, user, fetchPayments]); // Dependencies để trigger lại khi auth thay đổi

  const cancelPayment = useCallback(async (orderCode: number, cancellationReason: string): Promise<boolean> => {
    const token = getToken();
    if (!token) {
      setError("Authorization token not available.");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Payment/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderCode, cancellationReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to cancel payment: ${response.status} ${response.statusText}`);
      }

      // Refresh payments after successful cancellation
      await fetchPayments();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to cancel payment.");
      console.error("Cancel Payment Error:", err);
      return false;
    }
  }, [getToken, fetchPayments]);

  const confirmPremiumPayment = async (orderCode: number): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) throw new Error("Authorization token not found.");

      const response = await fetch(`${API_BASE_URL}/Payment/confirm-premium-payment`, { // Thêm /Payment
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to confirm payment: ${response.status}`);
      }
      
      const result = await response.json();
      alert(result.message);
      fetchPayments();
      return true;

    } catch (err: any) {
      console.error("Failed to confirm payment:", err);
      alert(`Error: ${err.message}`);
      return false;
    }
  };

  const checkLivePaymentStatus = async (orderCode: number): Promise<string | null> => {
    try {
        const token = getToken();
        if (!token) throw new Error("Authorization token not found.");

        const params = new URLSearchParams({ orderCode: orderCode.toString() });
        const urlWithParams = `${API_BASE_URL}/Payment/check-payment-status?${params.toString()}`; // Thêm /Payment

        const response = await fetch(urlWithParams, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to check status: ${response.status}`);
        }

        const data = await response.json();
        return data.status;
    } catch (err: any) {
        console.error("Failed to check payment status:", err);
        alert(`Error checking status: ${err.message}`);
        return null;
    }
  };

  return (
    <PaymentContext.Provider value={{ payments, isLoading, error, fetchPayments, confirmPremiumPayment, checkLivePaymentStatus, cancelPayment }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};