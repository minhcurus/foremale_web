"use client"

import { useState } from "react"
import type { TabType } from "@/types"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Overview } from "@/components/pages/overview"
import { UsersManagement } from "@/components/pages/users-management"
import { ProductsManagement } from "@/components/pages/products-management"
import { PaymentsOversight } from "@/components/pages/payments-oversight"
import { OrdersManagement } from "@/components/pages/orders-management"
import { Settings } from "@/components/pages/settings"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />
      case "users":
        return <UsersManagement />
      case "products":
        return <ProductsManagement />
      case "payments":
        return <PaymentsOversight />
      case "orders":
        return <OrdersManagement />
      case "settings":
        return <Settings />
      default:
        return <Overview />
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header activeTab={activeTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">{renderContent()}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
