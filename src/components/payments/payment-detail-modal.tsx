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
      case 2: return "Processing";
      case 3: return "Failed";
      default: return "Unknown";
    }
};

// Hàm định dạng ngày giờ
const formatDateTime = (dateString: string | null) => {
    if (!dateString || dateString.startsWith("0001-")) return "N/A";
    return new Date(dateString).toLocaleString('vi-VN');
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
        
        {/* XÓA BỎ: Nút đóng 'X' thừa đã được loại bỏ. 
            <DialogContent> đã có sẵn một nút đóng mặc định. 
        */}

      </DialogContent>
    </Dialog>
  )
}