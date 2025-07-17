export interface User {
  userId: number;
  fullName: string;
  email: string;
  userName: string;
  phoneNumber: string;
  address: string;
  role?: string; // Thêm ? vì API GET all không có trường này
  premiumPackageId: number | null; // Sửa lại từ API response
  status: string; // SỬA: Đổi từ boolean sang string
  isActive: string; // THÊM: Thêm trường isActive
  dateOfBirth: string;
  imageUser: string | null;
  imageBackground: string | null;
  description: string | null;
  loginProvider?: string; // Thêm ? vì không phải lúc nào cũng có
  premiumExpiryDate?: string; // Thêm ? vì không phải lúc nào cũng có
}

export interface Product {
  productId: string
  name: string
  price: number
  brand: string
  color: string
  imageURL: string
  description: string
  style: string
  category: string
  material: string
  type: string
}

export interface Payment {
  id: number;
  userId: number;
  orderId: number;
  premiumPackageId: number | null;
  status: number; // 0: Pending, 1: Completed, 2: Processing, 3: Cancelled/Failed
  method: number;
  orderCode: number;
  transactionId: string;
  amount: number;
  description: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  cancelUrl: string;
  returnUrl: string;
  checkoutUrl: string;
  cancelReason: string | null;
  signature: string;
  paidAt: string | null;
  cancelledAt: string | null;
  createAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  imageURL: string;
  description: string;
  price: number;
}

// Cập nhật lại interface Order cho chính xác
export interface Order {
  orderId: number;
  userId: number;
  totalPrice: number;
  status: number; // 0: Processing, 1: Shipped, 2: Delivered, 3: Cancelled
  createdAt: string;
  items: OrderItem[];
}

export interface TodayVisit {
  date: string;
  totalVisits: number;
}

export interface DailyVisit {
  date: string;
  visitCount: number;
}


export type TabType = "overview" | "users" | "products" | "payments" | "orders" | "feedbacks" | "settings"