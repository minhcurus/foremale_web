export interface User {
  id: number
  name: string
  email: string
  status: "Active" | "Inactive"
  joinDate: string
  orders: number
}

export interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: "Active" | "Out of Stock"
}

export interface Payment {
  id: number
  orderId: string
  user: string
  amount: number
  status: "Pending" | "Completed" | "Failed" | "Processing"
  method: string
  date: string
}

export interface Order {
  id: string
  user: string
  products: number
  total: number
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled"
  date: string
}

export type TabType = "overview" | "users" | "products" | "payments" | "orders" | "settings"
