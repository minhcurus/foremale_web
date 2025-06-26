"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProduct } from "@/contexts/product-context";
import { usePayment } from "@/contexts/payment-context";
import { useUser } from "@/contexts/user-context";
import { useOrder } from "@/contexts/order-context"; // BƯỚC 1: Thêm OrderContext
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from "victory";
import { Users, Package, ShoppingCart, DollarSign, Loader2 } from "lucide-react";

export function Overview() {
  const { products, loading: productLoading } = useProduct();
  const { payments, isLoading: paymentLoading } = usePayment();
  const { users, loading: userLoading } = useUser();
  const { orders, isLoading: orderLoading } = useOrder();

  // Hợp nhất các trạng thái loading
  const isLoading = productLoading || paymentLoading || userLoading || orderLoading;

  // BƯỚC 2: Xử lý dữ liệu cho Biểu đồ Người dùng (User Chart)
  const userAgeData = useMemo(() => {
    const ageGroups = [
      { label: "<20", min: 0, max: 19 },
      { label: "20-29", min: 20, max: 29 },
      { label: "30-39", min: 30, max: 39 },
      { label: "40-49", min: 40, max: 49 },
      { label: "50+", min: 50, max: Infinity },
    ];

    const calculateAge = (dob: string): number => {
      const birthDate = new Date(dob);
      const today = new Date("2025-06-26T13:05:27"); // Sử dụng ngày giờ hiện tại được cung cấp
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const groupedData = users.reduce((acc, user) => {
      if (!user.dateOfBirth) return acc;
      const age = calculateAge(user.dateOfBirth);
      const group = ageGroups.find(g => age >= g.min && age <= g.max)?.label || "Unknown";
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return ageGroups.map(group => ({
      ageGroup: group.label,
      count: groupedData[group.label] || 0,
    }));
  }, [users]);

  // BƯỚC 3: Xử lý dữ liệu cho Biểu đồ Doanh thu (Revenue Chart)
  const revenueData = useMemo(() => {
    // Chỉ tính các giao dịch đã hoàn thành (status === 1)
    const completedPayments = payments.filter(p => p.status === 1);

    const revenueByCategory = completedPayments.reduce(
      (acc, payment) => {
        if (payment.premiumPackageId !== null) {
          // Doanh thu từ mua gói
          acc.premium += payment.amount;
        } else {
          // Doanh thu từ mua hàng
          acc.order += payment.amount;
        }
        return acc;
      },
      { premium: 0, order: 0 }
    );

    return [
      { type: "Premium", revenue: revenueByCategory.premium },
      { type: "Orders", revenue: revenueByCategory.order },
    ];
  }, [payments]);

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

  if (isLoading) {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* --- CÁC THẺ THÔNG TIN TỔNG QUAN --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRevenue.toLocaleString('vi-VN')} VND</div>
          <p className="text-xs text-muted-foreground">Tổng doanh thu đã hoàn thành</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.length}</div>
          <p className="text-xs text-muted-foreground">Tổng số người dùng trong hệ thống</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{products.length}</div>
          <p className="text-xs text-muted-foreground">Tổng số sản phẩm đang bán</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.length}</div>
          <p className="text-xs text-muted-foreground">Tổng số đơn hàng đã tạo</p>
        </CardContent>
      </Card>
      
      {/* --- CÁC BIỂU ĐỒ --- */}
      {/* Biểu đồ người dùng theo độ tuổi */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>User Demographics by Age</CardTitle>
        </CardHeader>
        <CardContent>
          <VictoryChart theme={VictoryTheme.material} domainPadding={20} height={250}>
            <VictoryAxis
              tickValues={userAgeData.map(d => d.ageGroup)}
              style={{ tickLabels: { fontSize: 10 } }}
            />
            <VictoryAxis dependentAxis tickFormat={(x) => (`${x}`)} />
            <VictoryBar
              data={userAgeData}
              x="ageGroup"
              y="count"
              style={{ data: { fill: "#8884d8" } }}
              barWidth={30}
            />
          </VictoryChart>
        </CardContent>
      </Card>

      {/* Biểu đồ doanh thu theo loại */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Revenue by Source (Completed)</CardTitle>
        </CardHeader>
        <CardContent>
           <VictoryChart theme={VictoryTheme.material} domainPadding={50} height={250}>
            <VictoryAxis
              tickValues={revenueData.map(d => d.type)}
              style={{ tickLabels: { fontSize: 10 } }}
            />
            <VictoryAxis dependentAxis tickFormat={(x) => (`${(x / 1000).toFixed(0)}K`)} />
            <VictoryBar
              data={revenueData}
              x="type"
              y="revenue"
              style={{ data: { fill: "#22c55e" } }}
              barWidth={50}
            />
          </VictoryChart>
        </CardContent>
      </Card>
    </div>
  );
}