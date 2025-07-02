// components/orders/order-detail-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order, OrderItem } from "@/types";
import { mapOrderStatus } from "@/lib/utils";

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

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const statusInfo = mapOrderStatus(order.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Chi tiết đơn hàng #{order.orderId}</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về đơn hàng này.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-4">
          {/* Thông tin tổng quan đơn hàng */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="font-medium text-muted-foreground">User ID:</div>
            <div>{order.userId}</div>

            <div className="font-medium text-muted-foreground">Tổng tiền:</div>
            <div className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</div>

            <div className="font-medium text-muted-foreground">Trạng thái:</div>
            <div>
              <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
            </div>

            <div className="font-medium text-muted-foreground">Ngày tạo:</div>
            <div>{formatDateTimeVN(order.createdAt)}</div>
          </div>

          <hr className="my-4" />

          {/* Chi tiết sản phẩm */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Sản phẩm trong đơn:</h4>
            {order.items && order.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Ảnh</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>SL</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item: OrderItem, index: number) => (
                    <TableRow key={item.productId || index}> {/* Sử dụng productId hoặc index làm key */}
                      <TableCell>
                        <img src={item.imageURL} alt={item.description} className="w-16 h-16 object-cover rounded-md" />
                      </TableCell>
                      <TableCell className="text-sm">
                         <p className="font-medium">{item.description}</p>
                         {/* Bạn có thể thêm tên sản phẩm nếu có trong OrderItem */}
                         {/* <p className="text-muted-foreground">ID: {item.productId}</p> */}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center">Không có sản phẩm nào trong đơn hàng này.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}