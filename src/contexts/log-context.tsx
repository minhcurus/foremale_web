// contexts/log-context.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { DailyVisit, TodayVisit } from "@/types"; // Import các interface mới
import { useAuth } from "./auth-context";

interface LogContextType {
  todayVisits: TodayVisit | null;
  dailyVisits: DailyVisit[];
  isLoading: boolean;
  error: string | null;
  fetchLogData: () => Promise<void>;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoading: authLoading, user } = useAuth();
  const [todayVisits, setTodayVisits] = useState<TodayVisit | null>(null);
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchLogData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Authorization token not available.");
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true); // Bật loading trước khi fetch
    try {
      // Fetch Today's Visits
      const todayResponse = await fetch(`/api/Log/today`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!todayResponse.ok) {
        throw new Error(`Failed to fetch today's visits: ${todayResponse.status} ${todayResponse.statusText}`);
      }
      const todayData: TodayVisit = await todayResponse.json();
      setTodayVisits(todayData);

      // Fetch All Daily Visits
      const allResponse = await fetch(`/api/Log/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!allResponse.ok) {
        throw new Error(`Failed to fetch all daily visits: ${allResponse.status} ${allResponse.statusText}`);
      }
      const allData: { success: boolean; totalVisits: number; visitDays: DailyVisit[] } = await allResponse.json();
      
      // Sắp xếp dữ liệu ngày truy cập theo thứ tự tăng dần của ngày để biểu đồ hiển thị đúng
      const sortedVisitDays = allData.visitDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setDailyVisits(sortedVisitDays);

    } catch (err: any) {
      setError(err.message || "Failed to fetch log data.");
      console.error("Log Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchLogData();
    } else if (!authLoading && !user) {
      setIsLoading(false);
      setError("User not authenticated for log data.");
    }
  }, [authLoading, user, fetchLogData]);

  return (
    <LogContext.Provider value={{ todayVisits, dailyVisits, isLoading, error, fetchLogData }}>
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