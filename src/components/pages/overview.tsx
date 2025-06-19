"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProduct } from "@/contexts/product-context";
import { usePayment } from "@/contexts/payment-context";
import { useUser } from "@/contexts/user-context";
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryLegend, VictoryBar } from "victory";
import { Package, ShoppingCart } from "lucide-react";
import { orders } from "@/lib/mock-data";

export function Overview() {
  const { products, loading: productLoading, error: productError } = useProduct();
  const { payments, isLoading: paymentLoading, error: paymentError } = usePayment();
  const { users, loading: userLoading, error: userError } = useUser();

  // Calculate total revenue from payments
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate age from dateOfBirth
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date(2025, 5, 19); // June 19, 2025
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Group users by age category
  const ageGroups = [
    { label: "<20", min: 0, max: 19 },
    { label: "20-29", min: 20, max: 29 },
    { label: "30-39", min: 30, max: 39 },
    { label: "40-49", min: 40, max: 49 },
    { label: "50+", min: 50, max: Infinity },
  ];

  const userAgeData = users.reduce((acc, user) => {
    if (!user.dateOfBirth) return acc;
    const age = calculateAge(user.dateOfBirth);
    const group = ageGroups.find(g => age >= g.min && age <= g.max)?.label || "Unknown";
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for multi-line chart
  const lineData = ageGroups.map(group => ({
    name: group.label,
    data: [{ x: group.label, y: userAgeData[group.label] || 0 }],
  }));

  // Prepare data for Revenue chart
  const revenueChartData = payments.reduce((acc, payment) => {
    const status = payment.status || "Pending";
    acc[status] = (acc[status] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>);
  const revenueData = Object.entries(revenueChartData).map(([status, amount]) => ({
    status,
    amount,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Users Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          {userLoading ? (
            <div>Loading users...</div>
          ) : userError ? (
            <div className="text-red-600 text-xs">Error: {userError}</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{users.length}</div>
              <VictoryChart theme={VictoryTheme.material} height={200}>
                <VictoryAxis
                  tickFormat={(group) => group}
                  style={{ tickLabels: { fontSize: 8, angle: 45 } }}
                />
                <VictoryAxis dependentAxis tickFormat={(count) => Math.round(count)} />
                {lineData.map((line, index) => (
                  <VictoryLine
                    key={line.name}
                    data={line.data}
                    x="x"
                    y="y"
                    style={{
                      data: { stroke: `hsl(${index * 60}, 70%, 50%)` },
                    }}
                  />
                ))}
                <VictoryLegend
                  x={50}
                  y={10}
                  orientation="horizontal"
                  gutter={20}
                  style={{ labels: { fontSize: 8 } }}
                  data={lineData.map(line => ({
                    name: line.name,
                    symbol: { fill: `hsl(${lineData.indexOf(line) * 60}, 70%, 50%)` },
                  }))}
                />
              </VictoryChart>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Products Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {productLoading ? (
            <div>Loading products...</div>
          ) : productError ? (
            <div className="text-red-600 text-xs">Error: {productError}</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">+1 from last week</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Orders Card (Hardcoded) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.length}</div>
          <p className="text-xs text-muted-foreground">+3 from yesterday</p>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentLoading ? (
            <div>Loading payments...</div>
          ) : paymentError ? (
            <div className="text-red-600 text-xs">Error: {paymentError}</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString('vi-VN')} VND</div>
              <VictoryChart theme={VictoryTheme.material} height={200}>
                <VictoryAxis
                  tickFormat={(status) => status}
                  style={{ tickLabels: { fontSize: 8, angle: 45 } }}
                />
                <VictoryAxis dependentAxis tickFormat={(amount) => `${(amount / 1000).toFixed(0)}K`} />
                <VictoryBar
                  data={revenueData}
                  x="status"
                  y="amount"
                  style={{ data: { fill: "#16a34a" } }}
                />
              </VictoryChart>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}