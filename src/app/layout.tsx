import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { UserProvider } from "@/contexts/user-context"
import { ProductProvider } from "@/contexts/product-context"
import { PaymentProvider } from "@/contexts/payment-context"
import { OrderProvider } from "@/contexts/order-context"
import { LogProvider } from "@/contexts/log-context"
import { FeedbackProvider } from "@/contexts/feedback-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Admin Login",
  description: "User and product management dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <UserProvider>
              <PaymentProvider>
              <ProductProvider>
                <OrderProvider>
                  <FeedbackProvider>
                  <LogProvider>
              {children}
              </LogProvider>
              </FeedbackProvider>
              </OrderProvider>
              </ProductProvider>
              </PaymentProvider>
            </UserProvider>
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}