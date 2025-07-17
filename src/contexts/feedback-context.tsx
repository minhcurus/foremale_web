'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './auth-context'; // Import useAuth để lấy token và trạng thái đăng nhập

// Định nghĩa kiểu dữ liệu cho một feedback
interface Feedback {
  feedbackId: string;
  description: string | null;
  rating: number;
  userId: number;
  userName: string;
  productName: string;
  imageURL: string | null;
}

// Định nghĩa kiểu dữ liệu cho context
interface FeedbackContextType {
  feedbacks: Feedback[];
  loading: boolean;
  error: string | null;
  fetchFeedbacks: () => Promise<void>;
  deleteFeedback: (feedbackId: string) => Promise<void>;
}

// Tạo Context
const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// Tạo Provider
export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const { getToken, isLoading: authLoading, user } = useAuth(); // Sử dụng AuthContext
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = '/api/Feedback'; // Đặt base URL cho Feedback API

  const fetchFeedbacks = useCallback(async () => {
    const token = getToken();
    if (!token) {
      // Không cần set lỗi ở đây vì useEffect sẽ xử lý
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const response = await fetch(`${API_URL}/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch feedbacks: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch feedbacks.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const deleteFeedback = async (feedbackId: string) => {
    const token = getToken();
    if (!token) {
      setError("Authorization token not available.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${feedbackId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
          throw new Error('Failed to delete the feedback.');
      }
      // Cập nhật lại state để UI thay đổi ngay lập tức mà không cần gọi lại API
      setFeedbacks(prev => prev.filter(f => f.feedbackId !== feedbackId));
    } catch (err: any) {
      // Có thể hiển thị một thông báo lỗi cụ thể hơn cho người dùng
      console.error("Delete feedback error:", err);
      setError(err.message || 'An error occurred while deleting feedback.');
    }
  };

  // Đồng bộ với AuthContext, chỉ fetch dữ liệu khi đã đăng nhập
  useEffect(() => {
    if (!authLoading && user) {
      setLoading(true); // Đặt loading trước khi gọi API
      fetchFeedbacks();
    } else if (!authLoading && !user) {
      setLoading(false);
      setFeedbacks([]); // Xóa dữ liệu cũ nếu không còn đăng nhập
      setError("User not authenticated.");
    }
  }, [authLoading, user, fetchFeedbacks]);

  return (
    <FeedbackContext.Provider value={{ feedbacks, loading, error, fetchFeedbacks, deleteFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};

// Tạo hook để sử dụng context dễ dàng hơn
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};