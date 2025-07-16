"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayment } from "@/contexts/payment-context";
import { useUser } from "@/contexts/user-context";
import { useOrder } from "@/contexts/order-context";
import { useLog } from "@/contexts/log-context";
import { useFeedback } from "@/contexts/feedback-context";
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from "victory";
import { Users, ShoppingCart, DollarSign, Loader2, BarChart2, MessageSquare } from "lucide-react";

export function Overview() {
  const { payments, isLoading: paymentLoading } = usePayment();
  const { users, loading: userLoading } = useUser();
  const { orders, isLoading: orderLoading } = useOrder();
  const { todayVisits, dailyVisits, isLoading: logLoading } = useLog();
  const { feedbacks, loading: feedbackLoading } = useFeedback();

  const isLoading = paymentLoading || userLoading || orderLoading || logLoading || feedbackLoading;

  // --- TÍNH TOÁN DỮ LIỆU TỪ PAYMENT CONTEXT ---

  // 1. Doanh thu HÀNG NGÀY từ ĐƠN HÀNG SẢN PHẨM
  const dailyOrderRevenueData = useMemo(() => {
    // Lọc các thanh toán đã thành công (status:1), là của đơn hàng (premiumPackageId:null) và có ngày thanh toán (paidAt)
    const orderPayments = payments.filter(p =>
      p.status == 1 &&
      p.premiumPackageId === null &&
      p.paidAt
    );

    const dailyRevenue = orderPayments.reduce((acc, payment) => {
      const date = new Date(payment.paidAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(dailyRevenue)
      .map(date => ({ date: new Date(date), revenue: dailyRevenue[date] }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [payments]);

  // 2. Doanh thu HÀNG NGÀY từ gói PREMIUM
  const dailyPremiumRevenueData = useMemo(() => {
    // Lọc các thanh toán đã thành công (status:1), là của premium (premiumPackageId != null) và có ngày thanh toán
    const premiumPayments = payments.filter(p =>
      p.status == 1 &&
      p.premiumPackageId !== null &&
      p.paidAt
    );
      
    const dailyRevenue = premiumPayments.reduce((acc, payment) => {
      const date = new Date(payment.paidAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(dailyRevenue)
      .map(date => ({ date: new Date(date), revenue: dailyRevenue[date] }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [payments]);

  // Các phần tính toán khác
  const totalRevenue = useMemo(() => payments.filter(p => p.status == 1).reduce((sum, p) => sum + p.amount, 0), [payments]);
  const userAgeData = useMemo(() => {
    const ageGroups = [
      { label: "<20", min: 0, max: 19 }, { label: "20-29", min: 20, max: 29 },
      { label: "30-39", min: 30, max: 39 }, { label: "40-49", min: 40, max: 49 },
      { label: "50+", min: 50, max: Infinity },
    ];
    const calculateAge = (dob: string) => new Date().getFullYear() - new Date(dob).getFullYear();
    const groupedData = users.reduce((acc, user) => {
      if (!user.dateOfBirth || user.dateOfBirth.startsWith("0001-")) return acc;
      const age = calculateAge(user.dateOfBirth);
      const group = ageGroups.find(g => age >= g.min && age <= g.max)?.label || "Unknown";
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return ageGroups.map(group => ({ ageGroup: group.label, count: groupedData[group.label] || 0 }));
  }, [users]);
  const dailyVisitsChartData = useMemo(() => {
    return dailyVisits.map(visit => ({
      date: new Date(visit.date),
      visits: visit.visitCount,
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [dailyVisits]);


  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  // --- RENDER GIAO DIỆN ---
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* --- CÁC THẺ THÔNG TIN TỔNG QUAN --- */}
      <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalRevenue.toLocaleString("vi-VN")} VND</div><p className="text-xs text-muted-foreground">Completed payments revenue</p></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Today's Visits</CardTitle><BarChart2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{todayVisits?.totalVisits ?? 0}</div><p className="text-xs text-muted-foreground">Total visits today</p></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Feedbacks</CardTitle><MessageSquare className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{feedbacks.length}</div><p className="text-xs text-muted-foreground">Total user feedbacks</p></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Orders</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{orders.length}</div><p className="text-xs text-muted-foreground">Total created orders</p></CardContent></Card>

      {/* --- CÁC BIỂU ĐỒ --- */}
      <Card className="md:col-span-2"><CardHeader><CardTitle>Daily Order Revenue</CardTitle></CardHeader><CardContent>
        {dailyOrderRevenueData.length > 0 ? (
          <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 20 }} height={250} padding={{ top: 20, bottom: 50, left: 60, right: 40 }}>
            <VictoryAxis tickFormat={(x) => new Date(x).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} style={{ tickLabels: { fontSize: 8 } }} />
            <VictoryAxis dependentAxis tickFormat={(y) => `${(y / 1000).toFixed(0)}K`} />
            <VictoryBar data={dailyOrderRevenueData} x="date" y="revenue" style={{ data: { fill: "#8884d8" } }} labels={({ datum }) => `${datum.revenue.toLocaleString('vi-VN')} VND`} labelComponent={<VictoryTooltip dy={-10} cornerRadius={5} flyoutStyle={{ fill: "white", stroke: "#8884d8" }} />} />
          </VictoryChart>
        ) : (<div className="flex h-[250px] items-center justify-center text-muted-foreground">Không có dữ liệu doanh thu đơn hàng.</div>)}
      </CardContent></Card>

      <Card className="md:col-span-2"><CardHeader><CardTitle>Daily Premium Revenue</CardTitle></CardHeader><CardContent>
        {dailyPremiumRevenueData.length > 0 ? (
          <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 20 }} height={250} padding={{ top: 20, bottom: 50, left: 60, right: 40 }}>
            <VictoryAxis tickFormat={(x) => new Date(x).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} style={{ tickLabels: { fontSize: 8 } }}/>
            <VictoryAxis dependentAxis tickFormat={(y) => `${(y / 1000).toFixed(0)}K`} />
            <VictoryBar data={dailyPremiumRevenueData} x="date" y="revenue" style={{ data: { fill: "#22c55e" } }} labels={({ datum }) => `${datum.revenue.toLocaleString('vi-VN')} VND`} labelComponent={<VictoryTooltip dy={-10} cornerRadius={5} flyoutStyle={{ fill: "white", stroke: "#22c55e" }} />} />
          </VictoryChart>
        ) : (<div className="flex h-[250px] items-center justify-center text-muted-foreground">Không có dữ liệu doanh thu premium.</div>)}
      </CardContent></Card>

      <Card className="md:col-span-2"><CardHeader><CardTitle>User Demographics by Age</CardTitle></CardHeader><CardContent>
        <VictoryChart theme={VictoryTheme.material} domainPadding={20} height={250}>
          <VictoryAxis tickValues={userAgeData.map((d) => d.ageGroup)} style={{ tickLabels: { fontSize: 10 } }} />
          <VictoryAxis dependentAxis tickFormat={(x) => `${x}`} />
          <VictoryBar data={userAgeData} x="ageGroup" y="count" style={{ data: { fill: "#ffc658" } }} barWidth={30} labels={({ datum }) => datum.count} labelComponent={<VictoryTooltip dy={0} cornerRadius={5} />} />
        </VictoryChart>
      </CardContent></Card>
      
      <Card className="md:col-span-2"><CardHeader><CardTitle>Daily Website Visits</CardTitle></CardHeader><CardContent>
          <VictoryChart theme={VictoryTheme.material} height={250} padding={{ top: 20, bottom: 50, left: 60, right: 30 }} containerComponent={<VictoryVoronoiContainer />}>
            <VictoryAxis tickFormat={(x) => new Date(x).toLocaleDateString("vi-VN", { month: "short", day: "numeric" })} style={{ tickLabels: { fontSize: 8, angle: -45, textAnchor: 'end' } }} />
            <VictoryAxis dependentAxis tickFormat={(y) => `${y}`} />
            <VictoryBar data={dailyVisitsChartData} x="date" y="visits" style={{ data: { fill: "#ff7300" } }} labels={({ datum }) => datum.visits} labelComponent={<VictoryTooltip dy={-10} cornerRadius={5} flyoutStyle={{ fill: "white", stroke: "#ff7300" }} />} />
          </VictoryChart>
      </CardContent></Card>
    </div>
  );
}