"use client"

import { Button } from "@/components/ui/button"
import type { TabType } from "@/types"
import { Home, CreditCard, Package, ShoppingCart, Users, Settings } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface SidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  isOpen: boolean
}

export function Sidebar({ activeTab, setActiveTab, isOpen }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Sync activeTab with the 'tab' query parameter on mount or change
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabType | null
    if (tabFromUrl && tabFromUrl !== activeTab && isValidTab(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams, setActiveTab])

  // Validate tab to ensure it's a valid TabType
  const isValidTab = (tab: string): tab is TabType => {
    return ["overview", "users", "products", "payments", "orders", "settings"].includes(tab)
  }

  // Handle tab click and update URL with query parameter
  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab)
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set("tab", tab)
    router.push(`/?${newSearchParams.toString()}`)
  }

  const menuItems = [
    { id: "overview" as TabType, label: "Overview", icon: Home },
    { id: "users" as TabType, label: "Users", icon: Users },
    { id: "products" as TabType, label: "Products", icon: Package },
    { id: "payments" as TabType, label: "Payments", icon: CreditCard },
    { id: "orders" as TabType, label: "Orders", icon: ShoppingCart },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ]

  return (
    <div className={`bg-white w-64 min-h-screen shadow-lg ${isOpen ? "block" : "hidden"} lg:block`}>
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTabClick(item.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}