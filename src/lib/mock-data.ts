import type { User, Product, Payment, Order } from "@/types"

export const users: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "Active", joinDate: "2024-01-15", orders: 12 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Active", joinDate: "2024-02-20", orders: 8 },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "Inactive", joinDate: "2024-01-10", orders: 3 },
  { id: 4, name: "Alice Brown", email: "alice@example.com", status: "Active", joinDate: "2024-03-05", orders: 15 },
]

export const products: Product[] = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: 99.99, stock: 45, status: "Active" },
  { id: 2, name: "Smart Watch", category: "Electronics", price: 199.99, stock: 23, status: "Active" },
  { id: 3, name: "Coffee Maker", category: "Appliances", price: 79.99, stock: 12, status: "Active" },
  { id: 4, name: "Desk Lamp", category: "Furniture", price: 39.99, stock: 0, status: "Out of Stock" },
]

export const payments: Payment[] = [
  {
    id: 1,
    orderId: "ORD-001",
    user: "John Doe",
    amount: 299.97,
    status: "Pending",
    method: "Credit Card",
    date: "2024-12-10",
  },
  {
    id: 2,
    orderId: "ORD-002",
    user: "Jane Smith",
    amount: 199.99,
    status: "Completed",
    method: "PayPal",
    date: "2024-12-09",
  },
  {
    id: 3,
    orderId: "ORD-003",
    user: "Bob Johnson",
    amount: 79.99,
    status: "Failed",
    method: "Credit Card",
    date: "2024-12-08",
  },
  {
    id: 4,
    orderId: "ORD-004",
    user: "Alice Brown",
    amount: 159.98,
    status: "Processing",
    method: "Bank Transfer",
    date: "2024-12-07",
  },
]

export const orders: Order[] = [
  { id: "ORD-001", user: "John Doe", products: 3, total: 299.97, status: "Shipped", date: "2024-12-10" },
  { id: "ORD-002", user: "Jane Smith", products: 1, total: 199.99, status: "Delivered", date: "2024-12-09" },
  { id: "ORD-003", user: "Bob Johnson", products: 1, total: 79.99, status: "Cancelled", date: "2024-12-08" },
  { id: "ORD-004", user: "Alice Brown", products: 2, total: 159.98, status: "Processing", date: "2024-12-07" },
]
