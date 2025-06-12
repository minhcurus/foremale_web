"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { payments } from "@/lib/mock-data"
import { getStatusBadge } from "@/lib/utils"
import { Eye } from "lucide-react"

export function PaymentsOversight() {
  const [paymentStatuses, setPaymentStatuses] = useState(
    payments.reduce((acc, payment) => ({ ...acc, [payment.id]: payment.status }), {}),
  )

  const updatePaymentStatus = (paymentId: number, newStatus: string) => {
    setPaymentStatuses((prev) => ({ ...prev, [paymentId]: newStatus }))
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
              <TableHead>Order ID</TableHead>
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
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.orderId}</TableCell>
                <TableCell>{payment.user}</TableCell>
                <TableCell>${payment.amount}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>{getStatusBadge(paymentStatuses[payment.id], "payment")}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={paymentStatuses[payment.id]}
                      onValueChange={(value) => updatePaymentStatus(payment.id, value)}
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
