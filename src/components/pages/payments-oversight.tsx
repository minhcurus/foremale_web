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
import { Eye, AlertCircle, RefreshCw, Loader2 } from "lucide-react"
import { PaymentDetailModal } from "../payments/payment-detail-modal"
import { Payment } from "@/types"

// Hàm ánh xạ trạng thái từ số sang chuỗi
const mapStatusNumberToString = (statusNumber: number): string => {
    switch (statusNumber) {
        case 0: return "Pending";
        case 1: return "Completed";
        // Thêm các trạng thái khác nếu có
        default: return "Unknown";
    }
};

export function PaymentsOversight() {
  const { payments, isLoading, error, confirmPremiumPayment, checkLivePaymentStatus } = usePayment();
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State để quản lý trạng thái loading của từng dòng
  const [loadingStates, setLoadingStates] = useState<{ [orderCode: number]: { checking?: boolean; confirming?: boolean } }>({});

  // Chỉ hiển thị các giao dịch là gói Premium
  const premiumPayments = useMemo(() => {
    return payments.filter(p => p.premiumPackageId !== null);
  }, [payments]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  }

  // HÀM MỚI: Xử lý việc kiểm tra trạng thái trực tiếp
  const handleCheckStatus = async (orderCode: number) => {
    setLoadingStates(prev => ({ ...prev, [orderCode]: { ...prev[orderCode], checking: true } }));
    const liveStatus = await checkLivePaymentStatus(orderCode);
    if (liveStatus) {
      alert(`Live Status for Order #${orderCode}: ${liveStatus}`);
    }
    setLoadingStates(prev => ({ ...prev, [orderCode]: { ...prev[orderCode], checking: false } }));
  };

  // HÀM MỚI: Xử lý việc xác nhận thanh toán
  const handleConfirmPayment = async (orderCode: number) => {
    setLoadingStates(prev => ({ ...prev, [orderCode]: { ...prev[orderCode], confirming: true } }));
    await confirmPremiumPayment(orderCode);
    setLoadingStates(prev => ({ ...prev, [orderCode]: { ...prev[orderCode], confirming: false } }));
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {premiumPayments.length > 0 ? (
                premiumPayments.map((payment) => {
                  const statusString = mapStatusNumberToString(payment.status);
                  const { checking, confirming } = loadingStates[payment.orderCode] || {};

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
                        <div className="flex items-center space-x-2">
                          {/* Nút xác nhận chỉ hiển thị cho trạng thái "Pending" (status = 0) */}
                          {payment.status === 0 && (
                            <Button onClick={() => handleConfirmPayment(payment.orderCode)} disabled={confirming} size="sm">
                              {confirming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Confirm
                            </Button>
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
                  <TableCell colSpan={5} className="h-24 text-center">No premium payments found.</TableCell>
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