// payments-oversight.tsx
"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { usePayment } from "@/contexts/payment-context"
import { getStatusBadge } from "@/lib/utils"
import { Eye, AlertCircle, RefreshCw, Loader2, XCircle } from "lucide-react" // THÊM: XCircle icon
import { PaymentDetailModal } from "../payments/payment-detail-modal"
import { Payment } from "@/types"

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

export function PaymentsOversight() {
  const { payments, isLoading, error, confirmPremiumPayment, checkLivePaymentStatus, cancelPayment } = usePayment(); // THÊM: cancelPayment
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Cập nhật loadingStates để bao gồm trạng thái hủy
  const [loadingStates, setLoadingStates] = useState<{ [orderCode: number]: { checking?: boolean; confirming?: boolean; cancelling?: boolean } }>({});

  const premiumPayments = useMemo(() => {
    return [...payments]
      .filter(p => p.premiumPackageId !== null)
      .sort((a, b) => {
        return new Date(b.createAt).getTime() - new Date(a.createAt).getTime();
      });
  }, [payments]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  }

  const handleCheckStatus = async (orderCode: number) => {
    setLoadingStates(prev => ({ ...prev, [orderCode]: { ...prev[orderCode], checking: true } }));
    const liveStatus = await checkLivePaymentStatus(orderCode);
    if (liveStatus) {
      alert(`Live Status for Order #${orderCode}: ${liveStatus}`);
    }
    setLoadingStates(prev => ({ ...prev, [orderCode]: { ...prev[orderCode], checking: false } }));
  };

  const handleConfirmPayment = async (orderCode: number) => {
    setLoadingStates(prev => ({ ...prev, [orderCode]: { ...prev[orderCode], confirming: true } }));
    await confirmPremiumPayment(orderCode);
    setLoadingStates(prev => ({ ...prev, [orderCode]: { ...prev[orderCode], confirming: false } }));
  };

  // THÊM: Hàm xử lý hủy thanh toán
  const handleCancelPayment = async (orderCode: number) => {
    // Bạn có thể thêm một hộp thoại xác nhận hoặc input cho lý do hủy ở đây
    const reason = prompt("Vui lòng nhập lý do hủy thanh toán:") || "Hủy bởi quản trị viên";
    if (!reason) { // Nếu người dùng không nhập lý do và bấm cancel
        return;
    }

    setLoadingStates(prev => ({ ...prev, [orderCode]: { ...prev[orderCode], cancelling: true } }));
    await cancelPayment(orderCode, reason);
    setLoadingStates(prev => ({ ...prev, [orderCode]: { ...prev[orderCode], cancelling: false } }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Premium Package Payments</CardTitle>
          <CardDescription>
            Confirm and manage premium package payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Code</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {premiumPayments.length > 0 ? (
                premiumPayments.map((payment) => {
                  const statusString = mapStatusNumberToString(payment.status);
                  const { checking, confirming, cancelling } = loadingStates[payment.orderCode] || {}; // THÊM: cancelling

                  return (
                    <TableRow key={payment.orderCode}>
                      <TableCell className="font-medium">{payment.orderCode}</TableCell>
                      <TableCell>{payment.buyerName}</TableCell>
                      <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                           <Badge variant={getStatusBadge(statusString, "payment")}>{statusString}</Badge>
                           <Button variant="ghost" size="icon" onClick={() => handleCheckStatus(payment.orderCode)} disabled={checking}>
                             {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                           </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.createAt && !payment.createAt.startsWith("0001-") 
                            ? new Date(payment.createAt).toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                              })
                            : "N/A"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {payment.status === 0 && ( // Chỉ hiển thị nút Confirm và Cancel khi trạng thái là Pending (0)
                            <>
                              <Button onClick={() => handleConfirmPayment(payment.orderCode)} disabled={confirming} size="sm">
                                {confirming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Confirm
                              </Button>
                              {/* THÊM: Nút Cancel */}
                              <Button 
                                variant="destructive" // Màu đỏ cho nút hủy
                                onClick={() => handleCancelPayment(payment.orderCode)} 
                                disabled={cancelling} 
                                size="sm"
                              >
                                {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                Cancel
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="icon" onClick={() => handleViewDetails(payment)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">No premium payments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaymentDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payment={selectedPayment}
      />
    </>
  )
}