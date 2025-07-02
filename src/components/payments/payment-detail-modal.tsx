// payment-detail-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getStatusBadge } from "@/lib/utils";
import { Payment } from "@/types";

// Hàm ánh xạ trạng thái từ số sang chuỗi
const mapStatusNumberToString = (statusNumber: number): string => {
    switch (statusNumber) {
      case 0: return "Pending";
      case 1: return "Completed";
      case 2: return "Failed";
      case 3: return "Cancelled";
      default: return "Unknown";
    }
};

// ĐÃ CẬP NHẬT: Hàm định dạng ngày giờ - loại bỏ timeZone vì backend đã chuẩn hóa
const formatDateTime = (dateString: string | null) => {
    if (!dateString || dateString.startsWith("0001-")) return "N/A";
    // Backend đã cung cấp thời gian đúng múi giờ VN, chỉ cần định dạng hiển thị.
    // Loại bỏ logic thêm 'Z' và 'timeZone' trong toLocaleString.
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Sử dụng định dạng 24h
    });
};

interface PaymentDetailModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentDetailModal({ payment, isOpen, onClose }: PaymentDetailModalProps) {
  if (!payment) return null;

  const statusString = mapStatusNumberToString(payment.status as number);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Chi tiết giao dịch #{payment.orderCode}</DialogTitle>
          <DialogDescription>
            Transaction ID: {payment.transactionId || "N/A"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-4">
          {/* Nhóm thông tin giao dịch */}
          <div className="space-y-3">
             <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="font-medium text-muted-foreground">Trạng thái</dt>
                <dd className="text-right">
                    <Badge variant={getStatusBadge(statusString, "payment")}>
                        {statusString}
                    </Badge>
                </dd>

                <dt className="font-medium text-muted-foreground">Số tiền</dt>
                <dd className="text-right font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}</dd>

                <dt className="font-medium text-muted-foreground self-start">Nội dung</dt>
                <dd className="text-right break-words">{payment.description}</dd>
             </dl>
          </div>

          <hr/>

          {/* Nhóm thông tin người mua */}
          <div className="space-y-3">
             <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="font-medium text-muted-foreground">Tên người mua</dt>
                <dd className="text-right break-words">{payment.buyerName}</dd>
                
                <dt className="font-medium text-muted-foreground">Email</dt>
                <dd className="text-right break-words">{payment.buyerEmail}</dd>

                <dt className="font-medium text-muted-foreground">Số điện thoại</dt>
                <dd className="text-right break-words">{payment.buyerPhone}</dd>
             </dl>
          </div>

          <hr/>

           {/* Nhóm thông tin thời gian */}
           <div className="space-y-3">
             <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="font-medium text-muted-foreground">Ngày tạo</dt>
                <dd className="text-right">{formatDateTime(payment.createAt)}</dd>
                
                <dt className="font-medium text-muted-foreground">Ngày thanh toán</dt>
                <dd className="text-right">{formatDateTime(payment.paidAt)}</dd>

                <dt className="font-medium text-muted-foreground">Ngày hủy</dt>
                <dd className="text-right">{formatDateTime(payment.cancelledAt)}</dd>
             </dl>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}