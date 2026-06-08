import React from "react";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Users, CreditCard, AlertCircle, Activity, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: {
      queryKey: getGetDashboardStatsQueryKey()
    }
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">لوحة التحكم</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "إجمالي المشتركين",
      value: stats.totalParticipants,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "الاشتراكات النشطة",
      value: stats.activeCount,
      icon: Activity,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "الاشتراكات المنتهية",
      value: stats.expiredCount,
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10"
    },
    {
      title: "إجمالي المبالغ المدفوعة",
      value: `${stats.totalAmountPaid} ريال`,
      icon: Banknote,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "إجمالي المبالغ المتبقية",
      value: `${stats.totalAmountRemaining} ريال`,
      icon: CreditCard,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">نظرة عامة</h2>
        <p className="text-muted-foreground mt-1 font-medium">مرحباً بك في لوحة تحكم نادي النخبة</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mt-2">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
