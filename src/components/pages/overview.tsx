// overview.tsx
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProduct } from "@/contexts/product-context";
import { usePayment } from "@/contexts/payment-context";
import { useUser } from "@/contexts/user-context";
import { useOrder } from "@/contexts/order-context";
import { useLog } from "@/contexts/log-context";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryLine, VictoryVoronoiContainer, VictoryLabel } from "victory";
import { Users, Package, ShoppingCart, DollarSign, Loader2, BarChart2, MessageSquare } from "lucide-react";
import { useFeedback } from "@/contexts/feedback-context";

export function Overview() {
  const { products, loading: productLoading } = useProduct();
  const { payments, isLoading: paymentLoading } = usePayment();
  const { users, loading: userLoading } = useUser();
  const { orders, isLoading: orderLoading } = useOrder();
  const { todayVisits, dailyVisits, isLoading: logLoading, error: logError } = useLog();
    const { feedbacks, loading: feedbackLoading } = useFeedback();

  const isLoading = productLoading || paymentLoading || userLoading || orderLoading || logLoading || feedbackLoading;

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
      const today = new Date(); 
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

  const revenueData = useMemo(() => {
    const completedPayments = payments.filter(p => p.status === 1);

    const revenueByCategory = completedPayments.reduce(
      (acc, payment) => {
        if (payment.premiumPackageId !== null) {
          acc.premium += payment.amount;
        } else {
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

  const dailyVisitsChartData = useMemo(() => {
    return dailyVisits.map(visit => ({
      date: new Date(visit.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
      visits: visit.visitCount,
    }));
  }, [dailyVisits]);

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
          <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayVisits?.totalVisits ?? 0}</div>
          <p className="text-xs text-muted-foreground">Lượt truy cập hôm nay</p>
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Feedbacks</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{feedbacks.length}</div>
          <p className="text-xs text-muted-foreground">Tổng số đánh giá từ người dùng</p>
        </CardContent>
      </Card>

      {/* THAY ĐỔI: Biểu đồ lượt truy cập hàng ngày có cùng chiều ngang */}
      <Card className="md:col-span-2"> {/* THAY ĐỔI TẠI ĐÂY: từ md:col-span-4 thành md:col-span-2 */}
        <CardHeader>
          <CardTitle>Daily Website Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyVisitsChartData.length > 0 ? (
            <VictoryChart 
                theme={VictoryTheme.material} 
                height={250} // TRẢ LẠI CHIỀU CAO BAN ĐẦU HOẶC TƯƠNG ĐƯƠNG
                padding={{ top: 20, bottom: 60, left: 50, right: 20 }} // TRẢ LẠI PADDING BAN ĐẦU HOẶC TƯƠNG ĐƯƠNG
                containerComponent={<VictoryVoronoiContainer />}
            >
              <VictoryAxis
                tickValues={dailyVisitsChartData.map(d => d.date)}
                tickFormat={(x) => x}
                style={{
                  tickLabels: { 
                    fontSize: 10, // TRẢ LẠI KÍCH THƯỚC FONT
                    angle: -45, 
                    textAnchor: "end"
                  } 
                }}
              />
              <VictoryAxis dependentAxis tickFormat={(y) => (`${y}`)} />
              <VictoryLine
                data={dailyVisitsChartData}
                x="date"
                y="visits"
                style={{ data: { stroke: "#ffc107" } }}
                labels={({ datum }) => `${datum.visits}`}
                labelComponent={<VictoryLabel renderInPortal dy={-10} style={{ fontSize: 8 }} />} // TRẢ LẠI KÍCH THƯỚC FONT NHÃN
              />
            </VictoryChart>
          ) : (
            <div className="text-center text-muted-foreground h-[250px] flex items-center justify-center"> {/* TRẢ LẠI CHIỀU CAO div */}
              No daily visit data available.
            </div>
          )}
           {logError && (
            <div className="text-red-500 text-sm mt-2 text-center">
                Error fetching log data: {logError}
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}