
"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { ReactNode } from "react"

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

interface PaymentContextType {
  payments: Payment[]
  isLoading: boolean
  error: string | null
  fetchPayments: () => Promise<void>
  updatePaymentStatus: (transactionId: string, newStatus: string) => Promise<boolean>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getToken, isLoading: authLoading, user } = useAuth()

  const fetchPayments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No authentication token available. Please log in.")
      }

      console.log("Fetching payments with token:", token); // Debug token
      const response = await fetch("/api/Payment/getpayment", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("API response status:", response.status); // Debug response
      if (!response.ok) {
        if (response.status === 204) {
          throw new Error("No payment data returned from the server. Please check the API endpoint.")
        } else if (response.status === 404) {
          throw new Error("Payment API endpoint not found. Please verify the API base URL.")
        } else if (response.status === 401) {
          throw new Error("Unauthorized request. Please check your authentication token.")
        }
        throw new Error(`Failed to fetch payments: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("API response data:", data); // Debug data
      if (!Array.isArray(data)) {
        throw new Error("Invalid payment data format received from the server.")
      }
      setPayments(data)
    } catch (err) {
      const errorMessage =
        err instanceof TypeError && err.message.includes("NetworkError")
          ? "Network error: Unable to reach the payment API. Please ensure the API server is accessible and configured correctly."
          : err instanceof Error
          ? err.message
          : "An unexpected error occurred while fetching payments."
      setError(errorMessage)
      console.error("Error fetching payments:", err)
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  const updatePaymentStatus = async (transactionId: string, newStatus: string): Promise<boolean> => {
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No authentication token available. Please log in.")
      }

      const response = await fetch(`/api/Payment/update-status/${transactionId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update payment status: ${response.status} ${response.statusText}`)
      }

      setPayments((prevPayments) =>
        prevPayments.map((payment) =>
          (payment.transactionId || payment.orderCode.toString()) === transactionId
            ? { ...payment, status: newStatus }
            : payment
        )
      )
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while updating payment status."
      setError(errorMessage)
      console.error("Error updating payment status:", err)
      return false
    }
  }

  useEffect(() => {
    if (!authLoading && user && getToken()) {
      fetchPayments()
    } else if (!authLoading) {
      setIsLoading(false)
      setError("Authentication required to fetch payments.")
    }
  }, [authLoading, user, getToken, fetchPayments])

  return (
    <PaymentContext.Provider value={{ payments, isLoading, error, fetchPayments, updatePaymentStatus }}>
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider")
  }
  return context
}