// orders-management.tsx
"use client"

import { useState } from "react" // THÊM: useState
import { useOrder } from "@/contexts/order-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { mapOrderStatus } from "@/lib/utils"
import { MoreHorizontal, Eye, Trash2, Loader2 } from "lucide-react" // BỎ Edit
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { OrderDetailModal } from "@/components/orders/order-detail-modal"; // THÊM: Import modal mới
import { Order } from "@/types"; // THÊM: Import Order type

export function OrdersManagement() {
  const { orders, isLoading, error, fetchOrderDetails } = useOrder(); // THÊM: fetchOrderDetails

  // State để quản lý modal chi tiết đơn hàng
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false); // State loading cho việc fetch chi tiết

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

  // Hàm định dạng ngày giờ cho múi giờ Việt Nam
  const formatDateTimeVN = (dateString: string | null) => {
    if (!dateString || dateString.startsWith("0001-")) return "N/A";
    const date = new Date(dateString); // Backend đã trả về đúng múi giờ, không cần thêm 'Z'
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Sử dụng định dạng 24h
        timeZone: 'Asia/Ho_Chi_Minh' // Đảm bảo hiển thị đúng múi giờ Việt Nam
    });
  };

  // Hàm xử lý khi bấm "View Details"
  const handleViewDetails = async (orderId: number) => {
    setIsFetchingDetails(true); // Bắt đầu loading
    const orderDetails = await fetchOrderDetails(orderId);
    if (orderDetails) {
      setSelectedOrder(orderDetails);
      setIsDetailModalOpen(true);
    }
    setIsFetchingDetails(false); // Kết thúc loading
  };

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
            {sortedOrders.length > 0 ? (
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
                        {/* HIỂN THỊ THỜI GIAN THEO MÚI GIỜ VIỆT NAM CHI TIẾT */}
                        <TableCell>{formatDateTimeVN(order.createdAt)}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isFetchingDetails}> {/* Vô hiệu hóa khi đang fetch chi tiết */}
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(order.orderId)}>
                                {/* Hiển thị spinner nếu đang fetch chi tiết */}
                                {isFetchingDetails ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                                View Details
                                </DropdownMenuItem>
                                {/* XÓA BỎ: Nút Update Status */}
                                {/* <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Update Status
                                </DropdownMenuItem> */}
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

      {/* THÊM: Modal chi tiết đơn hàng */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </Card>
  )
}