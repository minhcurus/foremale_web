"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/auth-context"
import { getStatusBadge } from "@/lib/utils"
import { Eye } from "lucide-react"

interface Payment {
  userId: number
  amount: number
  description: string
  returnUrl: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  buyerAddress: string
  method: number
  orderId: string | null
  transactionId: string | null
  orderCode: number
}

export function PaymentsOversight() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getToken } = useAuth()

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = getToken()
        const response = await fetch("https://spss.io.vn/api/Payment/getpayment", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) throw new Error("Failed to fetch payments")
        const data = await response.json()
        setPayments(data)
      } catch (error) {
        console.error("Error fetching payments:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPayments()
  }, [getToken])

  const updatePaymentStatus = async (transactionId: string, newStatus: string) => {
    // Implement API call to update payment status if available
    console.log(`Update payment ${transactionId} to ${newStatus}`)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Oversight</CardTitle>
        <CardDescription>Monitor and manage payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Code</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.transactionId || payment.orderCode}>
                <TableCell className="font-medium">{payment.orderCode}</TableCell>
                <TableCell>{payment.buyerName}</TableCell>
                <TableCell>${(payment.amount / 1000).toFixed(2)}</TableCell>
                <TableCell>{payment.method === 0 ? "Unknown" : `Method ${payment.method}`}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>{getStatusBadge("Pending", "payment")}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Select
                      value="Pending"
                      onValueChange={(value) => updatePaymentStatus(payment.transactionId || payment.orderCode.toString(), value)}
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
      </CardContent>
    </Card>
  )
}