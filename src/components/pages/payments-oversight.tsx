"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePayment } from "@/contexts/payment-context";
import { getStatusBadge } from "@/lib/utils";
import { Eye, AlertCircle } from "lucide-react";

export function PaymentsOversight() {
  const { payments, isLoading, error, updatePaymentStatus } = usePayment();

  // Helper function to format amount consistently
  const formatAmount = (amount: number) => {
    if (typeof window === 'undefined') {
      // Server-side: Use a fixed format to avoid locale mismatches
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VND';
    }
    // Client-side: Use locale formatting
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Oversight</CardTitle>
        <CardDescription>
          Monitor and manage payment transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {payments.length === 0 && !error ? (
          <div className="text-center py-4">No payments found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Code</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.transactionId || payment.orderCode}>
                  <TableCell className="font-medium">
                    {payment.orderCode}
                  </TableCell>
                  <TableCell>{payment.buyerName || "Unknown"}</TableCell>
                  <TableCell>{formatAmount(payment.amount)}</TableCell>
                  <TableCell>
                    {payment.method === 0
                      ? "Unknown"
                      : payment.method === 2
                      ? "Online Payment"
                      : `Method ${payment.method}`}
                  </TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status || "Pending", "payment")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={payment.status || "Pending"}
                        onValueChange={(value) =>
                          updatePaymentStatus(
                            payment.transactionId ||
                              payment.orderCode.toString(),
                            value
                          )
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}