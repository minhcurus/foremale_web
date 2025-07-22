"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { DailyVisit, TodayVisit } from "@/types";
import { useAuth } from "./auth-context";

// Interface cho dữ liệu đăng ký hàng tháng
interface MonthlyRegistrations {
  success: boolean;
  month: number;
  totalRegistrations: number;
}

// Cập nhật Context Type để bao gồm các hàm fetch riêng lẻ
interface LogContextType {
  todayVisits: TodayVisit | null;
  dailyVisits: DailyVisit[];
  monthlyRegistrations: MonthlyRegistrations | null;
  isLoading: boolean;
  error: string | null;
  // Cung cấp hàm fetch tổng và các hàm riêng lẻ để linh hoạt
  fetchAllLogData: () => Promise<void>;
  fetchTodayVisits: () => Promise<void>;
  fetchDailyVisits: () => Promise<void>;
  fetchMonthlyRegistrations: () => Promise<void>;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoading: authLoading, user } = useAuth();
  const [todayVisits, setTodayVisits] = useState<TodayVisit | null>(null);
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([]);
  const [monthlyRegistrations, setMonthlyRegistrations] = useState<MonthlyRegistrations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- CÁC HÀM FETCH RIÊNG LẺ ---

  // Lấy dữ liệu lượt truy cập hôm nay
  const fetchTodayVisits = useCallback(async () => {
    const token = getToken();
    if (!token) throw new Error("Authorization token not available.");
    
    const response = await fetch(`/api/Log/today`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch today's visits: ${response.statusText}`);
    const data: TodayVisit = await response.json();
    setTodayVisits(data);
  }, [getToken]);

  // Lấy lịch sử truy cập theo ngày
  const fetchDailyVisits = useCallback(async () => {
    const token = getToken();
    if (!token) throw new Error("Authorization token not available.");

    const response = await fetch(`/api/Log/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch all daily visits: ${response.statusText}`);
    const data: { success: boolean; totalVisits: number; visitDays: DailyVisit[] } = await response.json();
    const sortedVisitDays = data.visitDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setDailyVisits(sortedVisitDays);
  }, [getToken]);

  // Lấy số lượng đăng ký mới trong tháng
  const fetchMonthlyRegistrations = useCallback(async () => {
    const token = getToken();
    if (!token) throw new Error("Authorization token not available.");
    
    const response = await fetch(`/api/Log/get-newUser-this-month`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch monthly registrations: ${response.statusText}`);
    const data: MonthlyRegistrations = await response.json();
    setMonthlyRegistrations(data);
  }, [getToken]);

  // --- HÀM ĐIỀU PHỐI ---

  // Gọi tất cả các hàm fetch dữ liệu log song song
  const fetchAllLogData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Authorization token not available.");
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      // Chạy tất cả các hàm fetch riêng lẻ cùng lúc
      await Promise.all([
        fetchTodayVisits(),
        fetchDailyVisits(),
        fetchMonthlyRegistrations()
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch log data.");
      console.error("Log Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, fetchTodayVisits, fetchDailyVisits, fetchMonthlyRegistrations]);

  // --- EFFECT HOOK ---

  // Kích hoạt hàm điều phối khi người dùng được xác thực
  useEffect(() => {
    if (!authLoading && user) {
      fetchAllLogData();
    } else if (!authLoading && !user) {
      setIsLoading(false);
      setError("User not authenticated for log data.");
    }
  }, [authLoading, user, fetchAllLogData]);

  return (
    <LogContext.Provider value={{ 
      todayVisits, 
      dailyVisits, 
      monthlyRegistrations, 
      isLoading, 
      error, 
      // Cung cấp tất cả các hàm qua context
      fetchAllLogData,
      fetchTodayVisits,
      fetchDailyVisits,
      fetchMonthlyRegistrations
    }}>
      {children}
    </LogContext.Provider>
  );
}

export const useLog = () => {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error("useLog must be used within a LogProvider");
  }
  return context;
};