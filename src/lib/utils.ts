import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusBadge = (status: string, type: "user" | "product" | "payment" | "order") => {
  const variants = {
    user: {
      Active: "default",
      Inactive: "secondary",
    },
    product: {
      Active: "default",
      "Out of Stock": "destructive",
    },
    payment: {
      Completed: "default",
      Pending: "secondary",
      Processing: "outline",
      Failed: "destructive",
    },
    order: {
      Delivered: "default",
      Shipped: "secondary",
      Processing: "outline",
      Cancelled: "destructive",
    },
  }

  return variants[type][status] as any
}
