// orders-management.tsx
"use client"

import { useOrder } from "@/contexts/order-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { mapOrderStatus } from "@/lib/utils"
import { MoreHorizontal, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function OrdersManagement() {
  const { orders, isLoading, error } = useOrder();

  if (isLoading) {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  // SẮP XẾP ĐƠN HÀNG THEO NGÀY TẠO (MỚI NHẤT ĐẾN CŨ NHẤT)
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
        <CardDescription>Monitor and manage customer clothing orders</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.length > 0 ? ( // SỬ DỤNG sortedOrders ở đây
                sortedOrders.map((order) => {
                    const statusInfo = mapOrderStatus(order.status);
                    const totalProducts = order.items.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                        <TableRow key={order.orderId}>
                        <TableCell className="font-medium">{order.orderId}</TableCell>
                        <TableCell>User #{order.userId}</TableCell>
                        <TableCell>{totalProducts}</TableCell>
                        <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</TableCell>
                        <TableCell>
                            <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Update Status
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel Order
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    );
                })
            ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No orders found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}