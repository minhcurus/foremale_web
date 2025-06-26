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
export const mapOrderStatus = (status: number) => {
  switch (status) {
    case 0:
      return { text: "Processing", variant: "outline" as const };
    case 1:
      // Giả định status 1 là 'Completed' hoặc 'Delivered'
      return { text: "Completed", variant: "success" as const };
    case 2:
       // Giả định status 2 là 'Shipped'
       return { text: "Shipped", variant: "secondary" as const };
    case 3:
      return { text: "Cancelled", variant: "destructive" as const };
    default:
      return { text: "Unknown", variant: "default" as const };
  }
};
