export interface User {
  userId: number
  fullName: string
  email: string
  userName: string
  phoneNumber: string
  address: string
  role: string
  premiumPackageId: number
  status: boolean
  dateOfBirth: string
  imageUser: string | null
  imageBackground: string | null
  description: string | null
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
  userId: number
  amount: number
  description: string
  returnUrl: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  buyerAddress: string
  method: number
  orderId: string | null
  transactionId: string | null
  orderCode: number
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